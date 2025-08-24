
import { Type } from "@google/genai";

// Enhanced AI tools for robust development environment
export const aiTools = [
  {
    name: "list_files",
    description: "List all files and directories within a specified directory. Use '.' for the root directory.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        directory_path: {
          type: Type.STRING,
          description: "The path to the directory to inspect.",
        },
      },
      required: ["directory_path"],
    },
  },
  {
    name: "read_file",
    description: "Read the full contents of a single file. Returns error message if file doesn't exist.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        file_path: {
          type: Type.STRING,
          description: "The path to the file to be read.",
        },
      },
      required: ["file_path"],
    },
  },
  {
    name: "write_file",
    description: "Write content to a file. Creates file if it doesn't exist, overwrites if it does. Automatically opens in editor.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        file_path: {
          type: Type.STRING,
          description: "The path of the file to be written to.",
        },
        content: {
          type: Type.STRING,
          description: "The new content to write to the file.",
        },
      },
      required: ["file_path", "content"],
    },
  },
  {
    name: "modify_file",
    description: "Modify specific lines or sections of a file without overwriting the entire content. Useful for targeted edits.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        file_path: {
          type: Type.STRING,
          description: "The path to the file to modify.",
        },
        search_text: {
          type: Type.STRING,
          description: "The text to find and replace (exact match).",
        },
        replacement_text: {
          type: Type.STRING,
          description: "The text to replace it with.",
        },
      },
      required: ["file_path", "search_text", "replacement_text"],
    },
  },
  {
    name: "create_directory",
    description: "Create a new, empty directory at the specified path. Creates parent directories if needed.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            directory_path: {
                type: Type.STRING,
                description: "The path for the new directory.",
            },
        },
        required: ["directory_path"],
    },
  },
  {
    name: "delete_file_or_directory",
    description: "Delete a file or directory. Use with caution - operation cannot be undone.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            path: {
                type: Type.STRING,
                description: "The path to the file or directory to delete.",
            },
        },
        required: ["path"],
    },
  },
  {
    name: "copy_file_or_directory",
    description: "Copy a file or directory to another location. Useful for duplicating or backing up files.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        source_path: {
          type: Type.STRING,
          description: "The path to the source file or directory.",
        },
        destination_path: {
          type: Type.STRING,
          description: "The path where to copy the file or directory.",
        },
      },
      required: ["source_path", "destination_path"],
    },
  },
  {
    name: "move_file_or_directory",
    description: "Move/rename a file or directory. Can be used for both moving to different location and renaming.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        source_path: {
          type: Type.STRING,
          description: "The current path of the file or directory.",
        },
        destination_path: {
          type: Type.STRING,
          description: "The new path for the file or directory.",
        },
      },
      required: ["source_path", "destination_path"],
    },
  },
  {
    name: "detect_project_type",
    description: "Analyze the project structure to detect the project type and suggest appropriate development setup.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        root_directory: {
          type: Type.STRING,
          description: "The root directory to analyze (usually '.').",
        },
      },
      required: ["root_directory"],
    },
  },
  {
    name: "create_project_scaffold",
    description: "Generate a complete project structure based on the specified project type (react, python, node, etc.).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        project_type: {
          type: Type.STRING,
          description: "The type of project to create (react, python, node, html, etc.).",
        },
        project_name: {
          type: Type.STRING,
          description: "The name of the project.",
        },
        target_directory: {
          type: Type.STRING,
          description: "Directory where to create the project (use '.' for current directory).",
        },
      },
      required: ["project_type", "project_name", "target_directory"],
    },
  },
  {
    name: "search_in_files",
    description: "Search for text patterns across multiple files in the project. Useful for finding code references or patterns.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        search_pattern: {
          type: Type.STRING,
          description: "The text pattern to search for.",
        },
        directory: {
          type: Type.STRING,
          description: "Directory to search in (use '.' for root).",
        },
        file_extensions: {
          type: Type.STRING,
          description: "Comma-separated file extensions to search (e.g., 'js,ts,jsx,tsx'). Leave empty for all files.",
        },
      },
      required: ["search_pattern", "directory"],
    },
  },
  {
    name: "execute_terminal_command",
    description: "Execute a command in the terminal. Limited to basic file operations currently, but provides feedback.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        command: {
          type: Type.STRING,
          description: "The command to execute (e.g., 'ls -l', 'cat file.txt').",
        },
      },
      required: ["command"],
    },
  },
  {
    name: "get_file_info",
    description: "Get detailed information about a file or directory (size, type, last modified, etc.).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        path: {
          type: Type.STRING,
          description: "Path to the file or directory to inspect.",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "validate_syntax",
    description: "Validate syntax for code files and provide error information if syntax is invalid.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        file_path: {
          type: Type.STRING,
          description: "Path to the code file to validate.",
        },
        language: {
          type: Type.STRING,
          description: "Programming language (javascript, typescript, python, html, css, etc.).",
        },
      },
      required: ["file_path", "language"],
    },
  },
  {
    name: "format_code",
    description: "Format code in a file according to standard conventions for the language.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        file_path: {
          type: Type.STRING,
          description: "Path to the code file to format.",
        },
        language: {
          type: Type.STRING,
          description: "Programming language for formatting rules.",
        },
      },
      required: ["file_path", "language"],
    },
  },
  {
    name: "install_package",
    description: "Install npm packages using the real package manager. Works with WebContainer for actual package installation.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        packages: {
          type: Type.STRING,
          description: "Space-separated list of packages to install (e.g., 'react react-dom' or 'express')",
        },
        dev: {
          type: Type.STRING,
          description: "Set to 'true' to install as dev dependencies, 'false' or omit for regular dependencies",
        },
        manager: {
          type: Type.STRING,
          description: "Package manager to use: 'npm', 'yarn', or 'pnpm'. Defaults to 'npm'",
        },
      },
      required: ["packages"],
    },
  },
  {
    name: "run_script",
    description: "Run npm scripts defined in package.json (like 'start', 'build', 'test', etc.)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        script_name: {
          type: Type.STRING,
          description: "Name of the script to run (e.g., 'start', 'build', 'dev', 'test')",
        },
        args: {
          type: Type.STRING,
          description: "Additional arguments to pass to the script (optional)",
        },
      },
      required: ["script_name"],
    },
  },
  {
    name: "start_dev_server",
    description: "Start development server for various project types (React, Node.js, static files, etc.)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        project_type: {
          type: Type.STRING,
          description: "Type of project: 'react', 'node', 'static', 'vite', 'webpack'",
        },
        port: {
          type: Type.STRING,
          description: "Port number to run on (optional, will auto-assign if not provided)",
        },
        command: {
          type: Type.STRING,
          description: "Custom command to run (optional, will use defaults based on project type)",
        },
      },
      required: ["project_type"],
    },
  },
  {
    name: "manage_processes",
    description: "Manage running processes (view, stop, restart development servers and other processes)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: {
          type: Type.STRING,
          description: "Action to perform: 'list', 'stop', 'restart'",
        },
        process_id: {
          type: Type.STRING,
          description: "Process ID to stop or restart (only needed for 'stop' and 'restart' actions)",
        },
      },
      required: ["action"],
    },
  },
];


