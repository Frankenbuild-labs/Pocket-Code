import React, { useState } from 'react';
import ResizablePanel from './ResizablePanel';
import { WorkspacesIcon, MCPIcon, SpinnerIcon, PlanIcon, CLIIcon } from './icons';
import { cloneGitHubRepo } from '../services/gitService';
import { generatePlan } from '../services/aiService';
import { useAppContext } from '../context/AppContext';
import { MCP_TOOLS, mcpInstaller } from '../services/mcpService';
import { CLI_TOOLS, cliInstaller } from '../services/cliService';

type ActiveTab = 'workspaces' | 'plan' | 'mcp' | 'cli';

interface MCPToolCardProps {
    toolId: string;
    name: string;
    description: string;
    icon: string;
}

interface CLIToolCardProps {
    id: string;
    name: string;
    description: string;
    icon: string;
    installCommand: string;
    verifyCommand: string;
    category: 'ai' | 'development' | 'cloud' | 'productivity';
}

const CLIToolCard: React.FC<CLIToolCardProps> = ({ id, name, description, icon }) => {
    const [isInstalling, setIsInstalling] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [installMessage, setInstallMessage] = useState<string | null>(null);

    const handleInstall = async () => {
        setIsInstalling(true);
        setInstallMessage(null);
        
        try {
            const result = await cliInstaller.installTool(id);
            setIsInstalled(result.success);
            setInstallMessage(result.message);
        } catch (error: any) {
            setInstallMessage(`Failed to install ${name}: ${error.message}`);
        } finally {
            setIsInstalling(false);
        }
    };

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">{icon}</span>
                    <div>
                        <h4 className="font-semibold text-white text-sm">{name}</h4>
                        <p className="text-xs text-gray-400 mt-1">{description}</p>
                    </div>
                </div>
                <button
                    onClick={handleInstall}
                    disabled={isInstalling || isInstalled}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        isInstalled
                            ? 'bg-green-600 text-white cursor-not-allowed'
                            : isInstalling
                            ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                            : 'bg-cyan-600 text-white hover:bg-cyan-700'
                    }`}
                >
                    {isInstalling ? (
                        <div className="flex items-center space-x-1">
                            <SpinnerIcon className="w-3 h-3 animate-spin" />
                            <span>Installing...</span>
                        </div>
                    ) : isInstalled ? (
                        '✓ Installed'
                    ) : (
                        'Install'
                    )}
                </button>
            </div>
            {installMessage && (
                <div className={`text-xs p-2 rounded-md ${
                    isInstalled ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                }`}>
                    {installMessage}
                </div>
            )}
        </div>
    );
};

const MCPToolCard: React.FC<MCPToolCardProps> = ({ toolId, name, description, icon }) => {
    const [isInstalling, setIsInstalling] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [installMessage, setInstallMessage] = useState<string | null>(null);

    const handleInstall = async () => {
        setIsInstalling(true);
        setInstallMessage(null);
        
        try {
            const result = await mcpInstaller.installTool(toolId);
            setIsInstalled(result.success);
            setInstallMessage(result.message);
        } catch (error: any) {
            setInstallMessage(`Failed to install ${name}: ${error.message}`);
        } finally {
            setIsInstalling(false);
        }
    };

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">{icon}</span>
                    <div>
                        <h4 className="font-semibold text-white text-sm">{name}</h4>
                        <p className="text-xs text-gray-400 mt-1">{description}</p>
                    </div>
                </div>
                <button
                    onClick={handleInstall}
                    disabled={isInstalling || isInstalled}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        isInstalled
                            ? 'bg-green-600 text-white cursor-not-allowed'
                            : isInstalling
                            ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                            : 'bg-cyan-600 text-white hover:bg-cyan-700'
                    }`}
                >
                    {isInstalling ? (
                        <div className="flex items-center space-x-1">
                            <SpinnerIcon className="w-3 h-3 animate-spin" />
                            <span>Installing...</span>
                        </div>
                    ) : isInstalled ? (
                        '✓ Installed'
                    ) : (
                        'Install'
                    )}
                </button>
            </div>
            {installMessage && (
                <div className={`text-xs p-2 rounded-md ${
                    isInstalled ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                }`}>
                    {installMessage}
                </div>
            )}
        </div>
    );
};

