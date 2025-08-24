import React, { useState } from 'react';
import WebContainerTerminal from './WebContainerTerminal';
import ProblemsPanel from './ProblemsPanel';
import { WarningIcon, PlusIcon, CloseIcon } from './icons';
import type { LintError } from '../types';

interface BottomPanelProps {
  lintErrors: LintError[];
}

interface TerminalInstance {
  id: number;
}

const BottomPanel: React.FC<BottomPanelProps> = ({ lintErrors }) => {
  const [terminals, setTerminals] = useState<TerminalInstance[]>([{ id: 1 }]);
  const [nextId, setNextId] = useState(2);
  const [activeTab, setActiveTab] = useState<number | 'problems'>(1);

  const commonTabClasses = "px-4 py-2 text-xs font-medium border-t-2 focus:outline-none transition-colors";
  const activeTabClasses = "border-cyan-500 text-white";
  const inactiveTabClasses = "border-transparent text-gray-400 hover:text-white hover:bg-gray-700/50";

  const handleAddTerminal = () => {
    const newTerminal = { id: nextId };
    setTerminals([...terminals, newTerminal]);
    setActiveTab(nextId);
    setNextId(nextId + 1);
  };

  const handleCloseTerminal = (e: React.MouseEvent, idToClose: number) => {
    e.stopPropagation();
    if (terminals.length <= 1) return;

    const closingIndex = terminals.findIndex(t => t.id === idToClose);
    const remainingTerminals = terminals.filter(t => t.id !== idToClose);

    if (activeTab === idToClose) {
      const newActiveIndex = closingIndex > 0 ? closingIndex - 1 : 0;
      setActiveTab(remainingTerminals[newActiveIndex].id);
    }

    setTerminals(remainingTerminals);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-shrink-0 flex items-center bg-gray-800 border-t border-b border-gray-700">
        {terminals.map((term, index) => (
          <button
            key={term.id}
            onClick={() => setActiveTab(term.id)}
            className={`${commonTabClasses} ${activeTab === term.id ? activeTabClasses : inactiveTabClasses} flex items-center space-x-2 group`}
          >
            <span>TERMINAL {index + 1}</span>
            {terminals.length > 1 && (
                <div
                    onClick={(e) => handleCloseTerminal(e, term.id)}
                    className="p-0.5 rounded-full hover:bg-gray-600 opacity-50 group-hover:opacity-100"
                    title="Close Terminal"
                >
                    <CloseIcon className="w-3 h-3" />
                </div>
            )}
          </button>
        ))}
        <button onClick={handleAddTerminal} className="px-2 py-2 hover:bg-gray-700/50 text-gray-400" title="New Terminal">
            <PlusIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-gray-700 mx-1"></div>

        <button
          onClick={() => setActiveTab('problems')}
          className={`${commonTabClasses} ${activeTab === 'problems' ? activeTabClasses : inactiveTabClasses} flex items-center space-x-2`}
        >
          <WarningIcon className="w-4 h-4" />
          <span>PROBLEMS</span>
          {lintErrors.length > 0 && (
            <span className="bg-cyan-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {lintErrors.length}
            </span>
          )}
        </button>
      </div>
      <div className="flex-grow overflow-hidden relative bg-black">
        {terminals.map(term => (
            <div
                key={term.id}
                className="h-full w-full absolute top-0 left-0"
                style={{ visibility: activeTab === term.id ? 'visible' : 'hidden' }}
            >
                <WebContainerTerminal />
            </div>
        ))}
        <div
            className="h-full w-full absolute top-0 left-0"
            style={{ visibility: activeTab === 'problems' ? 'visible' : 'hidden' }}
        >
            <ProblemsPanel errors={lintErrors} />
        </div>
      </div>
    </div>
  );
};

export default BottomPanel;
