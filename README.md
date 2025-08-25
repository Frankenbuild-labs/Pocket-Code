# 🚀 PocketCode - Advanced AI-Powered Development Environment
<img width="1900" height="908" alt="main" src="https://github.com/user-attachments/assets/09ea6aa6-4b74-45a5-ab64-d1da90b950cf" />
<img width="1900" height="911" alt="main 2" src="https://github.com/user-attachments/assets/d46c5d1a-a314-4a94-a1b9-f80bf1e71155" />
<img width="1899" height="904" alt="main 3" src="https://github.com/user-attachments/assets/edeca124-d622-4cee-8e28-d929471b0b52" />
<img width="417" height="910" alt="task plan" src="https://github.com/user-attachments/assets/ad556a0f-2f3c-4963-aa4e-73e373196173" />
<img width="415" height="910" alt="cli" src="https://github.com/user-attachments/assets/9cef2297-bf03-4943-8480-c1969b994051" />


## 📋 Overview

**PocketCode** is a cutting-edge, browser-based integrated development environment (IDE) that combines the power of AI assistance with a full-featured code editor. Built with React and TypeScript, it provides developers with an intuitive platform for coding, testing, and deploying applications directly in the browser.

## ✨ Key Features

### 🤖 AI-Powered Development
- **Google Gemini Integration**: Advanced AI assistant powered by Google's Gemini API
- **Intelligent Code Generation**: AI can generate, modify, and debug code based on natural language instructions
- **Context-Aware Assistance**: AI understands your project structure and provides relevant suggestions
- **Voice Interaction**: Speech-to-text input for hands-free coding assistance
- **Text-to-Speech**: AI responses can be read aloud for accessibility
- (NEXT PHASE WILL BE FINALIZING ALL THE CLI INTERGRATIONS SO THAT ANY OF THEM CAN BE ACTIVATED WITH PUSH OF A BUTTON)

### 💻 Advanced Code Editor
- **Syntax Highlighting**: Powered by Prism.js for multiple programming languages
- **Real-time Linting**: ESLint integration with live error detection and reporting
- **Code Formatting**: Prettier integration for consistent code style
- **Multi-file Support**: Full file tree management with create, edit, delete operations
- **Auto-completion**: Intelligent code completion and suggestions

### 🖥️ Integrated Terminal
- **WebContainer Terminal**: Full Linux-like terminal environment in the browser
- **Xterm Integration**: Professional terminal experience with addons
- **Command Execution**: Run build scripts, package managers, and development servers
- **Multiple Terminal Sessions**: Support for concurrent terminal instances

### 🎨 Multi-View Interface
- **Editor View**: Primary coding interface with file tree and code editor
- **Chat View**: AI conversation interface for natural language programming
- **Preview View**: Live preview of web applications and projects  
- **Copier View**: Specialized view for code sharing and export

### 🔧 Project Management
- **File System**: Complete file and folder management
- **ZIP Export/Import**: Package and share entire projects as ZIP files
- **Git Integration**: Version control operations and repository management
- **Project Templates**: Quick start templates for common project types

### 🎤 Voice & Visual Features
- **Speech Recognition**: Voice-to-text input for coding commands
- **Visual Assistant Panel**: Enhanced UI for visual programming tasks
- **Screen Capture**: Integration for visual debugging and documentation
- **Multi-modal Interaction**: Combine voice, text, and visual inputs

### ⚡ Performance & User Experience
- **Real-time Collaboration**: Share projects and code instantly
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Themes**: Customizable interface themes
- **Resizable Panels**: Adjustable layout for optimal workflow
- **Hot Reloading**: Instant preview updates during development

## 🛠️ Technical Stack

### Frontend Framework
- **React 19.1.1**: Latest React with concurrent features
- **TypeScript**: Type-safe development experience
- **Vite**: Lightning-fast build tool and dev server

### AI & Machine Learning
- **Google Gemini API**: Advanced language model integration
- **Speech Recognition API**: Browser-native voice input
- **Web Speech API**: Text-to-speech capabilities

### Development Tools
- **WebContainer API**: Container-based development environment
- **Xterm.js**: Professional terminal emulation
- **Prism.js**: Syntax highlighting for 200+ languages
- **ESLint**: Code quality and error detection
- **Prettier**: Consistent code formatting

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **React Simple Code Editor**: Lightweight code editing component
- **Custom Icons**: Purpose-built SVG icon library
- **Responsive Grid**: Mobile-first responsive design

### File & Data Management
- **JSZip**: Client-side ZIP file creation and extraction
- **Browser File API**: Native file system access
- **IndexedDB**: Client-side data persistence
- **Git Integration**: Version control operations

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- Modern web browser with WebContainer support
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Frankenbuild-labs/Pocket-Code.git
   cd Pocket-Code
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## 📚 Usage Guide

### Basic Workflow
1. **Start a New Project**: Use the file tree to create your project structure
2. **Write Code**: Use the advanced code editor with syntax highlighting and linting
3. **AI Assistance**: Chat with the AI assistant for code generation and debugging
4. **Test & Preview**: Use the integrated terminal and preview view
5. **Export & Share**: Package your project as a ZIP file or push to Git


### Voice Commands
- Activate microphone button in chat interface
- Speak naturally: "Create a new file called utils.js"
- AI will process speech and execute commands

### Visual agent Assistant
- Click the visual assistant icon for a 2nd agent that operates via screen share.  can assist by visually interacting with you and the other agent
- Upload screenshots for visual debugging
- Get visual feedback on UI/UX improvements

## 🔧 Configuration

### AI Settings
```typescript
// Configure AI behavior in settings
{
  "aiModel": "gemini-pro",
  "responseLength": "detailed",
  "codeStyle": "modern",
  "includeComments": true
}
```

### Editor Preferences
```typescript
// Customize editor appearance and behavior
{
  "theme": "dark",
  "fontSize": 14,
  "tabSize": 2,
  "wordWrap": true,
  "lineNumbers": true
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini team for AI capabilities
- WebContainer team for browser-based development environment
- React and TypeScript communities
- All open-source contributors

## 📞 Support

- 📧 Email: support@pocketcode.dev
- 🐛 Issues: [GitHub Issues](https://github.com/Frankenbuild-labs/Pocket-Code/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Frankenbuild-labs/Pocket-Code/discussions)

---

<div align="center">
  <p>Built with ❤️ by the Frankenbuild Labs team</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
