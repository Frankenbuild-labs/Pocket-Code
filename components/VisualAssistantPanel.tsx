import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendVisualChatToAI } from '../services/aiService';
import type { ChatMessage } from '../types';
import { AIIcon, UserIcon, SpinnerIcon, CloseIcon, SendIcon } from './icons';

interface VisualAssistantPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const DraggableHeader: React.FC<{ onDrag: (dx: number, dy: number) => void, children: React.ReactNode }> = ({ onDrag, children }) => {
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        lastPos.current = { x: e.clientX, y: e.clientY };
        onDrag(dx, dy);
    }, [onDrag]);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    return (
        <div onMouseDown={handleMouseDown} style={{ cursor: 'move' }}>
            {children}
        </div>
    );
};


const VisualAssistantPanel: React.FC<VisualAssistantPanelProps> = ({ isOpen, onClose }) => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth - 520, y: 80 });
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const handleDrag = useCallback((dx: number, dy: number) => {
        setPosition(pos => ({ x: pos.x + dx, y: pos.y + dy }));
    }, []);

    const addMessageToHistory = (message: ChatMessage) => {
        setChatHistory(prev => [...prev, message]);
    };

    useEffect(() => {
        const stopScreenShare = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setIsSharing(false);
            setIsVideoReady(false);
        };

        const startScreenShare = async () => {
            if (streamRef.current) return;

            try {
                const mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                streamRef.current = mediaStream;
                setIsSharing(true);

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }

                mediaStream.getVideoTracks()[0].onended = () => {
                    stopScreenShare();
                    onClose();
                };
            } catch (err) {
                console.error("Error starting screen share:", err);
                onClose();
            }
        };

        if (isOpen) {
            startScreenShare();
        } else {
            stopScreenShare();
        }

        return () => {
            stopScreenShare();
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSendMessage = async () => {
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isLoading || !streamRef.current || !isVideoReady) return;

        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const frame = canvas.toDataURL('image/jpeg');

        const userMessage: ChatMessage = { sender: 'user', text: trimmedInput, image: frame };
        addMessageToHistory(userMessage);
        setUserInput('');
        setIsLoading(true);

        try {
            await sendVisualChatToAI(trimmedInput, frame, addMessageToHistory);
        } catch (error) {
            const errorMessage: ChatMessage = { sender: 'ai', text: 'Sorry, I encountered an error. Please check the console.' };
            addMessageToHistory(errorMessage);
            console.error('Error in Visual AI interaction:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed flex flex-col w-[500px] h-[700px] max-w-[90vw] max-h-[80vh] bg-gray-800 border border-cyan-600 rounded-lg shadow-2xl z-50 text-white"
            style={{ top: position.y, left: position.x }}
        >
            <DraggableHeader onDrag={handleDrag}>
                <div className="flex items-center justify-between p-2 bg-gray-900 rounded-t-lg">
                    <h2 className="font-bold text-gray-200">Visual Assistant</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
            </DraggableHeader>
            
            <div className="flex-shrink-0 p-2 border-b border-gray-700">
                {isSharing ? (
                    <video ref={videoRef} autoPlay muted className="w-full rounded-md" onCanPlay={() => setIsVideoReady(true)} />
                ) : (
                    <div className="w-full aspect-video bg-black flex items-center justify-center rounded-md">
                        <SpinnerIcon className="w-8 h-8 animate-spin" />
                        <span className="ml-2 text-gray-400">Requesting screen...</span>
                    </div>
                )}
            </div>
            
            <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4">
                 {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-800 flex items-center justify-center"><AIIcon className="w-5 h-5 text-cyan-300"/></div>}
                        <div className={`max-w-md p-3 rounded-xl shadow ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                            {msg.image && <img src={msg.image} alt="User capture" className="rounded-lg mb-2 max-w-xs" />}
                            {msg.text && <pre className="whitespace-pre-wrap font-sans text-sm">{msg.text}</pre>}
                        </div>
                        {msg.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"><UserIcon className="w-5 h-5 text-gray-300"/></div>}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-800 flex items-center justify-center"><AIIcon className="w-5 h-5 text-cyan-300"/></div>
                        <div className="max-w-md p-3 rounded-xl shadow bg-gray-700 text-gray-200 rounded-bl-none flex items-center">
                            <SpinnerIcon className="animate-spin w-5 h-5 mr-2" />
                            <span>Analyzing...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-shrink-0 p-2 border-t border-gray-700">
                <div className="flex items-center bg-gray-900 border border-gray-600 rounded-lg p-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask about your UI..."
                      className="flex-grow bg-transparent focus:outline-none px-2"
                      disabled={isLoading || !isVideoReady}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !userInput.trim() || !isSharing || !isVideoReady}
                      className="p-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                      title="Send"
                    >
                      {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <SendIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VisualAssistantPanel;