import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';

import { useAppContext } from '../context/AppContext';
import { formatCode } from '../services/formattingService';
import { lintCode } from '../services/lintingService';
import { FormatIcon, SpinnerIcon } from './icons';
import type { LintError } from '../types';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

type PrismType = typeof Prism;

declare global {
    var Prism: PrismType;
}
globalThis.Prism = Prism;

interface CodeEditorProps {
    setLintErrors: (errors: LintError[]) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ setLintErrors }) => {
  const { activeFilePath, getFileContent, updateFileContent } = useAppContext();
  const [code, setCode] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);
  const debouncedCode = useDebounce(code, 500);

  const language = useMemo(() => {
    if (!activeFilePath) return 'plaintext';
    const extension = activeFilePath.split('.').pop();
    switch (extension) {
      case 'js': return 'javascript';
      case 'jsx': return 'jsx';
      case 'ts': return 'typescript';
      case 'tsx': return 'tsx';
      case 'css': return 'css';
      case 'html': return 'markup';
      case 'md': return 'markdown';
      default: return 'plaintext';
    }
  }, [activeFilePath]);

  useEffect(() => {
    if (activeFilePath) {
      setCode(getFileContent(activeFilePath) || '');
    } else {
      setCode('');
    }
  }, [activeFilePath, getFileContent]);
  
  useEffect(() => {
    const performLinting = async () => {
      if (activeFilePath && ['javascript', 'jsx', 'tsx'].includes(language)) {
        const errors = await lintCode(debouncedCode);
        setLintErrors(errors);
      } else {
        setLintErrors([]);
      }
    };
    performLinting();
  }, [debouncedCode, activeFilePath, language, setLintErrors]);


  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (activeFilePath) {
      updateFileContent(activeFilePath, newCode);
    }
  };

  const handleFormat = async () => {
    if (!activeFilePath) return;
    setIsFormatting(true);
    try {
      const formattedCode = await formatCode(code, activeFilePath);
      if (formattedCode !== code) {
        handleCodeChange(formattedCode);
      }
    } catch (error) {
      console.error("Failed to format code:", error);
      // Optionally, show a notification to the user
    } finally {
      setIsFormatting(false);
    }
  };

  if (activeFilePath === null) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-800 text-gray-500">
        <p>Select a file to begin editing.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto code-editor-container">
      <div className="absolute top-2 right-4 text-xs flex items-center space-x-4">
        <button 
            onClick={handleFormat} 
            disabled={isFormatting}
            title="Format Code"
            className="p-1 bg-gray-700/50 hover:bg-gray-600 rounded-md disabled:opacity-50"
        >
            {isFormatting ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <FormatIcon className="w-4 h-4" />}
        </button>
        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded">
            {activeFilePath}
        </span>
      </div>
      <Editor
        value={code}
        onValueChange={handleCodeChange}
        highlight={(code) => {
            if (Prism.languages[language]) {
                return Prism.highlight(code, Prism.languages[language], language);
            }
            return code;
        }}
        padding={10}
        className="h-full"
        autoFocus
      />
    </div>
  );
};

export default CodeEditor;