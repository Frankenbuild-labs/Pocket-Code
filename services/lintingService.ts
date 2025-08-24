import { Linter } from 'eslint-linter-browserify';
import type { LintError } from '../types';

const linter = new Linter();

const config = {
    languageOptions: {
        ecmaVersion: 'latest' as const,
        sourceType: 'module' as const,
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
        globals: {
            // Common browser globals
            window: 'readonly',
            document: 'readonly',
            console: 'readonly',
            setTimeout: 'readonly',
            setInterval: 'readonly',
            clearTimeout: 'readonly',
            clearInterval: 'readonly',
            fetch: 'readonly',
            Promise: 'readonly',
            atob: 'readonly',
            btoa: 'readonly',
            TextDecoder: 'readonly',
            Uint8Array: 'readonly',
            globalThis: 'readonly',
            navigator: 'readonly',
            // Common node/bundler globals
            process: 'readonly',
        } as const,
    },
    rules: {
        'no-unused-vars': ['warn'],
        'no-undef': ['error'],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'no-const-assign': ['error'],
        'no-dupe-keys': ['error'],
        'no-empty': ['warn'],
    },
};

export const lintCode = async (code: string): Promise<LintError[]> => {
    try {
        const messages = linter.verify(code, config);
        return messages.map(msg => ({
            line: msg.line,
            column: msg.column,
            message: msg.message,
            ruleId: msg.ruleId,
        }));
    } catch (e) {
        console.error("Error during linting:", e);
        return [];
    }
};