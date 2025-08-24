import React from 'react';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-gray-900 to-purple-600/20"></div>
                
                {/* Navigation */}
                <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">P</span>
                        </div>
                        <span className="text-xl font-bold">PocketCode</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
                            Login
                        </button>
                        <button className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors">
                            Sign Up Free
                        </button>
                    </div>
                </nav>

                {/* Hero Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            The Future of<br />Coding on the Go
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                            Say goodbye to bulky downloads and hello to instant, powerful development. 
                            PocketCode brings enterprise-grade coding tools directly to your browser.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-lg font-semibold transition-colors">
                                Start Coding Now - Free
                            </button>
                            <button className="px-8 py-4 border border-gray-600 hover:border-gray-500 rounded-lg text-lg font-semibold transition-colors">
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    {/* Hero Image/Preview */}
                    <div className="mt-16 relative">
                        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-2 max-w-5xl mx-auto">
                            <div className="bg-gray-900 rounded-md overflow-hidden">
                                {/* Mock browser header */}
                                <div className="flex items-center space-x-2 p-3 bg-gray-800 border-b border-gray-700">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 mx-4">
                                        <div className="bg-gray-700 rounded-md px-3 py-1 text-sm text-gray-400">
                                            pocketcode.dev
                                        </div>
                                    </div>
                                </div>
                                {/* Mock interface */}
                                <div className="h-64 md:h-96 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-4">
                                    <div className="grid grid-cols-3 gap-4 h-full">
                                        <div className="bg-gray-800/50 rounded border border-gray-700 p-3">
                                            <div className="text-xs text-gray-400 mb-2">File Explorer</div>
                                            <div className="space-y-1">
                                                <div className="w-full h-2 bg-gray-700 rounded"></div>
                                                <div className="w-3/4 h-2 bg-gray-700 rounded"></div>
                                                <div className="w-full h-2 bg-gray-700 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-800/50 rounded border border-gray-700 p-3">
                                            <div className="text-xs text-gray-400 mb-2">Code Editor</div>
                                            <div className="space-y-1">
                                                <div className="w-full h-2 bg-cyan-600/30 rounded"></div>
                                                <div className="w-5/6 h-2 bg-purple-600/30 rounded"></div>
                                                <div className="w-full h-2 bg-green-600/30 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-800/50 rounded border border-gray-700 p-3">
                                            <div className="text-xs text-gray-400 mb-2">Terminal</div>
                                            <div className="space-y-1">
                                                <div className="w-2/3 h-2 bg-green-500/50 rounded"></div>
                                                <div className="w-1/2 h-2 bg-gray-700 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section className="py-20 bg-gray-800/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Everything You Need,<br />
                            <span className="text-cyan-400">Nothing You Don't</span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Built for the modern agentic coder. No installations, no setup, no waiting. Just pure coding power.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-colors">
                            <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Instant Launch</h3>
                            <p className="text-gray-400">
                                Skip the downloads, installations, and setup. Start coding in seconds with a full-featured IDE in your browser.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-colors">
                            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-4">AI-Powered Development</h3>
                            <p className="text-gray-400">
                                Built-in AI assistance with MCP tools, intelligent code completion, and automated workflows for the modern developer.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-700 hover:border-green-500/50 transition-colors">
                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Real Terminal & CLI</h3>
                            <p className="text-gray-400">
                                Full terminal access with real CLI tool installation. Run npm, pip, docker - everything you need for serious development.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-colors">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-4">MCP Tool Integration</h3>
                            <p className="text-gray-400">
                                12+ powerful MCP tools for AI reasoning, development testing, language support, and DevOps operations.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-700 hover:border-orange-500/50 transition-colors">
                            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-4">GitHub Integration</h3>
                            <p className="text-gray-400">
                                Clone any GitHub repository instantly. Work on your projects from anywhere without local setup.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-700 hover:border-red-500/50 transition-colors">
                            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Performance First</h3>
                            <p className="text-gray-400">
                                WebContainer technology ensures native-speed performance for Node.js applications, right in your browser.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="text-red-400">Bulky Downloads</span> vs
                            <span className="text-cyan-400"> PocketCode</span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Why wait hours to start coding when you can start in seconds?
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Traditional Development */}
                        <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-8">
                            <h3 className="text-2xl font-bold text-red-400 mb-6 text-center">Traditional Development</h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 text-gray-300">
                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✕</span>
                                    </div>
                                    <span>Download 2-5GB IDE installations</span>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-300">
                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✕</span>
                                    </div>
                                    <span>Complex setup and configuration</span>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-300">
                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✕</span>
                                    </div>
                                    <span>Device-specific compatibility issues</span>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-300">
                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✕</span>
                                    </div>
                                    <span>Hours of setup before first code</span>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-300">
                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✕</span>
                                    </div>
                                    <span>Limited to one device at a time</span>
                                </div>
                            </div>
                        </div>

                        {/* PocketCode */}
                        <div className="bg-cyan-900/10 border border-cyan-500/30 rounded-xl p-8">
                            <h3 className="text-2xl font-bold text-cyan-400 mb-6 text-center">PocketCode</h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 text-gray-300">
                                    <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span>Zero downloads - runs in any browser</span>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-300">
                                    <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span>Instant launch - start coding in seconds</span>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-300">
                                    <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span>Works on any device with a browser</span>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-300">
                                    <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span>AI-powered from the ground up</span>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-300">
                                    <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span>Code anywhere - your projects follow you</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-cyan-600/20 to-purple-600/20">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Code the Future?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Join thousands of developers who've already made the switch to instant, powerful, AI-enhanced development.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                        <button className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-lg font-semibold transition-colors">
                            Start Coding Now - It's Free
                        </button>
                        <button className="px-8 py-4 border border-gray-600 hover:border-gray-500 rounded-lg text-lg font-semibold transition-colors">
                            Schedule Demo
                        </button>
                    </div>
                    <p className="text-sm text-gray-400">
                        No credit card required • Set up in under 30 seconds • Cancel anytime
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">P</span>
                            </div>
                            <span className="text-xl font-bold">PocketCode</span>
                        </div>
                        <div className="flex items-center space-x-8 text-gray-400">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Support</a>
                            <a href="#" className="hover:text-white transition-colors">Docs</a>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 PocketCode. All rights reserved. The future of coding is here.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
