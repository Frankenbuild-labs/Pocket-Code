
import React, { useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { resolvePath } from '../utils/path';
import type { Directory, FileSystemNode } from '../types';

// Xterm.js types are not available globally, so we declare them
declare var Terminal: any;
// The FitAddon is loaded into the window object, not a global var
// declare var FitAddon: any;

const TerminalComponent: React.FC = () => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const term = useRef<any>(null);
    const cwd = useRef<string>('/');
    const { 
        findNode, getFileContent, createFile, createDirectory, deleteNode, moveNode, copyNode, setTerminalExecutor 
    } = useAppContext();
    const commandHistory = useRef<string[]>([]);
    const historyIndex = useRef<number>(-1);

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
                term.current?.clear();
                return { output: '' };
            case 'help':
                return { output: [
                    'jsh: A basic shell for Pocket Coder',
                    'Commands: ls, cd, pwd, cat, touch, mkdir, rm, mv, cp, echo, clear, help'
                ].join('\n')};
            default:
                return { output: `jsh: command not found: ${command}` };
        }
    }, [findNode, getFileContent, createFile, createDirectory, deleteNode, moveNode, copyNode]);

    useEffect(() => {
        if (!terminalRef.current || term.current) return;

        const xterm = new Terminal({
            cursorBlink: true,
            theme: { background: '#000000', foreground: '#FFFFFF', cursor: '#FFFFFF' },
            fontFamily: 'monospace',
            fontSize: 14,
            convertEol: true,
        });
        
        const fitAddon = new (window as any).FitAddon.FitAddon();
        xterm.loadAddon(fitAddon);
        xterm.open(terminalRef.current);
        fitAddon.fit();
        term.current = xterm;

        let command = '';

        const prompt = () => {
            command = '';
            xterm.write(`\r\n\x1b[1;32mpocket-coder\x1b[0m:\x1b[1;34m${cwd.current}\x1b[0m$ `);
        };

        xterm.writeln('Welcome to Pocket Coder Terminal (jsh)');
        xterm.writeln('Type "help" for a list of commands.');
        prompt();

        xterm.onKey(async ({ key, domEvent }) => {
            const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

            if (domEvent.key === 'Enter') {
                if (command.trim()) {
                    xterm.write('\r\n');
                    commandHistory.current.push(command);
                    historyIndex.current = commandHistory.current.length;
                    const { output } = await processCommand(command);
                    if (output) {
                        xterm.write(output.replace(/\n/g, '\r\n'));
                    }
                }
                prompt();
            } else if (domEvent.key === 'Backspace') {
                if (command.length > 0) {
                    xterm.write('\b \b');
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
                     xterm.write('\x1b[2K\r'); // Clear current line
                     prompt();
                     xterm.write(newCommand);
                     command = newCommand;
                 }
            } else if (printable) {
                command += key;
                xterm.write(key);
            }
        });

        const aiExecutor = async (aiCommand: string): Promise<string> => {
            if (!term.current) return "Error: Terminal not ready.";
            term.current.write(`\r\n\x1b[1;32mAI > \x1b[0m${aiCommand}\r\n`);
            const { output } = await processCommand(aiCommand);
            if (output) {
                term.current.write(output.replace(/\n/g, '\r\n') + '\r\n');
            }
            return output || 'Command executed successfully.';
        };

        setTerminalExecutor(aiExecutor);

        const handleResize = () => fitAddon.fit();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    return <div ref={terminalRef} className="h-full w-full" />;
};

export default TerminalComponent;
