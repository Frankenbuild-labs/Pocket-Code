import React, { useState, useCallback } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import EditorView from './components/EditorView';
import ChatView from './components/ChatView';
import PreviewView from './components/PreviewView';
import CopierView from './components/CopierView';
import Tabs from './components/Tabs';
import VisualAssistantPanel from './components/VisualAssistantPanel';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import LeftMenu from './components/LeftMenu';
import RightMenu from './components/RightMenu';
import BottomPanel from './components/BottomPanel';

type AppPage = 'landing' | 'login' | 'signup' | 'app';

const CodingInterface: React.FC = () => {
  const { activeView, setActiveView } = useAppContext();
  const [isVisualAssistantOpen, setIsVisualAssistantOpen] = useState(false);

  const toggleVisualAssistant = useCallback(() => {
    setIsVisualAssistantOpen(prev => !prev);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans border-2 border-cyan-600">
      <header className="flex-shrink-0 bg-gray-800 border-b border-gray-700 flex items-center justify-between p-2 shadow-md">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <h1 className="text-xl font-bold text-gray-200">Pocket Coder</h1>
        </div>
        <Tabs activeView={activeView} setActiveView={setActiveView} />
      </header>
      <main className="flex-grow overflow-hidden relative">
        <div style={{ display: activeView === 'editor' ? 'block' : 'none' }} className="h-full w-full absolute">
          <EditorView />
        </div>
        <div style={{ display: activeView === 'chat' ? 'block' : 'none' }} className="h-full w-full absolute">
          <ChatView toggleVisualAssistant={toggleVisualAssistant} />
        </div>
        <div style={{ display: activeView === 'preview' ? 'block' : 'none' }} className="h-full w-full absolute">
          <PreviewView />
        </div>
        <div style={{ display: activeView === 'copier' ? 'block' : 'none' }} className="h-full w-full absolute">
          <CopierView />
        </div>
      </main>
      <VisualAssistantPanel isOpen={isVisualAssistantOpen} onClose={toggleVisualAssistant} />
    </div>
  );
};

const NewCodingInterface: React.FC = () => {
  return (
    <div className="h-screen w-full overflow-hidden bg-gray-900 text-white">
      <div className="flex h-full">
        <LeftMenu />
        <div className="flex-grow flex flex-col">
          <EditorView />
          <BottomPanel lintErrors={[]} />
        </div>
        <RightMenu />
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  // Temporarily disabled landing page - going directly to the original main app interface
  return <CodingInterface />;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
