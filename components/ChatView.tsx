import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { sendChatToAI } from '../services/aiService';
import { 
    UserIcon, AIIcon, SendIcon, SpinnerIcon, 
    MicrophoneIcon, StopIcon, VisualAssistantIcon
} from './icons';
import type { ChatMessage } from '../types';
import LeftMenu from './LeftMenu';
import RightMenu from './RightMenu';

// Add SpeechRecognition types to window
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface ChatViewProps {
    toggleVisualAssistant: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ toggleVisualAssistant }) => {
  const appContext = useAppContext();
  const { chatHistory, addChatMessage, settings } = appContext;

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Text-to-Speech for AI responses
  useEffect(() => {
    const lastMessage = chatHistory[chatHistory.length - 1];
    if (lastMessage && lastMessage.sender === 'ai' && settings.isTTSenabled) {
      speechSynthesis.cancel(); // Cancel any previous speech
      const utterance = new SpeechSynthesisUtterance(lastMessage.text);
      speechSynthesis.speak(utterance);
    }
  }, [chatHistory, settings.isTTSenabled]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setUserInput(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (isRecording) {
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;
  }, []); // Run only once

  const handleToggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setUserInput('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSendMessage = async () => {
    const trimmedInput = userInput.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user' as const, text: trimmedInput, type: 'message' };
    addChatMessage(userMessage);
    setUserInput('');
    setIsLoading(true);

    try {
      await sendChatToAI(trimmedInput, chatHistory, appContext);
    } catch (error) {
      const errorMessage: ChatMessage = { 
        sender: 'ai' as const, 
        text: 'Sorry, I encountered an error. Please check the console for details.',
        type: 'message'
      };
      addChatMessage(errorMessage);
      console.error('Error in AI agent interaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-gray-900">
      <LeftMenu />
      <div className="flex flex-col flex-grow p-4 overflow-hidden">
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-4 space-y-6">
          {chatHistory.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                  <p>Start a conversation with the AI assistant.</p>
                  <p className="text-sm">Ask it to build something, use your voice, or launch the Visual Assistant.</p>
              </div>
          )}
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-800 flex items-center justify-center"><AIIcon className="w-5 h-5 text-cyan-300"/></div>}
              
              {msg.type === 'action' ? (
                <div className="max-w-xl p-3 rounded-lg text-sm text-gray-400 italic">
                  🤖 {msg.text}
                </div>
              ) : (
                <div className={`max-w-xl p-4 rounded-xl shadow ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                  {msg.image && <img src={msg.image} alt="User capture" className="rounded-lg mb-2 max-w-sm" />}
                  {msg.text && <pre className="whitespace-pre-wrap font-sans text-sm">{msg.text}</pre>}
                </div>
              )}
               {msg.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"><UserIcon className="w-5 h-5 text-gray-300"/></div>}
            </div>
          ))}
          {isLoading && (
              <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-800 flex items-center justify-center"><AIIcon className="w-5 h-5 text-cyan-300"/></div>
                  <div className="max-w-xl p-4 rounded-xl shadow bg-gray-700 text-gray-200 rounded-bl-none flex items-center">
                      <SpinnerIcon className="animate-spin w-5 h-5 mr-2" />
                      <span>Thinking...</span>
                  </div>
              </div>
          )}
        </div>
        
        <div className="mt-4 flex-shrink-0">
          <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg p-2">
            <button onClick={handleToggleRecording} title={isRecording ? 'Stop Recording' : 'Use Voice'} className={`p-2 rounded-md hover:bg-gray-700 transition-colors ${isRecording ? 'text-red-500' : 'text-gray-400'}`}>
                {isRecording ? <StopIcon className="w-5 h-5"/> : <MicrophoneIcon className="w-5 h-5"/>}
            </button>
            <button onClick={toggleVisualAssistant} title={'Activate Visual Assistant'} className={`p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400`}>
                <VisualAssistantIcon className="w-5 h-5"/>
            </button>
             <div className="w-px h-6 bg-gray-600 mx-1"></div>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me to code, or use the icons..."
              className="flex-grow bg-transparent text-gray-200 focus:outline-none px-2"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
              className="p-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <SendIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      <RightMenu />
    </div>
  );
};

export default ChatView;
