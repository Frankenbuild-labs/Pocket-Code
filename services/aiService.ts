import { GoogleGenAI, Chat, GenerateContentResponse, Type, Part } from "@google/genai";
import type { ChatMessage, FileSystemTree, Directory } from '../types';
import { aiTools, toolExecutor } from './aiTools';
import { AI_UI_CODER_PROMPT } from '../constants';

// AppContext interface to avoid circular dependency
interface AppContextForAI {
  addChatMessage: (message: ChatMessage) => void;
  settings: {
      systemPrompt: string;
  };
  replaceFileSystem: (newTree: FileSystemTree) => void;
  [key: string]: any; // Allow other properties
}

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const model = 'gemini-2.5-flash';

// A single, stateful chat session for the main coding agent
let chat: Chat | null = null;
let currentSystemPrompt: string | null = null;

const initializeChat = (systemInstruction: string) => {
    chat = ai.chats.create({
        model: model,
        config: {
            systemInstruction,
            tools: [{ functionDeclarations: aiTools }],
        },
    });
    currentSystemPrompt = systemInstruction;
}

export const sendChatToAI = async (
  userInput: string,
  history: ChatMessage[],
  appContext: AppContextForAI,
): Promise<void> => {
    
  if (!API_KEY) {
    appContext.addChatMessage({ sender: 'ai', text: "Error: API key is not configured.", type: 'message' });
    return;
  }

  // If chat is not initialized, or if the system prompt has changed, re-initialize.
  if (!chat || currentSystemPrompt !== appContext.settings.systemPrompt) {
    initializeChat(appContext.settings.systemPrompt);
  }

  try {
    let response: GenerateContentResponse = await chat!.sendMessage({
        message: userInput,
    });

    while (true) {
        const toolCalls = response.functionCalls;
        
        if (!toolCalls || toolCalls.length === 0) {
            // No more tool calls, this is the final text response
            const finalText = response.text;
            if (finalText) {
                appContext.addChatMessage({ sender: 'ai', text: finalText, type: 'message' });
            }
            break;
        }

        // Execute all tool calls in parallel
        const toolExecutionPromises = toolCalls.map(async (toolCall) => {
            const { name, args } = toolCall;
            appContext.addChatMessage({ sender: 'ai', text: `Executing tool: ${name}(${Object.values(args).map(v => `'${v}'`).join(', ')})`, type: 'action' });

            const toolResult = await toolExecutor(name, args, appContext);

            return {
                toolCall,
                toolResult
            };
        });

        const executedTools = await Promise.all(toolExecutionPromises);

        // Send results back to the model
        response = await chat!.sendMessage({
          message: executedTools.map(({ toolCall, toolResult }) => ({
            functionResponse: {
              name: toolCall.name,
              response: { result: toolResult },
            },
          })),
        });
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    appContext.addChatMessage({ sender: 'ai', text: "An error occurred while communicating with the AI. Please check the console for details.", type: 'message' });
  }
};

const VISUAL_SYSTEM_PROMPT = `You are an expert UI/UX designer and frontend developer. Your role is to analyze screenshots of a user's web application.
Based on the image provided, you must:
1.  Provide constructive feedback on the design, layout, color scheme, and typography.
2.  Identify potential usability and accessibility issues.
3.  Suggest concrete improvements, including code snippets (HTML/CSS/JS) if applicable, to resolve the identified issues.
4.  Answer any specific questions the user has about the UI in the image.
Your feedback should be clear, concise, and actionable.`;

let visualChat: Chat | null = null;

const initializeVisualChat = () => {
    visualChat = ai.chats.create({
        model: model,
        config: {
            systemInstruction: VISUAL_SYSTEM_PROMPT,
        },
    });
}

export const sendVisualChatToAI = async (
    userInput: string,
    image: string, // non-optional base64 string
    addMessageToHistory: (message: ChatMessage) => void
): Promise<void> => {
    if (!API_KEY) {
        addMessageToHistory({ sender: 'ai', text: "Error: API key is not configured.", type: 'message' });
        return;
    }

    if (!visualChat) {
        initializeVisualChat();
    }

    try {
        const base64Data = image.split(',')[1];
        if (!base64Data) {
            throw new Error("Invalid image data provided.");
        }

        const imagePart: Part = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data,
            }
        };
        const textPart: Part = { text: userInput };

        const response: GenerateContentResponse = await visualChat!.sendMessage({
            message: [textPart, imagePart]
        });

        const finalText = response.text;
        if (finalText) {
            addMessageToHistory({ sender: 'ai', text: finalText, type: 'message' });
        }

    } catch (error) {
        console.error("Error calling Visual Gemini API:", error);
        addMessageToHistory({ sender: 'ai', text: "An error occurred while communicating with the visual AI. Please check the console.", type: 'message' });
    }
}


