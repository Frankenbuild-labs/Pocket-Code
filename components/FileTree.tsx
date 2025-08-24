
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Directory, FileSystemNode } from '../types';
import { 
  FileIcon, FolderIcon, FolderOpenIcon, 
  NewFileIcon, NewFolderIcon, EditIcon, TrashIcon 
} from './icons';

type Interaction = {
  type: 'creating';
  parentPath: string;
  nodeType: 'file' | 'directory';
} | {
  type: 'renaming';
  path: string;
  originalName: string;
};

const NodeInput: React.FC<{
  parentPath: string;
  onCommit: (name: string) => void;
  onCancel: () => void;
  initialValue?: string;
}> = ({ onCommit, onCancel, initialValue = '' }) => {
  const [name, setName] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleCommit = () => {
    const trimmedName = name.trim();
    if (trimmedName) {
      onCommit(trimmedName);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="ml-4 pl-2 flex items-center py-1">
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        className="text-sm bg-gray-900 text-white outline-none border border-cyan-500 rounded px-1 w-full"
      />
    </div>
  );
};

const TreeNode: React.FC<{
  name: string;
  node: FileSystemNode;
  currentPath: string;
  interaction: Interaction | null;
  setInteraction: (interaction: Interaction | null) => void;
}> = ({ name, node, currentPath, interaction, setInteraction }) => {
  const { activeFilePath, setActiveFilePath, createFile, createDirectory, deleteNode, renameNode } = useAppContext();
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const fullPath = [currentPath, name].filter(Boolean).join('/');
  
  const handleRename = (newName: string) => {
    if (interaction?.type === 'renaming' && newName !== interaction.originalName) {
      renameNode(fullPath, newName);
    }
    setInteraction(null);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(fullPath);
  };
  
  const handleNewFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
    setInteraction({ type: 'creating', parentPath: fullPath, nodeType: 'file' });
  }
  const handleNewFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
    setInteraction({ type: 'creating', parentPath: fullPath, nodeType: 'directory' });
  }

  const handleCreate = (newName: string) => {
    if (interaction?.type === 'creating') {
      const newPath = [interaction.parentPath, newName].filter(Boolean).join('/');
      if (interaction.nodeType === 'file') {
        createFile(newPath);
      } else {
        createDirectory(newPath);
      }
    }
    setInteraction(null);
  };

  if (interaction?.type === 'renaming' && interaction.path === fullPath) {
    return (
      <NodeInput
        parentPath={currentPath}
        initialValue={name}
        onCommit={handleRename}
        onCancel={() => setInteraction(null)}
      />
    );
  }

  if (node.type === 'directory') {
    return (
      <div>
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex items-center justify-between cursor-pointer py-1 px-2 hover:bg-gray-700 rounded"
        >
          <div className="flex items-center flex-grow" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FolderOpenIcon className="w-4 h-4 mr-2 text-cyan-400 flex-shrink-0" /> : <FolderIcon className="w-4 h-4 mr-2 text-cyan-400 flex-shrink-0" />}
            <span className="text-sm select-none">{name}</span>
          </div>
          {isHovered && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button onClick={handleNewFile} title="New File"><NewFileIcon className="w-4 h-4 text-gray-400 hover:text-white" /></button>
              <button onClick={handleNewFolder} title="New Folder"><NewFolderIcon className="w-4 h-4 text-gray-400 hover:text-white" /></button>
              <button onClick={(e) => { e.stopPropagation(); setInteraction({ type: 'renaming', path: fullPath, originalName: name }); }} title="Rename"><EditIcon className="w-4 h-4 text-gray-400 hover:text-white" /></button>
              <button onClick={handleDelete} title="Delete"><TrashIcon className="w-4 h-4 text-gray-400 hover:text-white" /></button>
            </div>
          )}
        </div>
        {isOpen && (
          <div className="ml-4 border-l border-gray-600 pl-2">
            {Object.entries(node.children)
             .sort(([a, nodeA], [b, nodeB]) => {
                if (nodeA.type === nodeB.type) return a.localeCompare(b);
                return nodeA.type === 'directory' ? -1 : 1;
              })
             .map(([childName, childNode]) => (
              <TreeNode key={childName} name={childName} node={childNode} currentPath={fullPath} interaction={interaction} setInteraction={setInteraction} />
            ))}
            {interaction?.type === 'creating' && interaction.parentPath === fullPath && (
              <NodeInput
                parentPath={fullPath}
                onCommit={handleCreate}
                onCancel={() => setInteraction(null)}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  const isActive = activeFilePath === fullPath;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setActiveFilePath(fullPath)}
      className={`flex items-center justify-between cursor-pointer py-1 px-2 rounded ${isActive ? 'bg-cyan-700' : 'hover:bg-gray-700'}`}
    >
      <div className="flex items-center">
        <FileIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
        <span className={`text-sm select-none ${isActive ? 'text-white' : ''}`}>{name}</span>
      </div>
      {isHovered && (
        <div className="flex items-center space-x-2">
          <button onClick={(e) => { e.stopPropagation(); setInteraction({ type: 'renaming', path: fullPath, originalName: name }); }} title="Rename"><EditIcon className="w-4 h-4 text-gray-400 hover:text-white" /></button>
          <button onClick={handleDelete} title="Delete"><TrashIcon className="w-4 h-4 text-gray-400 hover:text-white" /></button>
        </div>
      )}
    </div>
  );
};

const FileTree: React.FC = () => {
    const { fileSystem, createFile, createDirectory } = useAppContext();
    const [interaction, setInteraction] = useState<Interaction | null>(null);

    const handleCreate = (name: string) => {
      if (interaction && interaction.type === 'creating') {
        if (interaction.nodeType === 'file') {
          createFile(name);
        } else {
          createDirectory(name);
        }
      }
      setInteraction(null);
    };

    return (
      <div className="p-2 text-gray-300 h-full flex flex-col">
        <div className="flex justify-between items-center px-2 py-1 flex-shrink-0">
            <h2 className="text-xs uppercase text-gray-500 font-bold tracking-wider">Project Files</h2>
            <div className="flex items-center space-x-2">
                <button onClick={() => setInteraction({type: 'creating', parentPath: '/', nodeType: 'file'})} title="New File"><NewFileIcon className="w-4 h-4 text-gray-400 hover:text-white" /></button>
                <button onClick={() => setInteraction({type: 'creating', parentPath: '/', nodeType: 'directory'})} title="New Folder"><NewFolderIcon className="w-4 h-4 text-gray-400 hover:text-white" /></button>
            </div>
        </div>
        <div className="flex-grow overflow-y-auto">
          {Object.entries(fileSystem.children)
            .sort(([a, nodeA], [b, nodeB]) => {
              if (nodeA.type === nodeB.type) return a.localeCompare(b);
              return nodeA.type === 'directory' ? -1 : 1;
            })
            .map(([name, node]) => (
              <TreeNode key={name} name={name} node={node} currentPath="" interaction={interaction} setInteraction={setInteraction} />
            ))}
          {interaction?.type === 'creating' && interaction.parentPath === '/' && (
              <NodeInput
                parentPath="/"
                onCommit={handleCreate}
                onCancel={() => setInteraction(null)}
              />
          )}
        </div>
      </div>
    );
  };

export default FileTree;
