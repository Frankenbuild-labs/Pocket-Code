import React, { useEffect, useRef, useCallback, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { useAppContext } from '../context/AppContext';
import { resolvePath } from '../utils/path';
import type { FileSystemTree } from '../types';
import 'xterm/css/xterm.css';

interface WebContainerTerminalProps {
  onWebContainerReady?: (webcontainer: WebContainer) => void;
}

const WebContainerTerminal: React.FC<WebContainerTerminalProps> = ({ onWebContainerReady }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const terminalInstance = useRef<Terminal | null>(null);
    const webcontainer = useRef<WebContainer | null>(null);
    const fitAddon = useRef<FitAddon | null>(null);
    const [isBooting, setIsBooting] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [useFallback, setUseFallback] = useState(false);
    const cwd = useRef<string>('/');
    const commandHistory = useRef<string[]>([]);
    const historyIndex = useRef<number>(-1);

    const { 
        fileSystem, 
        setTerminalExecutor, 
        findNode, 
        getFileContent, 
        createFile, 
        createDirectory, 
        deleteNode, 
        moveNode, 
        copyNode 
    } = useAppContext();

    // Convert our virtual file system to WebContainer format
    const convertFileSystemToWebContainer = useCallback((fs: FileSystemTree): any => {
        const webcontainerFiles: any = {};
        
        const processNode = (node: any) => {
            if (node.type === 'file') {
                return {
                    file: {
                        contents: node.content || ''
                    }
                };
            } else if (node.type === 'directory') {
                const directory: any = {};
                for (const [name, child] of Object.entries(node.children)) {
                    directory[name] = processNode(child);
                }
                return {
                    directory
                };
            }
        };

        // Process root level files and directories
        for (const [name, node] of Object.entries(fs.children)) {
            webcontainerFiles[name] = processNode(node);
        }

        return webcontainerFiles;
    }, []);

    // Fallback shell command processor
    const processCommand = useCallback(async (cmd: string): Promise<{ output: string }> => {
        const [command, ...args] = cmd.trim().split(/\s+/).filter(Boolean);
        if (!command) return { output: '' };

        switch (command) {
            case 'ls': {
                const targetPath = resolvePath(cwd.current, args[0] || '.');
                const node = findNode(targetPath);
                if (!node || node.type !== 'directory') {
                    return { output: `ls: cannot access '${args[0] || '.'}': No such file or directory` };
                }
                const entries = Object.entries(node.children)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([name, child]) => {
                        return child.type === 'directory' ? `\x1b[1;34m${name}/\x1b[0m` : name;
                    });
                return { output: entries.join('\n') };
            }
            case 'cd': {
                if (!args[0]) return { output: '' };
                const newPath = resolvePath(cwd.current, args[0]);
                const node = findNode(newPath);
                if (node && node.type === 'directory') {
                    cwd.current = newPath;
                    return { output: '' };
                }
                return { output: `cd: no such file or directory: ${args[0]}` };
            }
            case 'pwd':
                return { output: cwd.current };
            case 'cat': {
                if (!args[0]) return { output: `cat: missing operand` };
                const targetPath = resolvePath(cwd.current, args[0]);
                const content = getFileContent(targetPath);
                if (content === null) {
                    const node = findNode(targetPath);
                    if (node?.type === 'directory') return { output: `cat: ${args[0]}: Is a directory` };
                    return { output: `cat: ${args[0]}: No such file or directory` };
                }
                return { output: content };
            }
            case 'touch': {
                if (!args[0]) return { output: `touch: missing file operand` };
                const targetPath = resolvePath(cwd.current, args[0]);
                if (findNode(targetPath)) return { output: '' }; // File exists, do nothing
                const success = createFile(targetPath);
                return success ? { output: '' } : { output: `touch: cannot create file '${args[0]}'` };
            }
            case 'mkdir': {
                if (!args[0]) return { output: `mkdir: missing operand` };
                const targetPath = resolvePath(cwd.current, args[0]);
                if (findNode(targetPath)) return { output: `mkdir: cannot create directory '${args[0]}': File exists` };
                const success = createDirectory(targetPath);
                return success ? { output: '' } : { output: `mkdir: failed to create directory '${args[0]}'` };
            }
            case 'rm': {
                if (!args[0]) return { output: `rm: missing operand` };
                const targetPath = resolvePath(cwd.current, args[0]);
                const { success, error } = deleteNode(targetPath);
                return { output: success ? '' : error ?? 'Failed to remove' };
            }
            case 'mv': {
                if (args.length < 2) return { output: 'mv: missing destination file operand' };
                const sourcePath = resolvePath(cwd.current, args[0]);
                const destPath = resolvePath(cwd.current, args[1]);
                const { success, error } = moveNode(sourcePath, destPath);
                return { output: success ? '' : error ?? 'Failed to move' };
            }
            case 'cp': {
                if (args.length < 2) return { output: 'cp: missing destination file operand' };
                const sourcePath = resolvePath(cwd.current, args[0]);
                const destPath = resolvePath(cwd.current, args[1]);
                const { success, error } = copyNode(sourcePath, destPath);
                return { output: success ? '' : error ?? 'Failed to copy' };
            }
            case 'echo':
                return { output: args.join(' ') };
            case 'clear':
                terminalInstance.current?.clear();
                return { output: '' };
            case 'help':
                return { output: [
                    'PocketCode Shell - Built-in commands:',
                    'ls, cd, pwd, cat, touch, mkdir, rm, mv, cp, echo, clear, help',
                    '',
                    'Note: This is a fallback shell. For full Node.js support,',
                    'WebContainer needs proper CORS headers and SharedArrayBuffer support.'
                ].join('\n')};
            case 'node':
            case 'npm':
            case 'npx':
                return { output: `${command}: WebContainer required for Node.js commands. Please check browser console for initialization errors.` };
            default:
                return { output: `pocksh: command not found: ${command}` };
        }
    }, [findNode, getFileContent, createFile, createDirectory, deleteNode, moveNode, copyNode]);

    // Setup fallback shell
    const setupFallbackShell = useCallback((terminal: Terminal, fit: FitAddon) => {
        let command = '';

        const prompt = () => {
            command = '';
            terminal.write(`\r\n\x1b[1;32mpocket-coder\x1b[0m:\x1b[1;34m${cwd.current}\x1b[0m$ `);
        };

        terminal.clear();
        terminal.writeln('🔄 WebContainer initialization failed - Using fallback shell');
        terminal.writeln('📁 Virtual file system shell active');
        terminal.writeln('Type "help" for available commands.');
        prompt();

        terminal.onKey(async ({ key, domEvent }) => {
            const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

            if (domEvent.key === 'Enter') {
                if (command.trim()) {
                    terminal.write('\r\n');
                    commandHistory.current.push(command);
                    historyIndex.current = commandHistory.current.length;
                    const { output } = await processCommand(command);
                    if (output) {
                        terminal.write(output.replace(/\n/g, '\r\n'));
                    }
                }
                prompt();
            } else if (domEvent.key === 'Backspace') {
                if (command.length > 0) {
                    terminal.write('\b \b');
                    command = command.slice(0, -1);
                }
            } else if (domEvent.key === 'ArrowUp' || domEvent.key === 'ArrowDown') {
                let newIndex = historyIndex.current;
                if (domEvent.key === 'ArrowUp') {
                    newIndex = Math.max(-1, newIndex - 1);
                } else {
                    newIndex = Math.min(commandHistory.current.length, newIndex + 1);
                }
                
                if (newIndex !== historyIndex.current) {
                    historyIndex.current = newIndex;
                    const newCommand = commandHistory.current[newIndex] || '';
                    terminal.write('\x1b[2K\r'); // Clear current line
                    prompt();
                    terminal.write(newCommand);
                    command = newCommand;
                }
            } else if (printable) {
                command += key;
                terminal.write(key);
            }
        });

        // Set up fallback terminal executor for AI tools
        const fallbackExecutor = async (aiCommand: string): Promise<string> => {
            if (!terminal) return "Error: Terminal not ready.";
            terminal.write(`\r\n\x1b[1;32mAI > \x1b[0m${aiCommand}\r\n`);
            const { output } = await processCommand(aiCommand);
            if (output) {
                terminal.write(output.replace(/\n/g, '\r\n') + '\r\n');
            }
            return output || 'Command executed successfully.';
        };

        setTerminalExecutor(fallbackExecutor);
        setUseFallback(true);
        setIsBooting(false);
        setError(null);
    }, [processCommand, setTerminalExecutor]);

    // Initialize WebContainer or fallback terminal
    useEffect(() => {
        let mounted = true;
        let cleanupFns: (() => void)[] = [];

        const initializeTerminal = async () => {
            if (!terminalRef.current || !mounted) return;

            try {
                // Create terminal instance
                const terminal = new Terminal({
                    cursorBlink: true,
                    theme: {
                        background: '#000000',
                        foreground: '#ffffff',
                        cursor: '#ffffff'
                    },
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    fontSize: 14,
                    convertEol: true,
                });

                const fit = new FitAddon();
                const webLinks = new WebLinksAddon();
                
                terminal.loadAddon(fit);
                terminal.loadAddon(webLinks);

                if (!terminalRef.current || !mounted) return;
                terminal.open(terminalRef.current);
                
                // Wait a bit for proper initialization
                setTimeout(() => {
                    if (mounted && fit) {
                        try {
                            fit.fit();
                        } catch (e) {
                            console.warn('Fit addon error:', e);
                        }
                    }
                }, 100);

                terminalInstance.current = terminal;
                fitAddon.current = fit;

                // Always start with fallback shell - it's more reliable
                terminal.writeln('🔄 Initializing PocketCode Terminal...');
                
                // Try WebContainer with timeout, but fallback quickly
                let useWebContainer = false;
                try {
                    if (typeof SharedArrayBuffer !== 'undefined') {
                        terminal.writeln('🚀 Attempting WebContainer initialization...');
                        
                        const timeoutPromise = new Promise((_, reject) => {
                            setTimeout(() => reject(new Error('WebContainer timeout')), 3000);
                        });

                        const webContainerPromise = WebContainer.boot();
                        const wc = await Promise.race([webContainerPromise, timeoutPromise]) as WebContainer;
                        
                        if (mounted) {
                            webcontainer.current = wc;
                            terminal.writeln('✅ WebContainer available!');
                            useWebContainer = true;

                            // Set up WebContainer terminal executor
                            const webContainerExecutor = async (command: string): Promise<string> => {
                                if (!wc) return "Error: WebContainer not available.";
                                try {
                                    const proc = await wc.spawn('sh', ['-c', command]);
                                    const output = await proc.output.getReader().read();
                                    return new TextDecoder().decode(output.value || new Uint8Array());
                                } catch (error) {
                                    return `Error executing command: ${error}`;
                                }
                            };

                            setTerminalExecutor(webContainerExecutor);
                            if (onWebContainerReady) onWebContainerReady(wc);
                        }
                    }
                } catch (error: any) {
                    console.warn('WebContainer failed, using fallback:', error);
                }

                // Always setup fallback shell (works with or without WebContainer)
                if (mounted) {
                    setupFallbackShell(terminal, fit);
                }

                cleanupFns.push(() => {
                    if (terminal) terminal.dispose();
                    if (webcontainer.current) {
                        try {
                            webcontainer.current.teardown();
                        } catch (e) {
                            console.warn('WebContainer teardown error:', e);
                        }
                    }
                });

            } catch (error: any) {
                console.error('Terminal initialization error:', error);
                if (mounted) {
                    setError(error.message || 'Terminal initialization failed');
                    setIsBooting(false);
                }
            }
        };

        // Add delay to prevent rapid re-initialization
        const timer = setTimeout(initializeTerminal, 200);
        
        return () => {
            mounted = false;
            clearTimeout(timer);
            cleanupFns.forEach(fn => {
                try {
                    fn();
                } catch (e) {
                    console.warn('Cleanup error:', e);
                }
            });
        };
    }, []); // Remove dependencies to prevent re-initialization

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (fitAddon.current) {
                fitAddon.current.fit();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="h-full w-full flex flex-col relative">
            {isBooting && (
                <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-10">
                    <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                        <p>Initializing Terminal...</p>
                        <p className="text-sm text-gray-400 mt-2">
                            {useFallback ? 'Setting up fallback shell...' : 'Attempting WebContainer...'}
                        </p>
                    </div>
                </div>
            )}
            <div 
                ref={terminalRef} 
                className="h-full w-full"
                style={{ opacity: isBooting ? 0.3 : 1 }}
            />
            {isReady && !useFallback && (
                <div className="absolute top-2 right-2 text-green-400 text-sm">
                    🟢 WebContainer Ready
                </div>
            )}
            {useFallback && (
                <div className="absolute top-2 right-2 text-yellow-400 text-sm">
                    🟡 Fallback Shell Active
                </div>
            )}
            {error && isBooting && (
                <div className="absolute top-2 right-2 text-red-400 text-sm">
                    ⚠️ Initializing Fallback
                </div>
            )}
        </div>
    );
};

export default WebContainerTerminal;