// This function maps the AI's tool call to our application's functions
export const toolExecutor = async (toolName: string, args: any, appContext: any): Promise<any> => {
    try {
        switch (toolName) {
            case "list_files": {
                const files = appContext.listFiles(args.directory_path);
                return files ? files.join('\n') : `Error: Directory not found at '${args.directory_path}'`;
            }
            
            case "read_file": {
                const content = appContext.readFile(args.file_path);
                return content !== null ? content : `Error: File not found at '${args.file_path}'`;
            }

            case "write_file": {
                const success = appContext.writeFile(args.file_path, args.content);
                if (success) {
                    appContext.setActiveFilePath(args.file_path);
                    appContext.setActiveView('editor');
                    return `Successfully wrote to ${args.file_path}`;
                }
                return `Error: Failed to write to ${args.file_path}`;
            }

            case "modify_file": {
                const currentContent = appContext.readFile(args.file_path);
                if (currentContent === null) {
                    return `Error: File not found at '${args.file_path}'`;
                }
                
                if (!currentContent.includes(args.search_text)) {
                    return `Error: Search text not found in ${args.file_path}`;
                }
                
                const newContent = currentContent.replace(args.search_text, args.replacement_text);
                const success = appContext.writeFile(args.file_path, newContent);
                if (success) {
                    appContext.setActiveFilePath(args.file_path);
                    appContext.setActiveView('editor');
                    return `Successfully modified ${args.file_path}`;
                }
                return `Error: Failed to modify ${args.file_path}`;
            }
            
            case "create_directory": {
                const dirSuccess = appContext.createDirectory(args.directory_path);
                return dirSuccess ? `Successfully created directory ${args.directory_path}` : `Error: Failed to create directory ${args.directory_path}`;
            }

            case "delete_file_or_directory": {
                const result = appContext.deleteNode(args.path);
                return result.success ? `Successfully deleted ${args.path}` : `Error: ${result.error}`;
            }

            case "copy_file_or_directory": {
                const result = appContext.copyNode(args.source_path, args.destination_path);
                return result.success ? `Successfully copied ${args.source_path} to ${args.destination_path}` : `Error: ${result.error}`;
            }

            case "move_file_or_directory": {
                const result = appContext.moveNode(args.source_path, args.destination_path);
                if (result.success) {
                    // Update active file path if it was moved
                    if (appContext.activeFilePath === args.source_path) {
                        appContext.setActiveFilePath(args.destination_path);
                    }
                    return `Successfully moved ${args.source_path} to ${args.destination_path}`;
                }
                return `Error: ${result.error}`;
            }

            case "detect_project_type": {
                const files = appContext.listFiles(args.root_directory);
                if (!files) {
                    return `Error: Directory not found at '${args.root_directory}'`;
                }

                let projectType = "unknown";
                let suggestions = [];

                if (files.includes("package.json")) {
                    const packageContent = appContext.readFile("package.json");
                    if (packageContent) {
                        try {
                            const packageJson = JSON.parse(packageContent);
                            if (packageJson.dependencies?.react || packageJson.devDependencies?.react) {
                                projectType = "React";
                                suggestions.push("This is a React project. You can use npm/yarn commands for package management.");
                            } else if (packageJson.dependencies?.express || packageJson.devDependencies?.express) {
                                projectType = "Node.js/Express";
                                suggestions.push("This is a Node.js Express project.");
                            } else {
                                projectType = "Node.js";
                                suggestions.push("This is a Node.js project.");
                            }
                        } catch (e) {
                            suggestions.push("Found package.json but couldn't parse it.");
                        }
                    }
                } else if (files.includes("requirements.txt") || files.includes("pyproject.toml") || files.some(f => f.endsWith(".py"))) {
                    projectType = "Python";
                    suggestions.push("This is a Python project. You can use pip for package management.");
                } else if (files.includes("index.html") && files.some(f => f.endsWith(".css") || f.endsWith(".js"))) {
                    projectType = "HTML/CSS/JavaScript";
                    suggestions.push("This is a web project with HTML/CSS/JavaScript.");
                } else if (files.includes("Cargo.toml")) {
                    projectType = "Rust";
                    suggestions.push("This is a Rust project.");
                } else if (files.includes("go.mod")) {
                    projectType = "Go";
                    suggestions.push("This is a Go project.");
                }

                return `Project Type: ${projectType}\n\nFiles found: ${files.join(", ")}\n\nSuggestions:\n${suggestions.join("\n")}`;
            }

            case "create_project_scaffold": {
                return await createProjectScaffold(args.project_type, args.project_name, args.target_directory, appContext);
            }

            case "search_in_files": {
                const searchResults = [];
                const searchInDirectory = (dirPath: string) => {
                    const files = appContext.listFiles(dirPath);
                    if (!files) return;

                    files.forEach(fileName => {
                        const filePath = dirPath === '.' ? fileName : `${dirPath}/${fileName}`;
                        const node = appContext.findNode(filePath);
                        
                        if (node?.type === 'file') {
                            // Check file extension filter
                            if (args.file_extensions) {
                                const extensions = args.file_extensions.split(',').map(ext => ext.trim().toLowerCase());
                                const fileExt = fileName.split('.').pop()?.toLowerCase();
                                if (!fileExt || !extensions.includes(fileExt)) {
                                    return;
                                }
                            }
                            
                            const content = appContext.readFile(filePath);
                            if (content && content.includes(args.search_pattern)) {
                                const lines = content.split('\n');
                                lines.forEach((line, index) => {
                                    if (line.includes(args.search_pattern)) {
                                        searchResults.push(`${filePath}:${index + 1}: ${line.trim()}`);
                                    }
                                });
                            }
                        } else if (node?.type === 'directory') {
                            searchInDirectory(filePath);
                        }
                    });
                };

                searchInDirectory(args.directory);
                return searchResults.length > 0 ? searchResults.join('\n') : `No matches found for "${args.search_pattern}"`;
            }
            
            case "execute_terminal_command": {
                const output = await appContext.executeTerminalCommand(args.command);
                return `Command executed. Output:\n${output}`;
            }

            case "get_file_info": {
                const node = appContext.findNode(args.path);
                if (!node) {
                    return `Error: Path not found: ${args.path}`;
                }

                if (node.type === 'file') {
                    const content = appContext.readFile(args.path);
                    const size = content ? content.length : 0;
                    const lines = content ? content.split('\n').length : 0;
                    return `File: ${args.path}\nType: ${node.type}\nSize: ${size} bytes\nLines: ${lines}`;
                } else {
                    const files = appContext.listFiles(args.path);
                    const fileCount = files ? files.length : 0;
                    return `Directory: ${args.path}\nType: ${node.type}\nContains: ${fileCount} items`;
                }
            }

            case "validate_syntax": {
                const content = appContext.readFile(args.file_path);
                if (content === null) {
                    return `Error: File not found at '${args.file_path}'`;
                }

                // Basic syntax validation based on language
                const errors = [];
                switch (args.language.toLowerCase()) {
                    case 'javascript':
                    case 'typescript':
                        try {
                            // Basic JS/TS validation - check for common syntax errors
                            const lines = content.split('\n');
                            lines.forEach((line, index) => {
                                // Check for unmatched brackets
                                const openBrackets = (line.match(/[\{\[\(]/g) || []).length;
                                const closeBrackets = (line.match(/[\}\]\)]/g) || []).length;
                                if (openBrackets !== closeBrackets && !line.trim().endsWith(',') && !line.trim().endsWith(';')) {
                                    // This is a simple check - real syntax validation would be more complex
                                }
                                // Check for missing semicolons in statements
                                if (line.trim().match(/^(let|const|var|return|throw)\s+.*[^;{}\s]$/) && !line.includes('//')) {
                                    errors.push(`Line ${index + 1}: Consider adding semicolon`);
                                }
                            });
                        } catch (e) {
                            errors.push(`Syntax error: ${e}`);
                        }
                        break;
                    case 'json':
                        try {
                            JSON.parse(content);
                        } catch (e: any) {
                            errors.push(`JSON syntax error: ${e.message}`);
                        }
                        break;
                    default:
                        return `Syntax validation for ${args.language} is not yet implemented`;
                }

                return errors.length > 0 ? `Syntax issues found:\n${errors.join('\n')}` : `No syntax errors found in ${args.file_path}`;
            }

            case "format_code": {
                const content = appContext.readFile(args.file_path);
                if (content === null) {
                    return `Error: File not found at '${args.file_path}'`;
                }

                // Basic code formatting based on language
                let formattedContent = content;
                switch (args.language.toLowerCase()) {
                    case 'javascript':
                    case 'typescript':
                        // Basic JS/TS formatting
                        formattedContent = content
                            .split('\n')
                            .map(line => line.replace(/\s+$/, '')) // Remove trailing whitespace
                            .join('\n')
                            .replace(/;\s*\n/g, ';\n') // Normalize semicolons
                            .replace(/{\s*\n/g, '{\n') // Normalize opening braces
                            .replace(/}\s*\n/g, '}\n'); // Normalize closing braces
                        break;
                    case 'json':
                        try {
                            const parsed = JSON.parse(content);
                            formattedContent = JSON.stringify(parsed, null, 2);
                        } catch (e) {
                            return `Error: Cannot format invalid JSON in ${args.file_path}`;
                        }
                        break;
                    default:
                        return `Code formatting for ${args.language} is not yet implemented`;
                }

                const success = appContext.writeFile(args.file_path, formattedContent);
                if (success) {
                    appContext.setActiveFilePath(args.file_path);
                    return `Successfully formatted ${args.file_path}`;
                }
                return `Error: Failed to write formatted content to ${args.file_path}`;
            }

            default:
                return `Error: Unknown tool '${toolName}'. Available tools: ${aiTools.map(t => t.name).join(', ')}`;
        }
    } catch (error: any) {
        return `Error executing tool '${toolName}': ${error.message || error}`;
    }
}

