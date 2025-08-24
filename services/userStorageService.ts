interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    createdAt: Date;
    lastLoginAt: Date;
    preferences: {
        theme: 'dark' | 'light';
        fontSize: number;
        autoSave: boolean;
        notifications: boolean;
    };
}

interface Workspace {
    id: string;
    userId: string;
    name: string;
    description?: string;
    files: { [path: string]: string };
    settings: any;
    lastModified: Date;
    createdAt: Date;
    isActive?: boolean;
}

interface UserSession {
    userId: string;
    activeWorkspaceId?: string;
    lastActivity: Date;
    sessionData: any;
}

class UserStorageService {
    private dbName = 'PocketCodeDB';
    private dbVersion = 1;
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object stores
                if (!db.objectStoreNames.contains('profiles')) {
                    const profileStore = db.createObjectStore('profiles', { keyPath: 'id' });
                    profileStore.createIndex('email', 'email', { unique: true });
                }

                if (!db.objectStoreNames.contains('workspaces')) {
                    const workspaceStore = db.createObjectStore('workspaces', { keyPath: 'id' });
                    workspaceStore.createIndex('userId', 'userId', { unique: false });
                    workspaceStore.createIndex('name', 'name', { unique: false });
                }

                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionStore = db.createObjectStore('sessions', { keyPath: 'userId' });
                }
            };
        });
    }

    // Profile Management
    async createProfile(profileData: Omit<UserProfile, 'id' | 'createdAt' | 'lastLoginAt'>): Promise<UserProfile> {
        if (!this.db) await this.init();

        const profile: UserProfile = {
            ...profileData,
            id: this.generateId(),
            createdAt: new Date(),
            lastLoginAt: new Date(),
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['profiles'], 'readwrite');
            const store = transaction.objectStore('profiles');
            const request = store.add(profile);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(profile);
        });
    }

    async getProfile(userId: string): Promise<UserProfile | null> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['profiles'], 'readonly');
            const store = transaction.objectStore('profiles');
            const request = store.get(userId);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || null);
        });
    }

    async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
        if (!this.db) await this.init();

        const profile = await this.getProfile(userId);
        if (!profile) return null;

        const updatedProfile = { ...profile, ...updates, lastLoginAt: new Date() };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['profiles'], 'readwrite');
            const store = transaction.objectStore('profiles');
            const request = store.put(updatedProfile);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(updatedProfile);
        });
    }

    // Workspace Management
    async createWorkspace(workspaceData: Omit<Workspace, 'id' | 'createdAt' | 'lastModified'>): Promise<Workspace> {
        if (!this.db) await this.init();

        const workspace: Workspace = {
            ...workspaceData,
            id: this.generateId(),
            createdAt: new Date(),
            lastModified: new Date(),
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['workspaces'], 'readwrite');
            const store = transaction.objectStore('workspaces');
            const request = store.add(workspace);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(workspace);
        });
    }

    async getUserWorkspaces(userId: string): Promise<Workspace[]> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['workspaces'], 'readonly');
            const store = transaction.objectStore('workspaces');
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || []);
        });
    }

    async getWorkspace(workspaceId: string): Promise<Workspace | null> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['workspaces'], 'readonly');
            const store = transaction.objectStore('workspaces');
            const request = store.get(workspaceId);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || null);
        });
    }

    async updateWorkspace(workspaceId: string, updates: Partial<Workspace>): Promise<Workspace | null> {
        if (!this.db) await this.init();

        const workspace = await this.getWorkspace(workspaceId);
        if (!workspace) return null;

        const updatedWorkspace = { ...workspace, ...updates, lastModified: new Date() };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['workspaces'], 'readwrite');
            const store = transaction.objectStore('workspaces');
            const request = store.put(updatedWorkspace);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(updatedWorkspace);
        });
    }

    async deleteWorkspace(workspaceId: string): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['workspaces'], 'readwrite');
            const store = transaction.objectStore('workspaces');
            const request = store.delete(workspaceId);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    // Session Management
    async saveSession(session: UserSession): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['sessions'], 'readwrite');
            const store = transaction.objectStore('sessions');
            const request = store.put(session);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async getSession(userId: string): Promise<UserSession | null> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const request = store.get(userId);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || null);
        });
    }

    // Auto-save functionality
    async autoSaveWorkspace(userId: string, workspaceId: string, files: { [path: string]: string }): Promise<void> {
        const workspace = await this.getWorkspace(workspaceId);
        if (workspace && workspace.userId === userId) {
            await this.updateWorkspace(workspaceId, { files });
        }
    }

    // Utility methods
    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    async clearAllData(): Promise<void> {
        if (!this.db) await this.init();

        const storeNames = ['profiles', 'workspaces', 'sessions'];
        
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(storeNames, 'readwrite');
            let completed = 0;

            const checkComplete = () => {
                completed++;
                if (completed === storeNames.length) resolve();
            };

            storeNames.forEach(storeName => {
                const store = transaction.objectStore(storeName);
                const request = store.clear();
                request.onerror = () => reject(request.error);
                request.onsuccess = checkComplete;
            });
        });
    }

    // Demo user for development
    async createDemoUser(): Promise<UserProfile> {
        const demoProfile: Omit<UserProfile, 'id' | 'createdAt' | 'lastLoginAt'> = {
            email: 'demo@pocketcode.dev',
            firstName: 'Demo',
            lastName: 'User',
            avatar: '👨‍💻',
            preferences: {
                theme: 'dark',
                fontSize: 14,
                autoSave: true,
                notifications: true
            }
        };

        try {
            const existingProfiles = await new Promise<UserProfile[]>((resolve, reject) => {
                const transaction = this.db!.transaction(['profiles'], 'readonly');
                const store = transaction.objectStore('profiles');
                const request = store.getAll();
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
            });

            if (existingProfiles.length > 0) {
                return existingProfiles[0]; // Return existing user
            }

            return await this.createProfile(demoProfile);
        } catch (error) {
            console.error('Error creating demo user:', error);
            throw error;
        }
    }
}

export const userStorageService = new UserStorageService();
export type { UserProfile, Workspace, UserSession };
