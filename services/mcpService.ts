interface MCPTool {
    id: string;
    name: string;
    description: string;
    icon: string;
    packageName?: string;
    installCommand: string;
    mcpConfig: object;
}

export const MCP_TOOLS: MCPTool[] = [
    {
        id: 'sequential-thinking',
        name: 'Sequential Thinking',
        description: 'Step-by-step reasoning and problem-solving tool',
        icon: '🧠',
        packageName: '@modelcontextprotocol/server-sequential-thinking',
        installCommand: 'npx -y @modelcontextprotocol/server-sequential-thinking',
        mcpConfig: {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
        }
    },
    {
        id: 'playwright',
        name: 'Playwright',
        description: 'Browser automation and testing with Playwright',
        icon: '🎭',
        packageName: '@playwright/mcp',
        installCommand: 'npx @playwright/mcp@latest',
        mcpConfig: {
            "command": "npx",
            "args": ["@playwright/mcp@latest"]
        }
    },
    {
        id: 'cipher',
        name: 'Byterover Cipher',
        description: 'Encryption and decryption utilities',
        icon: '🔐',
        packageName: '@byterover/cipher',
        installCommand: 'npm install -g @byterover/cipher',
        mcpConfig: {
            "command": "@byterover/cipher"
        }
    },
    {
        id: 'filesystem',
        name: 'File System MCP',
        description: 'File system operations and management',
        icon: '📁',
        packageName: '@modelcontextprotocol/server-filesystem',
        installCommand: 'npx @modelcontextprotocol/server-filesystem',
        mcpConfig: {
            "command": "npx",
            "args": ["@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"]
        }
    },
    {
        id: 'github',
        name: 'GitHub MCP',
        description: 'GitHub repository and issue management',
        icon: '🐙',
        packageName: '@modelcontextprotocol/server-github',
        installCommand: 'npx @modelcontextprotocol/server-github',
        mcpConfig: {
            "command": "npx",
            "args": ["@modelcontextprotocol/server-github"]
        }
    },
    {
        id: 'puppeteer',
        name: 'Puppeteer MCP',
        description: 'Web scraping and browser automation',
        icon: '🤖',
        packageName: '@modelcontextprotocol/server-puppeteer',
        installCommand: 'npx @modelcontextprotocol/server-puppeteer',
        mcpConfig: {
            "command": "npx",
            "args": ["@modelcontextprotocol/server-puppeteer"]
        }
    },
    {
        id: 'sqlite',
        name: 'SQLite MCP',
        description: 'SQLite database operations and queries',
        icon: '🗄️',
        packageName: '@modelcontextprotocol/server-sqlite',
        installCommand: 'npx @modelcontextprotocol/server-sqlite',
        mcpConfig: {
            "command": "npx",
            "args": ["@modelcontextprotocol/server-sqlite", "/path/to/database.db"]
        }
    },
    {
        id: 'python',
        name: 'Python MCP',
        description: 'Python code execution and package management',
        icon: '🐍',
        packageName: '@modelcontextprotocol/server-python',
        installCommand: 'npx @modelcontextprotocol/server-python',
        mcpConfig: {
            "command": "npx",
            "args": ["@modelcontextprotocol/server-python"]
        }
    },
    {
        id: 'rust',
        name: 'Rust MCP',
        description: 'Rust development tools and cargo integration',
        icon: '🦀',
        packageName: '@modelcontextprotocol/server-rust',
        installCommand: 'npx @modelcontextprotocol/server-rust',
        mcpConfig: {
            "command": "npx",
            "args": ["@modelcontextprotocol/server-rust"]
        }
    },
    {
        id: 'docker',
        name: 'Docker MCP',
        description: 'Container management and Docker operations',
        icon: '🐳',
        packageName: '@modelcontextprotocol/server-docker',
        installCommand: 'npx @modelcontextprotocol/server-docker',
        mcpConfig: {
            "command": "npx",
            "args": ["@modelcontextprotocol/server-docker"]
        }
    },
    {
        id: 'kubernetes',
        name: 'Kubernetes MCP',
        description: 'Kubernetes cluster management and kubectl integration',
        icon: '☸️',
        packageName: '@modelcontextprotocol/server-kubernetes',
        installCommand: 'npx @modelcontextprotocol/server-kubernetes',
        mcpConfig: {
            "command": "npx",
            "args": ["@modelcontextprotocol/server-kubernetes"]
        }
    },
    {
        id: 'aws',
        name: 'AWS MCP',
        description: 'AWS services management and CLI integration',
        icon: '☁️',
        packageName: '@modelcontextprotocol/server-aws',
        installCommand: 'npx @modelcontextprotocol/server-aws',
        mcpConfig: {
            "command": "npx",
            "args": ["@modelcontextprotocol/server-aws"]
        }
    }
];

export class MCPInstaller {
    private async executeCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // Use dynamic import to avoid bundling issues
            import('child_process').then(({ exec }) => {
                exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
                    if (error) {
                        reject(new Error(`Command failed: ${error.message}\n${stderr}`));
                        return;
                    }
                    resolve(stdout);
                });
            }).catch(reject);
        });
    }

    private async updateMCPConfig(toolId: string, config: object): Promise<void> {
        try {
            // Try to read existing MCP configuration
            const homeDir = process.env.USERPROFILE || process.env.HOME || '';
            const configPath = `${homeDir}/.config/cline/mcp_servers.json`;
            
            let existingConfig: any = { servers: {} };
            
            try {
                // Use dynamic import for fs
                const fs = await import('fs');
                if (fs.existsSync(configPath)) {
                    const configContent = fs.readFileSync(configPath, 'utf8');
                    existingConfig = JSON.parse(configContent);
                }
                
                // Add or update the server configuration
                existingConfig.servers = existingConfig.servers || {};
                existingConfig.servers[toolId] = config;
                
                // Ensure the directory exists
                const path = await import('path');
                const configDir = path.dirname(configPath);
                fs.mkdirSync(configDir, { recursive: true });
                
                // Write the updated configuration
                fs.writeFileSync(configPath, JSON.stringify(existingConfig, null, 2));
                
                console.log(`MCP configuration updated at: ${configPath}`);
            } catch (fsError: any) {
                console.warn('Could not update MCP configuration file:', fsError.message);
                console.log('Manual MCP configuration needed:');
                console.log(JSON.stringify({ servers: { [toolId]: config } }, null, 2));
            }
        } catch (error: any) {
            console.warn('MCP config update failed:', error.message);
        }
    }

    async installTool(toolId: string): Promise<{ success: boolean; message: string }> {
        const tool = MCP_TOOLS.find(t => t.id === toolId);
        if (!tool) {
            return { success: false, message: 'Tool not found' };
        }

        try {
            console.log(`Installing ${tool.name}...`);
            console.log(`Executing: ${tool.installCommand}`);
            
            // Actually execute the installation command
            const output = await this.executeCommand(tool.installCommand);
            console.log('Installation output:', output);
            
            // Update the MCP configuration file
            await this.updateMCPConfig(toolId, tool.mcpConfig);
            
            return { 
                success: true, 
                message: `${tool.name} has been installed successfully!\n\nInstallation output:\n${output.slice(0, 200)}${output.length > 200 ? '...' : ''}\n\nMCP configuration has been updated. You may need to restart your MCP client to see the new tools.` 
            };
        } catch (error: any) {
            console.error(`Failed to install ${tool.name}:`, error);
            return { 
                success: false, 
                message: `Failed to install ${tool.name}: ${error.message}` 
            };
        }
    }
}

export const mcpInstaller = new MCPInstaller();
