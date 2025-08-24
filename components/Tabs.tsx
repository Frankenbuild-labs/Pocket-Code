import React from 'react';
import type { View } from '../types';
import { EditorIcon, ChatIcon, PreviewIcon, CopierIcon } from './icons';

interface TabsProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeView, setActiveView }) => {
  const commonClasses = "flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500";
  const activeClasses = "bg-cyan-600 text-white shadow-sm";
  const inactiveClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <div className="flex space-x-2 bg-gray-900/50 p-1 rounded-lg">
      <button
        onClick={() => setActiveView('editor')}
        className={`${commonClasses} ${activeView === 'editor' ? activeClasses : inactiveClasses}`}
        aria-pressed={activeView === 'editor'}
      >
        <EditorIcon className="w-5 h-5" />
        <span>Editor</span>
      </button>
      <button
        onClick={() => setActiveView('chat')}
        className={`${commonClasses} ${activeView === 'chat' ? activeClasses : inactiveClasses}`}
        aria-pressed={activeView === 'chat'}
      >
        <ChatIcon className="w-5 h-5" />
        <span>Chat</span>
      </button>
      <button
        onClick={() => setActiveView('preview')}
        className={`${commonClasses} ${activeView === 'preview' ? activeClasses : inactiveClasses}`}
        aria-pressed={activeView === 'preview'}
      >
        <PreviewIcon className="w-5 h-5" />
        <span>Preview</span>
      </button>
      <button
        onClick={() => setActiveView('copier')}
        className={`${commonClasses} ${activeView === 'copier' ? activeClasses : inactiveClasses}`}
        aria-pressed={activeView === 'copier'}
      >
        <CopierIcon className="w-5 h-5" />
        <span>Copier</span>
      </button>
    </div>
  );
};

export default Tabs;