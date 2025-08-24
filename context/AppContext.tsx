

import React, { createContext, useState, useCallback, useContext, useRef } from 'react';
import type { FileSystemTree, ChatMessage, File, Directory, FileSystemNode, View } from '../types';
import { INITIAL_FILE_SYSTEM, DEFAULT_SYSTEM_PROMPT } from '../constants';

interface AppSettings {
    systemPrompt: string;
    clearChatOnClone: boolean;
    isTTSenabled: boolean;
}

interface AppContextType {
  fileSystem: FileSystemTree;
  activeFilePath: string | null;
  setActiveFilePath: (path: string | null) => void;
  getFileContent: (path: string) => string | null;
  updateFileContent: (path: string, content: string) => void;
  createFile: (path: string) => boolean;
  createDirectory: (path: string) => boolean;
  deleteNode: (path: string) => { success: boolean, error?: string };
  moveNode: (oldPath: string, newPath: string) => { success: boolean, error?: string };
  copyNode: (sourcePath: string, destPath: string) => { success: boolean, error?: string };
  renameNode: (path: string, newName: string) => boolean;
  replaceFileSystem: (newTree: FileSystemTree) => void;
  chatHistory: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
  getFileSystemStructure: () => string;
  // New functions for AI tools
  readFile: (path: string) => string | null;
  writeFile: (path: string, content: string) => boolean;
  listFiles: (path: string) => string[] | null;
  // New functions for Terminal interaction
  setTerminalExecutor: (executor: (command: string) => Promise<string>) => void;
  executeTerminalCommand: (command: string) => Promise<string>;
  findNode: (path: string) => FileSystemNode | null;
  // Settings
  settings: AppSettings;
  updateSystemPrompt: (prompt: string) => void;
  updateClearChatOnClone: (value: boolean) => void;
  toggleTTS: () => void;
  // View management
  activeView: View;
  setActiveView: (view: View) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const normalizeVirtualPath = (path: string): string => {
    if (path === '.') return '';
    if (path.startsWith('./')) return path.substring(2);
    return path;
};

const findNodeInternal = (path: string, fs: FileSystemTree): FileSystemNode | null => {
    const normalizedPath = normalizeVirtualPath(path);
    if (normalizedPath === '' || normalizedPath === '/') return fs;
    const parts = normalizedPath.split('/').filter(p => p);
    let current: FileSystemNode = fs;
    for (const part of parts) {
        if (current.type === 'directory' && current.children[part]) {
            current = current.children[part];
        } else {
            return null;
        }
    }
    return current;
};

const findParentNodeInternal = (path: string, fs: FileSystemTree): { parent: Directory, nodeName: string } | null => {
    const normalizedPath = normalizeVirtualPath(path);
    const parts = normalizedPath.split('/').filter(p => p);
    if (parts.length === 0) return null;
    const nodeName = parts.pop()!;
    const parentPath = parts.join('/');
    const parent = findNodeInternal(parentPath, fs) as Directory;
    if (parent && parent.type === 'directory') {
        return { parent, nodeName };
    }
    return null;
}


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fileSystem, setFileSystem] = useState<FileSystemTree>(INITIAL_FILE_SYSTEM);
  const [activeFilePath, setActiveFilePath] = useState<string | null>('README.md');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    clearChatOnClone: true,
    isTTSenabled: false,
  });
  const terminalExecutorRef = useRef<((command: string) => Promise<string>) | null>(null);
  const [activeView, setActiveView] = useState<View>('chat');

  const findNode = useCallback((path: string) => findNodeInternal(path, fileSystem), [fileSystem]);

  const getFileContent = useCallback((path: string): string | null => {
    const node = findNodeInternal(path, fileSystem);
    return node && node.type === 'file' ? node.content : null;
  }, [fileSystem]);
  
  const updateFileContent = useCallback((path: string, content: string) => {
    setFileSystem(prevFs => {
      const newFs = JSON.parse(JSON.stringify(prevFs));
      const node = findNodeInternal(path, newFs) as File;
      if (node && node.type === 'file') {
        node.content = content;
      }
      return newFs;
    });
  }, []);

  const createFile = useCallback((path: string) => {
    const newFs = JSON.parse(JSON.stringify(fileSystem));
    const parentInfo = findParentNodeInternal(path, newFs);
    if (parentInfo) {
        const { parent, nodeName } = parentInfo;
        if (!parent.children[nodeName]) {
            parent.children[nodeName] = { type: 'file', content: '' };
            setFileSystem(newFs);
            return true;
        }
    } else if (!normalizeVirtualPath(path).includes('/')) { // Create at root
         const nodeName = normalizeVirtualPath(path);
         if (!newFs.children[nodeName]) {
             newFs.children[nodeName] = { type: 'file', content: '' };
             setFileSystem(newFs);
             return true;
         }
    }
    return false;
  }, [fileSystem]);

  const writeFile = useCallback((path: string, content: string) => {
    const newFs = JSON.parse(JSON.stringify(fileSystem));
    const node = findNodeInternal(path, newFs);
    if (node && node.type === 'file') {
        (node as File).content = content;
        setFileSystem(newFs);
        return true;
    }
    const parentInfo = findParentNodeInternal(path, newFs);
    if (parentInfo) {
        const { parent, nodeName } = parentInfo;
        parent.children[nodeName] = { type: 'file', content };
        setFileSystem(newFs);
        return true;
    } else if (!normalizeVirtualPath(path).includes('/')) { // Write at root
        const nodeName = normalizeVirtualPath(path);
        newFs.children[nodeName] = { type: 'file', content };
        setFileSystem(newFs);
        return true;
    }
    return false;
  }, [fileSystem]);

  const createDirectory = useCallback((path: string) => {
    const newFs = JSON.parse(JSON.stringify(fileSystem));
    const parentInfo = findParentNodeInternal(path, newFs);
    if (parentInfo) {
        const { parent, nodeName } = parentInfo;
        if (!parent.children[nodeName]) {
            parent.children[nodeName] = { type: 'directory', children: {} };
            setFileSystem(newFs);
            return true;
        }
    } else if (!normalizeVirtualPath(path).includes('/')) { // Create at root
        const nodeName = normalizeVirtualPath(path);
        if (!newFs.children[nodeName]) {
            newFs.children[nodeName] = { type: 'directory', children: {} };
            setFileSystem(newFs);
            return true;
        }
    }
    return false;
  }, [fileSystem]);

  const deleteNode = useCallback((path: string) => {
    const newFs = JSON.parse(JSON.stringify(fileSystem));
    const nodeToDelete = findNodeInternal(path, newFs);

    if (!nodeToDelete) {
      return { success: false, error: `No such file or directory: ${path}` };
    }

    const parentInfo = findParentNodeInternal(path, newFs);
    if (parentInfo && parentInfo.parent.children[parentInfo.nodeName]) {
      delete parentInfo.parent.children[parentInfo.nodeName];
      if (activeFilePath && (activeFilePath === path || activeFilePath.startsWith(path + '/'))) {
          setActiveFilePath(null);
      }
      setFileSystem(newFs);
      return { success: true };
    }
    
    return { success: false, error: `Could not find parent of ${path}` };
  }, [fileSystem, activeFilePath]);

  const moveNode = useCallback((oldPath: string, newPath: string) => {
    const newFs = JSON.parse(JSON.stringify(fileSystem));
    
    const nodeToMove = findNodeInternal(oldPath, newFs);
    const sourceParentInfo = findParentNodeInternal(oldPath, newFs);
    if (!nodeToMove || !sourceParentInfo) {
      return { success: false, error: `Source not found: ${oldPath}` };
    }

    let finalDestPath = newPath;
    const destNode = findNodeInternal(newPath, newFs);
    if (destNode && destNode.type === 'directory') {
      const sourceName = oldPath.split('/').pop()!;
      finalDestPath = newPath === '/' ? `${sourceName}` : `${newPath}/${sourceName}`;
    }

    if (findNodeInternal(finalDestPath, newFs)) {
      return { success: false, error: `Destination exists: ${finalDestPath}` };
    }

    const destParentInfo = findParentNodeInternal(finalDestPath, newFs);
    if (!destParentInfo) {
      return { success: false, error: `Cannot find destination parent for: ${finalDestPath}` };
    }

    // Perform move
    destParentInfo.parent.children[destParentInfo.nodeName] = nodeToMove;
    delete sourceParentInfo.parent.children[sourceParentInfo.nodeName];

    // Update active path
    if (activeFilePath === oldPath) {
      setActiveFilePath(finalDestPath);
    } else if (activeFilePath && activeFilePath.startsWith(oldPath + '/')) {
      setActiveFilePath(activeFilePath.replace(oldPath, finalDestPath));
    }
    
    setFileSystem(newFs);
    return { success: true };
  }, [fileSystem, activeFilePath]);
  
  const renameNode = useCallback((path: string, newName: string) => {
    const parentPath = path.substring(0, path.lastIndexOf('/'));
    const newPath = parentPath ? `${parentPath}/${newName}` : `${newName}`;
    return moveNode(path, newPath).success;
  }, [moveNode]);

  const deepCopyNode = (node: FileSystemNode): FileSystemNode => JSON.parse(JSON.stringify(node));

  const copyNode = useCallback((sourcePath: string, destPath: string) => {
    const newFs = JSON.parse(JSON.stringify(fileSystem));
    const nodeToCopy = findNodeInternal(sourcePath, newFs);
    if (!nodeToCopy) {
        return { success: false, error: `Source not found: ${sourcePath}` };
    }

    let finalDestPath = destPath;
    const destNode = findNodeInternal(destPath, newFs);
    if (destNode && destNode.type === 'directory') {
        const sourceName = sourcePath.split('/').pop()!;
        finalDestPath = destPath === '/' ? `${sourceName}` : `${destPath}/${sourceName}`;
    }
    
    if (findNodeInternal(finalDestPath, newFs)) {
        return { success: false, error: `Destination exists: ${finalDestPath}` };
    }
    
    const destParentInfo = findParentNodeInternal(finalDestPath, newFs);
    if (!destParentInfo) {
        return { success: false, error: `Cannot find destination parent for: ${finalDestPath}` };
    }

    destParentInfo.parent.children[destParentInfo.nodeName] = deepCopyNode(nodeToCopy);
    
    setFileSystem(newFs);
    return { success: true };
  }, [fileSystem]);

  const replaceFileSystem = useCallback((newTree: FileSystemTree) => {
    setFileSystem(newTree);
    const readmePath = Object.keys(newTree.children).find(name => name.toLowerCase().startsWith('readme'));
    setActiveFilePath(readmePath || null);
    if (settings.clearChatOnClone) {
        setChatHistory([]);
    }
  }, [settings.clearChatOnClone]);

  const addChatMessage = (message: ChatMessage) => {
    setChatHistory(prev => [...prev, message]);
  };

  const clearChatHistory = () => {
    setChatHistory([]);
  };

  const getFileSystemStructure = useCallback((dir: string = '/', indent: string = ''): string => {
    let structure = '';
    const node = findNodeInternal(dir, fileSystem);
    if (node && node.type === 'directory') {
      for (const [name, child] of Object.entries(node.children)) {
        structure += `${indent}- ${name}\n`;
        if (child.type === 'directory') {
          structure += getFileSystemStructure(`${dir === '/' ? '' : dir}/${name}`, indent + '  ');
        }
      }
    }
    return structure;
  }, [fileSystem]);

  const updateSystemPrompt = useCallback((prompt: string) => {
    setSettings(s => ({ ...s, systemPrompt: prompt }));
  }, []);

  const updateClearChatOnClone = useCallback((value: boolean) => {
    setSettings(s => ({ ...s, clearChatOnClone: value }));
  }, []);

  const toggleTTS = useCallback(() => {
    setSettings(s => ({ ...s, isTTSenabled: !s.isTTSenabled }));
  }, []);

  // For AI Tools
  const readFile = getFileContent;
  
  const listFiles = useCallback((path: string) => {
    const node = findNodeInternal(path, fileSystem);
    if (node && node.type === 'directory') {
      return Object.keys(node.children);
    }
    return null;
  }, [fileSystem]);

  // For Terminal
  const setTerminalExecutor = (executor: (command: string) => Promise<string>) => {
    terminalExecutorRef.current = executor;
  };
  const executeTerminalCommand = async (command: string) => {
    if (terminalExecutorRef.current) {
      return await terminalExecutorRef.current(command);
    }
    return "Error: Terminal is not available.";
  };

  return (
    <AppContext.Provider value={{ 
        fileSystem, activeFilePath, setActiveFilePath, getFileContent, updateFileContent,
        createFile, createDirectory, deleteNode, moveNode, copyNode, renameNode, replaceFileSystem,
        chatHistory, addChatMessage, clearChatHistory, 
        getFileSystemStructure, readFile, writeFile, listFiles,
        setTerminalExecutor, executeTerminalCommand, findNode,
        settings, updateSystemPrompt, updateClearChatOnClone, toggleTTS,
        activeView, setActiveView
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};