// Helper function to create project scaffolds
const createProjectScaffold = async (projectType: string, projectName: string, targetDirectory: string, appContext: any): Promise<string> => {
    const basePath = targetDirectory === '.' ? projectName : `${targetDirectory}/${projectName}`;
    
    try {
        // Create project directory
        const dirSuccess = appContext.createDirectory(basePath);
        if (!dirSuccess) {
            return `Error: Failed to create project directory ${basePath}`;
        }

        switch (projectType.toLowerCase()) {
            case 'react':
                return createReactScaffold(basePath, projectName, appContext);
            case 'python':
                return createPythonScaffold(basePath, projectName, appContext);
            case 'node':
            case 'nodejs':
                return createNodeScaffold(basePath, projectName, appContext);
            case 'html':
            case 'web':
                return createHtmlScaffold(basePath, projectName, appContext);
            default:
                return `Error: Unknown project type '${projectType}'. Supported types: react, python, node, html`;
        }
    } catch (error: any) {
        return `Error creating project scaffold: ${error.message || error}`;
    }
}

const createReactScaffold = (basePath: string, projectName: string, appContext: any): string => {
    const files = [
        {
            path: `${basePath}/package.json`,
            content: JSON.stringify({
                name: projectName,
                version: "0.1.0",
                private: true,
                dependencies: {
                    "react": "^18.2.0",
                    "react-dom": "^18.2.0",
                    "react-scripts": "5.0.1"
                },
                scripts: {
                    "start": "react-scripts start",
                    "build": "react-scripts build",
                    "test": "react-scripts test",
                    "eject": "react-scripts eject"
                }
            }, null, 2)
        },
        {
            path: `${basePath}/public/index.html`,
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${projectName}</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>`
        },
        {
            path: `${basePath}/src/index.js`,
            content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`
        },
        {
            path: `${basePath}/src/App.js`,
            content: `import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Welcome to ${projectName}</h1>
      <p>Your React app is ready to go!</p>
    </div>
  );
}

export default App;`
        }
    ];

    // Create directories
    appContext.createDirectory(`${basePath}/public`);
    appContext.createDirectory(`${basePath}/src`);

    // Create files
    files.forEach(file => {
        appContext.writeFile(file.path, file.content);
    });

    return `Successfully created React project '${projectName}' at ${basePath}`;
}

