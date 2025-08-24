interface CLITool {
    id: string;
    name: string;
    description: string;
    icon: string;
    installCommand: string;
    verifyCommand: string;
    category: 'ai' | 'development' | 'cloud' | 'productivity';
}

export const CLI_TOOLS: CLITool[] = [
    {
        id: 'cline',
        name: 'Cline CLI',
        description: 'AI-powered coding assistant CLI for terminal workflows',
        icon: '🤖',
        installCommand: 'npm install -g @saoudrizwan/cline-cli',
        verifyCommand: 'cline --version',
        category: 'ai'
    },
    {
        id: 'claude',
        name: 'Claude CLI',
        description: 'Anthropic Claude AI CLI for terminal interactions',
        icon: '🧠',
        installCommand: 'npm install -g @anthropic-ai/claude-cli',
        verifyCommand: 'claude --version',
        category: 'ai'
    },
    {
        id: 'gemini',
        name: 'Gemini CLI',
        description: 'Google Gemini AI CLI for command-line AI interactions',
        icon: '💎',
        installCommand: 'npm install -g @google-ai/gemini-cli',
        verifyCommand: 'gemini --version',
        category: 'ai'
    },
    {
        id: 'openai',
        name: 'OpenAI CLI',
        description: 'Official OpenAI CLI for GPT models and API management',
        icon: '🔥',
        installCommand: 'pip install openai-cli',
        verifyCommand: 'openai --version',
        category: 'ai'
    },
    {
        id: 'gh',
        name: 'GitHub CLI',
        description: 'Official GitHub CLI for repository management',
        icon: '🐙',
        installCommand: 'npm install -g gh',
        verifyCommand: 'gh --version',
        category: 'development'
    },
    {
        id: 'vercel',
        name: 'Vercel CLI',
        description: 'Deploy and manage projects on Vercel platform',
        icon: '▲',
        installCommand: 'npm install -g vercel',
        verifyCommand: 'vercel --version',
        category: 'cloud'
    },
    {
        id: 'netlify',
        name: 'Netlify CLI',
        description: 'Deploy and manage Netlify sites from terminal',
        icon: '🌐',
        installCommand: 'npm install -g netlify-cli',
        verifyCommand: 'netlify --version',
        category: 'cloud'
    },
    {
        id: 'aws',
        name: 'AWS CLI',
        description: 'Amazon Web Services command line interface',
        icon: '☁️',
        installCommand: 'pip install awscli',
        verifyCommand: 'aws --version',
        category: 'cloud'
    },
    {
        id: 'gcloud',
        name: 'Google Cloud CLI',
        description: 'Google Cloud Platform command line tools',
        icon: '🌤️',
        installCommand: 'curl https://sdk.cloud.google.com | bash',
        verifyCommand: 'gcloud --version',
        category: 'cloud'
    },
    {
        id: 'firebase',
        name: 'Firebase CLI',
        description: 'Firebase command line tools for app development',
        icon: '🔥',
        installCommand: 'npm install -g firebase-tools',
        verifyCommand: 'firebase --version',
        category: 'cloud'
    },
    {
        id: 'docker',
        name: 'Docker CLI',
        description: 'Container platform command line interface',
        icon: '🐳',
        installCommand: 'echo "Please install Docker Desktop for your platform"',
        verifyCommand: 'docker --version',
        category: 'development'
    },
    {
        id: 'kubectl',
        name: 'Kubernetes CLI',
        description: 'Kubernetes cluster management command line tool',
        icon: '☸️',
        installCommand: 'curl -LO https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl',
        verifyCommand: 'kubectl version --client',
        category: 'development'
    }
];

export class CLIInstaller {
    private async executeCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            import('child_process').then(({ exec }) => {
                exec(command, { timeout: 120000 }, (error, stdout, stderr) => {
                    if (error) {
                        reject(new Error(`Command failed: ${error.message}\n${stderr}`));
                        return;
                    }
                    resolve(stdout);
                });
            }).catch(reject);
        });
    }

    private async verifyInstallation(verifyCommand: string): Promise<boolean> {
        try {
            await this.executeCommand(verifyCommand);
            return true;
        } catch (error) {
            return false;
        }
    }

    async installTool(toolId: string): Promise<{ success: boolean; message: string }> {
        const tool = CLI_TOOLS.find(t => t.id === toolId);
        if (!tool) {
            return { success: false, message: 'CLI tool not found' };
        }

        try {
            console.log(`Installing ${tool.name}...`);
            console.log(`Executing: ${tool.installCommand}`);
            
            // Check if already installed
            const alreadyInstalled = await this.verifyInstallation(tool.verifyCommand);
            if (alreadyInstalled) {
                return { 
                    success: true, 
                    message: `${tool.name} is already installed and available in your terminal!` 
                };
            }
            
            // Actually execute the installation command
            const output = await this.executeCommand(tool.installCommand);
            console.log('Installation output:', output);
            
            // Verify the installation was successful
            const isInstalled = await this.verifyInstallation(tool.verifyCommand);
            
            if (isInstalled) {
                return { 
                    success: true, 
                    message: `${tool.name} has been installed successfully!\n\nInstallation output:\n${output.slice(0, 200)}${output.length > 200 ? '...' : ''}\n\nYou can now use '${tool.id}' command in the terminal.` 
                };
            } else {
                return { 
                    success: false, 
                    message: `${tool.name} installation completed but verification failed. Please check your PATH environment variable.` 
                };
            }
        } catch (error: any) {
            console.error(`Failed to install ${tool.name}:`, error);
            return { 
                success: false, 
                message: `Failed to install ${tool.name}: ${error.message}` 
            };
        }
    }

    async checkInstalled(toolId: string): Promise<boolean> {
        const tool = CLI_TOOLS.find(t => t.id === toolId);
        if (!tool) return false;
        
        return await this.verifyInstallation(tool.verifyCommand);
    }
}

export const cliInstaller = new CLIInstaller();