export const generatePlan = async (goal: string, fileStructure: string): Promise<string[]> => {
    if (!API_KEY) {
        console.error("API_KEY environment variable not set.");
        throw new Error("API key is not configured.");
    }
    const planAI = new GoogleGenAI({ apiKey: API_KEY! });

    const prompt = `You are a senior software engineer acting as a project planner.
The user has the following goal: "${goal}".

Current project structure:
${fileStructure}

Based on the user's goal and the project structure, create a concise, step-by-step plan. Each step should be a clear, actionable task for a developer.
The plan should be broken down into small, manageable steps.
`;

    try {
        const response = await planAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        plan: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "A single step in the development plan.",
                            },
                        },
                    },
                    required: ["plan"],
                },
            },
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        return result.plan || [];

    } catch (error) {
        console.error("Error generating plan with Gemini API:", error);
        throw new Error("Failed to generate a plan. Please check the console for details.");
    }
};

const parseGeneratedCodeToTree = (codeBlock: string): FileSystemTree => {
    const newFileSystem: FileSystemTree = { type: 'directory', children: {} };
    const fileRegex = /--- ([\w./-]+) ---\n([\s\S]*?)(?=\n--- [\w./-]+ ---|$)/g;
    let match;
    const files = new Map<string, string>();

    // First pass to extract README.md and folder structure, then files
    const readmeRegex = /^(#[\s\S]*?)(?=project_root\/|--- [\w./-]+ ---)/;
    const readmeMatch = codeBlock.match(readmeRegex);
    if (readmeMatch) {
        files.set('README.md', readmeMatch[0].trim());
    }

    while ((match = fileRegex.exec(codeBlock)) !== null) {
        const path = match[1].trim().replace(/^project_root\//, '');
        const content = match[2].trim();
        files.set(path, content);
    }
    
    if (files.size === 0) {
        throw new Error("Could not parse the AI's response into files. The format might be incorrect.");
    }

    for (const [path, content] of files.entries()) {
        if (!path) continue;
        const pathParts = path.split('/').filter(p => p);
        let currentLevel: Directory = newFileSystem;

        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            const isLastPart = i === pathParts.length - 1;

            if (isLastPart) {
                currentLevel.children[part] = { type: 'file', content: content };
            } else {
                if (!currentLevel.children[part]) {
                    currentLevel.children[part] = { type: 'directory', children: {} };
                }
                if (currentLevel.children[part].type !== 'directory') {
                    console.error(`Path conflict: trying to create directory '${part}' but a file already exists.`);
                    break;
                }
                currentLevel = currentLevel.children[part] as Directory;
            }
        }
    }
    return newFileSystem;
};

export const generateCodeFromImage = async (
    base64Image: string,
): Promise<FileSystemTree> => {
    if (!API_KEY) {
        throw new Error("API key is not configured.");
    }

    const mimeTypeMatch = base64Image.match(/^data:(image\/[a-z]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
    
    const base64Data = base64Image.split(',')[1];
    if (!base64Data) {
        throw new Error("Invalid image data provided.");
    }

    const imagePart: Part = {
        inlineData: {
            mimeType,
            data: base64Data,
        }
    };

    const textPart: Part = { text: AI_UI_CODER_PROMPT };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [textPart, imagePart] },
        });

        const generatedCodeBlock = response.text;
        const fileTree = parseGeneratedCodeToTree(generatedCodeBlock);
        return fileTree;

    } catch (error) {
        console.error("Error generating code from image:", error);
        throw new Error("Failed to generate code from the image. Please check the console for details.");
    }
};
