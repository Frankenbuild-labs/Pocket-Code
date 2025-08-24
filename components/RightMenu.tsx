
import React, { useState, useEffect } from 'react';
import ResizablePanel from './ResizablePanel';
import { SettingsIcon, UserIcon, PlusIcon, TrashIcon, EditIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { userStorageService, UserProfile, Workspace } from '../services/userStorageService';

type ActiveTab = 'profile' | 'settings';

const RightMenu: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('settings');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userWorkspaces, setUserWorkspaces] = useState<Workspace[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [showNewWorkspaceForm, setShowNewWorkspaceForm] = useState(false);
    const { settings, updateSystemPrompt, updateClearChatOnClone, toggleTTS } = useAppContext();

    useEffect(() => {
        initializeProfile();
    }, []);

    const initializeProfile = async () => {
        setIsLoading(true);
        try {
            // Initialize database and create demo user if needed
            await userStorageService.init();
            const profile = await userStorageService.createDemoUser();
            setUserProfile(profile);
            
            // Load user workspaces
            const workspaces = await userStorageService.getUserWorkspaces(profile.id);
            setUserWorkspaces(workspaces);
        } catch (error) {
            console.error('Error initializing profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createNewWorkspace = async () => {
        if (!userProfile || !newWorkspaceName.trim()) return;

        try {
            const workspace = await userStorageService.createWorkspace({
                userId: userProfile.id,
                name: newWorkspaceName.trim(),
                description: '',
                files: {},
                settings: {}
            });

            setUserWorkspaces(prev => [...prev, workspace]);
            setNewWorkspaceName('');
            setShowNewWorkspaceForm(false);
        } catch (error) {
            console.error('Error creating workspace:', error);
        }
    };

    const deleteWorkspace = async (workspaceId: string) => {
        if (!confirm('Are you sure you want to delete this workspace?')) return;

        try {
            await userStorageService.deleteWorkspace(workspaceId);
            setUserWorkspaces(prev => prev.filter(ws => ws.id !== workspaceId));
        } catch (error) {
            console.error('Error deleting workspace:', error);
        }
    };

    const commonTabClasses = "flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 focus:outline-none transition-colors";
    const activeTabClasses = "border-cyan-500 text-white";
    const inactiveTabClasses = "border-transparent text-gray-400 hover:text-white hover:bg-gray-700/50";

    return (
        <ResizablePanel initialSize={350} minSize={250} direction="horizontal" dividerPosition="left">
            <div className="flex flex-col h-full w-full bg-gray-800 border-l border-gray-700">
                {/* Tabs */}
                <div className="flex-shrink-0 flex items-center bg-gray-800 border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`${commonTabClasses} ${activeTab === 'profile' ? activeTabClasses : inactiveTabClasses}`}
                    >
                        <UserIcon className="w-4 h-4" />
                        <span>Profile</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`${commonTabClasses} ${activeTab === 'settings' ? activeTabClasses : inactiveTabClasses}`}
                    >
                         <SettingsIcon className="w-4 h-4" />
                        <span>Settings</span>
                    </button>
                </div>
                {/* Content */}
                <div className="flex-grow overflow-auto p-4 text-gray-300">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-sm text-gray-400">Loading profile...</div>
                                </div>
                            ) : userProfile ? (
                                <>
                                    {/* User Profile Info */}
                                    <div className="bg-gray-900/50 rounded-lg p-4">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-xl">
                                                {userProfile.avatar || '👨‍💻'}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">
                                                    {userProfile.firstName} {userProfile.lastName}
                                                </h3>
                                                <p className="text-sm text-gray-400">{userProfile.email}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-400">Member since:</span>
                                                <p className="text-white">{new Date(userProfile.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Last login:</span>
                                                <p className="text-white">{new Date(userProfile.lastLoginAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Preferences */}
                                    <div className="border-t border-gray-700 pt-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg">
                                                <div>
                                                    <span className="text-white font-medium">Theme</span>
                                                    <p className="text-sm text-gray-400">Current: {userProfile.preferences.theme}</p>
                                                </div>
                                                <div className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                                                    {userProfile.preferences.theme}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg">
                                                <div>
                                                    <span className="text-white font-medium">Auto Save</span>
                                                    <p className="text-sm text-gray-400">Automatically save your work</p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-sm ${userProfile.preferences.autoSave ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {userProfile.preferences.autoSave ? 'Enabled' : 'Disabled'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Workspaces */}
                                    <div className="border-t border-gray-700 pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-white">My Workspaces</h3>
                                            <button
                                                onClick={() => setShowNewWorkspaceForm(!showNewWorkspaceForm)}
                                                className="flex items-center space-x-1 px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-sm rounded-md transition-colors"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                                <span>New</span>
                                            </button>
                                        </div>

                                        {showNewWorkspaceForm && (
                                            <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
                                                <div className="flex space-x-2">
                                                    <input
                                                        type="text"
                                                        value={newWorkspaceName}
                                                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                                                        placeholder="Workspace name..."
                                                        className="flex-1 bg-gray-800 text-white rounded-md border border-gray-600 px-3 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                                        onKeyDown={(e) => e.key === 'Enter' && createNewWorkspace()}
                                                    />
                                                    <button
                                                        onClick={createNewWorkspace}
                                                        disabled={!newWorkspaceName.trim()}
                                                        className="px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-md transition-colors"
                                                    >
                                                        Create
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            {userWorkspaces.length === 0 ? (
                                                <div className="text-center py-8 text-gray-400">
                                                    <p>No workspaces yet.</p>
                                                    <p className="text-sm">Create your first workspace to get started!</p>
                                                </div>
                                            ) : (
                                                userWorkspaces.map(workspace => (
                                                    <div key={workspace.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2">
                                                                <h4 className="text-white font-medium">{workspace.name}</h4>
                                                                {workspace.isActive && (
                                                                    <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                                                        Active
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-400">
                                                                Modified: {new Date(workspace.lastModified).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                Files: {Object.keys(workspace.files).length}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => {/* TODO: Load workspace */}}
                                                                className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                                                                title="Load workspace"
                                                            >
                                                                <EditIcon className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteWorkspace(workspace.id)}
                                                                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                                                title="Delete workspace"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <p>Unable to load profile.</p>
                                    <button 
                                        onClick={initializeProfile}
                                        className="mt-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm rounded-md transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'settings' && (
                       <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">AI Behavior</h3>
                                <p className="text-sm text-gray-400 mb-3">
                                    Customize the AI's core instructions (system prompt). This defines its personality, coding style, and how it responds to your requests. Changes are applied on your next message.
                                </p>
                                <textarea
                                    value={settings.systemPrompt}
                                    onChange={(e) => updateSystemPrompt(e.target.value)}
                                    rows={15}
                                    className="w-full bg-gray-900 text-gray-300 rounded-md border border-gray-600 px-3 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                                />
                            </div>
                            <div className="border-t border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-white mb-2">Workspace Settings</h3>
                                <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg">
                                    <div>
                                        <label htmlFor="clear-chat-toggle" className="font-medium text-white">Clear Chat on Clone</label>
                                        <p className="text-sm text-gray-400">Automatically start a new conversation when cloning a repository.</p>
                                    </div>
                                    <label htmlFor="clear-chat-toggle" className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                id="clear-chat-toggle" 
                                                className="sr-only"
                                                checked={settings.clearChatOnClone}
                                                onChange={(e) => updateClearChatOnClone(e.target.checked)}
                                            />
                                            <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.clearChatOnClone ? 'transform translate-x-6 bg-cyan-400' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="border-t border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-white mb-2">Accessibility</h3>
                                <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg">
                                    <div>
                                        <label htmlFor="tts-toggle" className="font-medium text-white">Enable Voice Responses</label>
                                        <p className="text-sm text-gray-400">Have the AI's responses read out loud.</p>
                                    </div>
                                    <label htmlFor="tts-toggle" className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                id="tts-toggle" 
                                                className="sr-only"
                                                checked={settings.isTTSenabled}
                                                onChange={toggleTTS}
                                            />
                                            <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.isTTSenabled ? 'transform translate-x-6 bg-cyan-400' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ResizablePanel>
    );
};

export default RightMenu;
