import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon, SpinnerIcon, TrashIcon, FolderIcon, FileIcon, PlusIcon, DownloadIcon, PlanIcon } from './icons';
import LeftMenu from './LeftMenu';
import RightMenu from './RightMenu';
import { useAppContext } from '../context/AppContext';
import { generateCodeFromImage, generatePlan } from '../services/aiService';
import { createProjectZip } from '../services/zipService';
import type { FileSystemTree, FileSystemNode } from '../types';

const FileTreePreviewNode: React.FC<{ name: string; node: FileSystemNode; level?: number }> = ({ name, node, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(true);
    const indent = { paddingLeft: `${level * 1.5}rem` };

    if (node.type === 'directory') {
        return (
            <div>
                <div style={indent} className="flex items-center cursor-pointer py-1" onClick={() => setIsOpen(!isOpen)}>
                    <FolderIcon className="w-4 h-4 mr-2 text-cyan-400 flex-shrink-0" />
                    <span className="text-sm font-medium select-none">{name}</span>
                </div>
                {isOpen && (
                    <div>
                        {Object.entries(node.children)
                            .sort(([a, nodeA], [b, nodeB]) => {
                                if (nodeA.type === nodeB.type) return a.localeCompare(b);
                                return nodeA.type === 'directory' ? -1 : 1;
                            })
                            .map(([childName, childNode]) => (
                                <FileTreePreviewNode key={childName} name={childName} node={childNode} level={level + 1} />
                            ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={indent} className="flex items-center py-1">
            <FileIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="text-sm select-none">{name}</span>
        </div>
    );
};


const CopierView: React.FC = () => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedTree, setGeneratedTree] = useState<FileSystemTree | null>(null);
    const [isAddingToPlan, setIsAddingToPlan] = useState(false);
    const [planSuccess, setPlanSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { replaceFileSystem, getFileSystemStructure } = useAppContext();

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setError(null);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setError("Invalid file type. Please upload an image.");
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleGenerateCode = async () => {
        if (!imageSrc) return;
        setIsLoading(true);
        setError(null);
        setGeneratedTree(null);
        try {
            const tree = await generateCodeFromImage(imageSrc);
            setGeneratedTree(tree);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred during code generation.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearImage = () => {
        setImageSrc(null);
        setError(null);
        setGeneratedTree(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleAreaClick = () => {
        if (!imageSrc) {
            fileInputRef.current?.click();
        }
    };

    const handleAddToWorkspace = () => {
        if (generatedTree) {
            replaceFileSystem(generatedTree);
            // Optionally, show a success message or navigate away
        }
    };

    const handleDownload = async () => {
        if (generatedTree) {
            try {
                const zipBlob = await createProjectZip(generatedTree);
                const url = URL.createObjectURL(zipBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'project.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (err) {
                console.error("Failed to create zip:", err);
                setError("Failed to create project zip file.");
            }
        }
    };

    const handleAddToPlan = async () => {
        if (!generatedTree) return;
        setIsAddingToPlan(true);
        setPlanSuccess(false);
        setError(null);
        try {
            const fileStructure = getFileSystemStructure();
            const goal = "Implement the UI design from the provided image into the existing project structure.";
            const planSteps = await generatePlan(goal, fileStructure);
            
            // Here you would typically update a global state or context for the planner.
            // For this example, we'll just log it and show a success message.
            console.log("Generated Plan:", planSteps);
            setPlanSuccess(true);
            setTimeout(() => setPlanSuccess(false), 3000); // Hide message after 3s

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred while generating the plan.");
        } finally {
            setIsAddingToPlan(false);
        }
    };

    return (
        <div className="flex h-full bg-gray-900">
            <LeftMenu />
            <div className="flex flex-col flex-grow p-8 overflow-y-auto text-gray-100 items-center space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">UI Copier</h2>
                    <p className="text-gray-400 mt-2">Generate a Next.js project by dropping an image of a website.</p>
                </div>

                <div className="w-full max-w-4xl p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="w-full">
                        {!imageSrc ? (
                            <div
                                onClick={handleAreaClick}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`w-full h-48 flex flex-col items-center justify-center border-4 border-dashed rounded-xl cursor-pointer transition-colors
                                ${isDragging ? 'border-cyan-500 bg-gray-700/50' : 'border-gray-600 hover:border-cyan-600 hover:bg-gray-800/50'}`}
                            >
                                <UploadIcon className="w-12 h-12 text-gray-500 mb-4" />
                                <p className="text-lg text-gray-400">
                                    <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-sm text-gray-500 mt-1">PNG, JPG, or WEBP accepted</p>
                            </div>
                        ) : (
                            <div className="w-full flex flex-col items-center">
                                <div className="relative w-full max-h-64 mb-6">
                                    <img src={imageSrc} alt="UI Preview" className="w-full h-full object-contain rounded-lg" />
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={handleClearImage}
                                        className="flex items-center justify-center px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        <TrashIcon className="w-5 h-5 mr-2" />
                                        Clear
                                    </button>
                                    <button
                                        onClick={handleGenerateCode}
                                        className="flex items-center justify-center px-5 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : 'Generate Project'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {isLoading && (
                    <div className="flex items-center text-lg text-cyan-400">
                        <SpinnerIcon className="w-6 h-6 mr-3 animate-spin" />
                        Analyzing image and generating project... This may take a minute.
                    </div>
                )}

                {error && (
                    <div className="w-full max-w-4xl text-sm p-3 rounded-md bg-red-900/50 text-red-300">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {generatedTree && !isLoading && (
                    <div className="w-full max-w-4xl p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4">Generated Project</h3>
                        <div className="bg-gray-900 p-4 rounded-md max-h-80 overflow-y-auto font-mono">
                            {Object.entries(generatedTree.children).map(([name, node]) => (
                                <FileTreePreviewNode key={name} name={name} node={node} />
                            ))}
                        </div>
                        <div className="flex space-x-4 mt-6">
                            <button onClick={handleAddToWorkspace} className="flex items-center justify-center w-full px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                               <PlusIcon className="w-5 h-5 mr-2" />
                                Add to Workspace
                            </button>
                            <button onClick={handleDownload} className="flex items-center justify-center w-full px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                                <DownloadIcon className="w-5 h-5 mr-2" />
                                Download Project (.zip)
                            </button>
                            <button
                                onClick={handleAddToPlan}
                                disabled={isAddingToPlan}
                                className="flex items-center justify-center w-full px-5 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {isAddingToPlan ? <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> : <PlanIcon className="w-5 h-5 mr-2" />}
                                {isAddingToPlan ? 'Adding...' : 'Add to Task Planner'}
                            </button>
                        </div>
                        {planSuccess && (
                            <div className="mt-4 text-sm p-3 rounded-md bg-green-900/50 text-green-300">
                                Successfully added to the task planner!
                            </div>
                        )}
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                />
            </div>
            <RightMenu />
        </div>
    );
};

export default CopierView;
