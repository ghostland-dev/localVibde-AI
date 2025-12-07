# LocalVide AI

VS Code extension to use open source local LLMs (Ollama, LM Studio, text-generation-webui, etc.) for autocompletion, contextual chat, and code refactoring.

## 🎯 Features

### ✨ Inline Autocompletion
- Code suggestions while typing (similar to GitHub Copilot/Cursor)
- Context-aware suggestions from current file and project
- Configurable per language and file size

### 💬 Contextual Chat
- Side panel to chat with the model
- Automatic context from active file and selection
- Conversation history per workspace

### 🔍 Review and Refactoring
- **Code Review**: Analyze files or selections to identify issues and improvements
- **Refactoring**: Improve readability and maintainability
- **Optimization**: Improve performance
- **Explanation**: Detailed explanation of selected code
- **Test Generation**: Create unit tests

## 🚀 Installation

### Prerequisites

You need to have a local model backend running:

#### Option 1: Ollama (Recommended)
1. Install [Ollama](https://ollama.ai/)
2. Download a model:
   ```bash
   ollama pull codellama
   # or
   ollama pull mistral
   # or
   ollama pull llama2
   ```

#### Option 2: LM Studio
1. Install [LM Studio](https://lmstudio.ai/)
2. Download a model in the interface
3. Start the local server (usually on `http://localhost:1234`)

#### Option 3: text-generation-webui
1. Install [text-generation-webui](https://github.com/oobabooga/text-generation-webui)
2. Configure the API server and start it

### Extension Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Compile the extension:
   ```bash
   npm run compile
   ```
4. Press `F5` in VS Code to launch the extension in development mode
   - Or use `vsce package` to create a `.vsix` file and install it

## ⚙️ Configuration

### Backend Configuration

Open VS Code settings (`Ctrl+,` or `Cmd+,`) and search for "LocalVide".

By default, the extension automatically detects:
- **Ollama** on `http://localhost:11434`
- **LM Studio** on `http://localhost:1234`

You can add custom backends in settings:

```json
{
  "localvide.backends": [
    {
      "name": "Ollama",
      "type": "ollama",
      "baseUrl": "http://localhost:11434",
      "enabled": true
    },
    {
      "name": "LM Studio",
      "type": "openai-compatible",
      "baseUrl": "http://localhost:1234",
      "enabled": true
    }
  ]
}
```

### Model Selection

1. Use the command `LocalVide: Select model` (Cmd+Shift+P)
2. Or configure manually in settings:
   - `localvide.model.autocomplete`: Model for autocompletion
   - `localvide.model.chat`: Model for chat
   - `localvide.model.review`: Model for review/refactoring

### Advanced Settings

- **Autocompletion**:
  - `localvide.autocomplete.enabled`: Enable/disable autocompletion
  - `localvide.autocomplete.maxTokens`: Max tokens (default: 50)
  - `localvide.autocomplete.temperature`: Temperature (0-2, default: 0.2)
  - `localvide.autocomplete.disabledLanguages`: Languages to disable
  - `localvide.autocomplete.maxFileSize`: Max file size (default: 100000)

- **Chat**:
  - `localvide.chat.maxTokens`: Max tokens (default: 2048)
  - `localvide.chat.temperature`: Temperature (default: 0.7)

- **Review**:
  - `localvide.review.maxTokens`: Max tokens (default: 4096)
  - `localvide.review.temperature`: Temperature (default: 0.3)

- **General**:
  - `localvide.timeout`: Timeout in ms (default: 30000)
  - `localvide.context.maxLines`: Max context lines (default: 1000)

## 📖 Usage

### Autocompletion

Autocompletion triggers automatically while typing. Suggestions appear in gray. Press:
- `Tab` to accept the suggestion
- `Esc` to dismiss

### Chat

1. Open the "LocalVide AI Chat" panel in the sidebar
2. Type your message and press Enter
3. Context from the active file is automatically included

### Review and Refactoring

#### Via context menu (right-click)
- **Explain this code**: Explains the selection
- **Refactor: Refactor selection**: Refactors the selected code
- **Optimize: Optimize performance**: Optimizes the code
- **Generate tests**: Generates unit tests
- **Review: Analyze selection**: Analyzes the code

#### Via command palette (Cmd+Shift+P)
- `LocalVide: Review: Analyze this file`: Analyzes the entire file
- `LocalVide: Reload local models`: Reloads the model list

## 🏗️ Architecture

```
src/
├── extension.ts              # Main entry point
├── types.ts                  # TypeScript types
├── backends/
│   ├── backend.ts            # Abstract interface
│   ├── ollama.ts             # Ollama implementation
│   ├── openai-compatible.ts  # OpenAI-compatible implementation
│   └── manager.ts            # Backend manager
├── providers/
│   ├── autocomplete.ts       # Autocompletion provider
│   ├── chat.ts               # Chat provider
│   └── review.ts             # Review/refactoring provider
├── utils/
│   └── context.ts            # Context building
└── webview/
    └── chatWebview.ts        # Chat webview
```

## 🔒 Security and Privacy

- ✅ **100% Local**: No code is sent to the cloud
- ✅ **No Telemetry**: No data collection
- ⚠️ **Remote Backends**: If you configure a remote endpoint, it's under your responsibility

## 🐛 Troubleshooting

### No models detected

1. Check that your backend is running:
   - Ollama: `curl http://localhost:11434/api/tags`
   - LM Studio: Check that the local server is started

2. Use the command `LocalVide: Reload local models`

3. Check extension settings (backend URLs)

### Autocompletion not working

1. Check that `localvide.autocomplete.enabled` is `true`
2. Check that a model is configured for autocompletion
3. Check that the language is not in `localvide.autocomplete.disabledLanguages`
4. Check file size (must not exceed `maxFileSize`)

### Timeout errors

- Increase `localvide.timeout` in settings
- Check that your local model is fast enough
- Reduce `localvide.context.maxLines` to send less context

## 🛣️ Roadmap

### v0.1 (Current)
- ✅ Ollama support
- ✅ Inline autocompletion
- ✅ Simple chat

### v0.2 (Upcoming)
- [ ] Refactor/review on selection/file (in progress)
- [ ] Generic HTTP multi-backend
- [ ] Chat UI improvements

### v0.3 (Future)
- [ ] Improved multi-backend auto-detection
- [ ] Model profiles (Fast vs High Quality)
- [ ] Performance optimizations (cancellation, context trimming)
- [ ] Support for more backends (text-generation-webui, etc.)

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or pull request.

## 📝 License

MIT

## 👤 Author

Ismail MOUYAHADA

## 🙏 Acknowledgments

Inspired by [Cursor](https://cursor.sh/) and [Continue](https://continue.dev/), but fully open source and local.