const LeftMenu: React.FC = () => {
    const { replaceFileSystem, getFileSystemStructure } = useAppContext();
    const [activeTab, setActiveTab] = useState<ActiveTab>('plan');
    const [repoUrl, setRepoUrl] = useState('https://github.com/reactjs/reactjs.org');
    const [isCloning, setIsCloning] = useState(false);
    const [cloneMessage, setCloneMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const [goal, setGoal] = useState('');
    const [plan, setPlan] = useState<{ text: string; completed: boolean }[]>([]);
    const [isPlanning, setIsPlanning] = useState(false);
    const [planError, setPlanError] = useState<string | null>(null);

    // State for editing plan items
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');

    const handleCloneRepo = async () => {
        if (!repoUrl || isCloning) return;
        setIsCloning(true);
        setCloneMessage(null);
        try {
            const newFileSystem = await cloneGitHubRepo(repoUrl);
            replaceFileSystem(newFileSystem);
            setCloneMessage({ type: 'success', text: 'Repository cloned successfully!' });
        } catch (error) {
            console.error(error);
            setCloneMessage({ type: 'error', text: error instanceof Error ? error.message : 'An unknown error occurred.' });
        } finally {
            setIsCloning(false);
        }
    };

    const handleGeneratePlan = async () => {
        if (!goal || isPlanning) return;
        setIsPlanning(true);
        setPlanError(null);
        setPlan([]);
        try {
            const fileStructure = getFileSystemStructure();
            const planSteps = await generatePlan(goal, fileStructure);
            setPlan(planSteps.map(step => ({ text: step, completed: false })));
        } catch (error) {
            console.error(error);
            setPlanError(error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            setIsPlanning(false);
        }
    };

    const handleTogglePlanStep = (index: number) => {
        setPlan(prevPlan => {
            const newPlan = [...prevPlan];
            newPlan[index].completed = !newPlan[index].completed;
            return newPlan;
        });
    };

    const handleStartEditing = (index: number, currentText: string) => {
        setEditingIndex(index);
        setEditingText(currentText);
    };

    const handleSaveEdit = () => {
        if (editingIndex === null) return;
        setPlan(prevPlan => {
            const newPlan = [...prevPlan];
            newPlan[editingIndex].text = editingText.trim();
            return newPlan;
        });
        setEditingIndex(null);
        setEditingText('');
    };
    
    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditingText('');
    };

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    const commonTabClasses = "flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 focus:outline-none transition-colors";
    const activeTabClasses = "border-cyan-500 text-white";
    const inactiveTabClasses = "border-transparent text-gray-400 hover:text-white hover:bg-gray-700/50";

    return (
        <ResizablePanel initialSize={400} minSize={300} direction="horizontal">
            <div className="flex flex-col h-full w-full bg-gray-800 border-r border-gray-700">
                {/* Tabs */}
                <div className="flex-shrink-0 flex items-center bg-gray-800 border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab('workspaces')}
                        className={`${commonTabClasses} ${activeTab === 'workspaces' ? activeTabClasses : inactiveTabClasses}`}
                    >
                        <WorkspacesIcon className="w-4 h-4" />
                        <span>Workspaces</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('plan')}
                        className={`${commonTabClasses} ${activeTab === 'plan' ? activeTabClasses : inactiveTabClasses}`}
                    >
                        <PlanIcon className="w-4 h-4" />
                        <span>Plan</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('mcp')}
                        className={`${commonTabClasses} ${activeTab === 'mcp' ? activeTabClasses : inactiveTabClasses}`}
                    >
                         <MCPIcon className="w-4 h-4" />
                        <span>MCP</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('cli')}
                        className={`${commonTabClasses} ${activeTab === 'cli' ? activeTabClasses : inactiveTabClasses}`}
                    >
                         <CLIIcon className="w-4 h-4" />
                        <span>CLI</span>
                    </button>
                </div>
                {/* Content */}
                <div className="flex-grow overflow-auto p-4 text-gray-400">
                    {activeTab === 'workspaces' && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Clone Workspace</h3>
                            <p className="text-sm mb-4">Replace the current workspace by cloning a public GitHub repository.</p>
                            
                            <div className="space-y-2">
                                <label htmlFor="repo-url" className="text-xs font-medium text-gray-400">GitHub Repository URL</label>
                                <input
                                    id="repo-url"
                                    type="text"
                                    value={repoUrl}
                                    onChange={(e) => setRepoUrl(e.target.value)}
                                    placeholder="https://github.com/owner/repo"
                                    className="w-full bg-gray-900 text-white rounded-md border border-gray-600 px-3 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                    disabled={isCloning}
                                />
                                <button
                                    onClick={handleCloneRepo}
                                    disabled={isCloning || !repoUrl.trim()}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isCloning ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Clone Repository'}
                                </button>
                            </div>

                            {cloneMessage && (
                                <div className={`mt-4 text-sm p-3 rounded-md ${cloneMessage.type === 'error' ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
                                    {cloneMessage.text}
                                </div>
                            )}

                            <div className="mt-6 border-t border-gray-700 pt-4">
                                <h4 className="text-md font-semibold text-white mb-2">Current Project</h4>
                                <p className="text-sm">The file tree on the editor view shows the currently loaded project.</p>
                            </div>
                        </div>
                    )}
                    {activeTab === 'plan' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">Task Planner</h3>
                            <p className="text-sm">Describe your goal, and the AI will generate a step-by-step plan for you.</p>

                            <div className="space-y-2">
                                <label htmlFor="goal-input" className="text-xs font-medium text-gray-400">Your Goal</label>
                                <textarea
                                    id="goal-input"
                                    rows={3}
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    placeholder="e.g., 'Create a React component for a contact form'"
                                    className="w-full bg-gray-900 text-white rounded-md border border-gray-600 px-3 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                    disabled={isPlanning}
                                />
                                <button
                                    onClick={handleGeneratePlan}
                                    disabled={isPlanning || !goal.trim()}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isPlanning ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Generate Plan'}
                                </button>
                            </div>

                            {planError && (
                                <div className="mt-4 text-sm p-3 rounded-md bg-red-900/50 text-red-300">
                                    {planError}
                                </div>
                            )}

                            {plan.length > 0 && (
                                <div className="mt-4 border-t border-gray-700 pt-4">
                                    <h4 className="text-md font-semibold text-white mb-2">Your Plan</h4>
                                    <ul className="space-y-2">
                                        {plan.map((item, index) => (
                                            <li key={index} className="flex items-start text-sm">
                                                <input
                                                    type="checkbox"
                                                    id={`step-${index}`}
                                                    checked={item.completed}
                                                    onChange={() => handleTogglePlanStep(index)}
                                                    className="mt-1 mr-3 h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                                />
                                                {editingIndex === index ? (
                                                    <input
                                                        type="text"
                                                        value={editingText}
                                                        onChange={(e) => setEditingText(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyDown={handleEditKeyDown}
                                                        className="flex-1 bg-gray-900 text-white outline-none border border-cyan-500 rounded px-1 -mt-1 w-full"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <label
                                                        htmlFor={`step-${index}`}
                                                        onDoubleClick={() => handleStartEditing(index, item.text)}
                                                        className={`flex-1 cursor-pointer ${item.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}
                                                    >
                                                        {item.text}
                                                    </label>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'mcp' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">MCP Tools</h3>
                                <p className="text-sm text-gray-400 mb-4">Install real MCP tools with one click. No API keys required.</p>
                            </div>

                            <div className="space-y-4">
                                {/* AI & Reasoning Tools */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1">🧠 AI & Reasoning</h4>
                                    <div className="space-y-2">
                                        <MCPToolCard 
                                            toolId="sequential-thinking"
                                            name="Sequential Thinking"
                                            description="Step-by-step reasoning and problem-solving tool"
                                            icon="🧠"
                                        />
                                        <MCPToolCard 
                                            toolId="cipher"
                                            name="Byterover Cipher"
                                            description="Encryption and decryption utilities"
                                            icon="🔐"
                                        />
                                    </div>
                                </div>

                                {/* Development & Testing */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1">🔧 Development & Testing</h4>
                                    <div className="space-y-2">
                                        <MCPToolCard 
                                            toolId="github"
                                            name="GitHub MCP"
                                            description="GitHub repository and issue management"
                                            icon="🐙"
                                        />
                                        <MCPToolCard 
                                            toolId="playwright"
                                            name="Playwright"
                                            description="Browser automation and testing with Playwright"
                                            icon="🎭"
                                        />
                                        <MCPToolCard 
                                            toolId="puppeteer"
                                            name="Puppeteer MCP"
                                            description="Web scraping and browser automation"
                                            icon="🤖"
                                        />
                                        <MCPToolCard 
                                            toolId="filesystem"
                                            name="File System MCP"
                                            description="File system operations and management"
                                            icon="📁"
                                        />
                                    </div>
                                </div>

                                {/* Programming Languages */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1">🐍 Programming Languages</h4>
                                    <div className="space-y-2">
                                        <MCPToolCard 
                                            toolId="python"
                                            name="Python MCP"
                                            description="Python code execution and package management"
                                            icon="🐍"
                                        />
                                        <MCPToolCard 
                                            toolId="rust"
                                            name="Rust MCP"
                                            description="Rust development tools and cargo integration"
                                            icon="🦀"
                                        />
                                        <MCPToolCard 
                                            toolId="sqlite"
                                            name="SQLite MCP"
                                            description="SQLite database operations and queries"
                                            icon="🗄️"
                                        />
                                    </div>
                                </div>

                                {/* DevOps & Cloud */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1">☁️ DevOps & Cloud</h4>
                                    <div className="space-y-2">
                                        <MCPToolCard 
                                            toolId="docker"
                                            name="Docker MCP"
                                            description="Container management and Docker operations"
                                            icon="🐳"
                                        />
                                        <MCPToolCard 
                                            toolId="kubernetes"
                                            name="Kubernetes MCP"
                                            description="Kubernetes cluster management and kubectl integration"
                                            icon="☸️"
                                        />
                                        <MCPToolCard 
                                            toolId="aws"
                                            name="AWS MCP"
                                            description="AWS services management and CLI integration"
                                            icon="☁️"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'cli' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">CLI Tools</h3>
                                <p className="text-sm text-gray-400 mb-4">Install popular CLI tools with one click. Use them directly in the terminal.</p>
                            </div>

                            <div className="space-y-4">
                                {/* AI CLI Tools */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1">🤖 AI CLI Tools</h4>
                                    <div className="space-y-2">
                                        {CLI_TOOLS.filter(tool => tool.category === 'ai').map(tool => (
                                            <CLIToolCard key={tool.id} {...tool} />
                                        ))}
                                    </div>
                                </div>

                                {/* Development CLI Tools */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1">⚒️ Development</h4>
                                    <div className="space-y-2">
                                        {CLI_TOOLS.filter(tool => tool.category === 'development').map(tool => (
                                            <CLIToolCard key={tool.id} {...tool} />
                                        ))}
                                    </div>
                                </div>

                                {/* Cloud CLI Tools */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1">☁️ Cloud & Deployment</h4>
                                    <div className="space-y-2">
                                        {CLI_TOOLS.filter(tool => tool.category === 'cloud').map(tool => (
                                            <CLIToolCard key={tool.id} {...tool} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ResizablePanel>
    );
};

export default LeftMenu;