const createPythonScaffold = (basePath: string, projectName: string, appContext: any): string => {
    const files = [
        {
            path: `${basePath}/main.py`,
            content: `#!/usr/bin/env python3
"""
${projectName} - A Python project
"""

def main():
    print("Hello from ${projectName}!")
    print("Your Python project is ready!")

if __name__ == "__main__":
    main()`
        },
        {
            path: `${basePath}/requirements.txt`,
            content: `# Add your Python dependencies here
# Example:
# requests>=2.25.1
# flask>=2.0.1`
        },
        {
            path: `${basePath}/README.md`,
            content: `# ${projectName}

A Python project created with PocketCode.

## Setup

1. Install dependencies:
   \`\`\`
   pip install -r requirements.txt
   \`\`\`

2. Run the project:
   \`\`\`
   python main.py
   \`\`\``
        }
    ];

    files.forEach(file => {
        appContext.writeFile(file.path, file.content);
    });

    return `Successfully created Python project '${projectName}' at ${basePath}`;
}

const createNodeScaffold = (basePath: string, projectName: string, appContext: any): string => {
    const files = [
        {
            path: `${basePath}/package.json`,
            content: JSON.stringify({
                name: projectName,
                version: "1.0.0",
                description: `${projectName} - A Node.js project`,
                main: "index.js",
                scripts: {
                    "start": "node index.js",
                    "dev": "nodemon index.js"
                },
                dependencies: {},
                devDependencies: {
                    "nodemon": "^2.0.20"
                }
            }, null, 2)
        },
        {
            path: `${basePath}/index.js`,
            content: `// ${projectName} - Node.js Application
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to ${projectName}!',
        status: 'Your Node.js app is ready!'
    });
});

app.listen(port, () => {
    console.log(\`Server running on port \${port}\`);
});`
        }
    ];

    files.forEach(file => {
        appContext.writeFile(file.path, file.content);
    });

    return `Successfully created Node.js project '${projectName}' at ${basePath}`;
}

const createHtmlScaffold = (basePath: string, projectName: string, appContext: any): string => {
    const files = [
        {
            path: `${basePath}/index.html`,
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to ${projectName}</h1>
        <p>Your web project is ready!</p>
        <button onclick="showAlert()">Click me!</button>
    </div>
    <script src="script.js"></script>
</body>
</html>`
        },
        {
            path: `${basePath}/styles.css`,
            content: `/* ${projectName} Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f4f4f4;
}

.container {
    max-width: 800px;
    margin: 50px auto;
    padding: 20px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    text-align: center;
}

h1 {
    color: #2c3e50;
    margin-bottom: 20px;
}

button {
    background: #3498db;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 20px;
}

button:hover {
    background: #2980b9;
}`
        },
        {
            path: `${basePath}/script.js`,
            content: `// ${projectName} JavaScript
console.log('${projectName} loaded successfully!');

function showAlert() {
    alert('Hello from ${projectName}! Your web project is working!');
}

// Add your JavaScript code here
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, ${projectName} is ready!');
});`
        }
    ];

    files.forEach(file => {
        appContext.writeFile(file.path, file.content);
    });

    return `Successfully created HTML/CSS/JS project '${projectName}' at ${basePath}`;
}
