# Quick Start Guide

## Installation and Compilation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Compile the extension**:
   ```bash
   npm run compile
   ```

3. **Launch in development mode**:
   - Press `F5` in VS Code
   - A new VS Code window will open with the extension loaded

## Initial Configuration

### 1. Install a Local Backend

#### With Ollama (recommended):
```bash
# Install Ollama from https://ollama.ai/
# Then download a model:
ollama pull codellama
# or
ollama pull mistral
```

#### With LM Studio:
- Download from https://lmstudio.ai/
- Download a model in the interface
- Start the local server (usually on port 1234)

### 2. Configure the Extension

1. Open VS Code settings (`Ctrl+,` or `Cmd+,`)
2. Search for "LocalVide"
3. Verify that backends are correctly configured:
   - Ollama: `http://localhost:11434`
   - LM Studio: `http://localhost:1234`

### 3. Select a Model

1. Press `Cmd+Shift+P` (or `Ctrl+Shift+P`)
2. Type "LocalVide: Select model"
3. Choose a model from the list

## Usage

### Autocompletion
- Start typing code
- Suggestions appear automatically in gray
- Press `Tab` to accept

### Chat
1. Open the "LocalVide AI Chat" panel in the sidebar
2. Type your question and press Enter

### Review/Refactoring
1. Select code
2. Right-click → Choose an action:
   - "Explain this code"
   - "Refactor: Refactor selection"
   - "Optimize: Optimize performance"
   - "Generate tests"
   - "Review: Analyze selection"

## Troubleshooting

### No models detected
1. Check that your backend is running
2. Use "LocalVide: Reload local models"
3. Check URLs in settings

### Autocompletion not working
1. Check that a model is selected for autocompletion
2. Check that `localvide.autocomplete.enabled` is `true`
3. Check that the language is not disabled
