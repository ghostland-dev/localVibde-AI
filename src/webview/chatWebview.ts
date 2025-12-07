/**
 * Webview for contextual chat
 */

import * as vscode from 'vscode';
import { ChatProvider } from '../providers/chat';
import { ChatMessage } from '../types';

export class ChatWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'localvide.chatView';

  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private chatProvider: ChatProvider
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle webview messages
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'sendMessage': {
          const editor = vscode.window.activeTextEditor;
          const selection = editor?.selection;
          const document = editor?.document;

          try {
            const response = await this.chatProvider.sendMessage(
              data.message,
              document,
              selection
            );

            webviewView.webview.postMessage({
              type: 'messageResponse',
              content: response,
            });
          } catch (error: any) {
            webviewView.webview.postMessage({
              type: 'error',
              message: error.message,
            });
          }
          break;
        }
        case 'clearHistory': {
          this.chatProvider.clearHistory();
          webviewView.webview.postMessage({
            type: 'historyCleared',
          });
          break;
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LocalVide AI Chat</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 10px;
            margin: 0;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        #chat-container {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 10px;
            padding: 10px;
        }
        .message {
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 5px;
        }
        .message.user {
            background-color: var(--vscode-input-background);
            margin-left: 20px;
        }
        .message.assistant {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            margin-right: 20px;
        }
        .message-header {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 0.9em;
        }
        .message-content {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        #input-container {
            display: flex;
            gap: 5px;
        }
        #message-input {
            flex: 1;
            padding: 8px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 3px;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
        }
        #send-button {
            padding: 8px 15px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        #send-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        #send-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .loading {
            opacity: 0.6;
            font-style: italic;
        }
        .error {
            color: var(--vscode-errorForeground);
            background-color: var(--vscode-inputValidation-errorBackground);
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div id="chat-container"></div>
    <div id="input-container">
        <input type="text" id="message-input" placeholder="Type your message..." />
        <button id="send-button">Send</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const chatContainer = document.getElementById('chat-container');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');

        function addMessage(role, content) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${role}\`;
            
            const header = document.createElement('div');
            header.className = 'message-header';
            header.textContent = role === 'user' ? 'You' : 'Assistant';
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = content;
            
            messageDiv.appendChild(header);
            messageDiv.appendChild(contentDiv);
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function showError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = \`Error: \${message}\`;
            chatContainer.appendChild(errorDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;

            addMessage('user', message);
            messageInput.value = '';
            sendButton.disabled = true;
            sendButton.textContent = 'Sending...';

            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message assistant loading';
            loadingDiv.id = 'loading-message';
            loadingDiv.textContent = 'Processing...';
            chatContainer.appendChild(loadingDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;

            vscode.postMessage({
                type: 'sendMessage',
                message: message
            });
        }

        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'messageResponse':
                    const loadingMsg = document.getElementById('loading-message');
                    if (loadingMsg) {
                        loadingMsg.remove();
                    }
                    addMessage('assistant', message.content);
                    sendButton.disabled = false;
                    sendButton.textContent = 'Send';
                    break;
                case 'error':
                    const loadingMsg2 = document.getElementById('loading-message');
                    if (loadingMsg2) {
                        loadingMsg2.remove();
                    }
                    showError(message.message);
                    sendButton.disabled = false;
                    sendButton.textContent = 'Send';
                    break;
                case 'historyCleared':
                    chatContainer.innerHTML = '';
                    break;
            }
        });
    </script>
</body>
</html>`;
  }
}

