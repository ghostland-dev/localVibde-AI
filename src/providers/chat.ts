/**
 * Provider for contextual chat
 */

import * as vscode from 'vscode';
import { ChatMessage, CompletionRequest } from '../types';
import { BackendManager } from '../backends/manager';
import { ContextBuilder } from '../utils/context';

export class ChatProvider {
  private chatHistory: Map<string, ChatMessage[]> = new Map();

  constructor(private backendManager: BackendManager) {}

  async sendMessage(
    message: string,
    document?: vscode.TextDocument,
    selection?: vscode.Selection
  ): Promise<string> {
    const config = vscode.workspace.getConfiguration('localvide');
    const modelId = config.get<string>('model.chat', '');

    if (!modelId) {
      throw new Error('No model configured for chat');
    }

    const model = this.backendManager.getModelById(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const backend = this.backendManager.getBackend(model.backend);
    if (!backend) {
      throw new Error(`Backend ${model.backend} not found`);
    }

    // Build context if a document is provided
    let contextPrompt = '';
    if (document && selection) {
      const codeContext = await ContextBuilder.buildContext(
        document,
        selection.start
      );
      contextPrompt = `Contexte du fichier ${document.fileName}:\n\`\`\`${document.languageId}\n${document.getText(selection)}\n\`\`\`\n\n`;
    } else if (document) {
      const codeContext = await ContextBuilder.buildContext(
        document,
        new vscode.Position(0, 0)
      );
      contextPrompt = `Contexte du fichier ${document.fileName}:\n\`\`\`${document.languageId}\n${document.getText()}\n\`\`\`\n\n`;
    }

    // Get history
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    const historyKey = workspaceFolder?.uri.toString() || 'global';
    const history = this.chatHistory.get(historyKey) || [];

    // Build full prompt with history
    let fullPrompt = contextPrompt + message;

    // Add recent history (limited to last 5 exchanges)
    if (history.length > 0) {
      const recentHistory = history.slice(-10); // 5 exchanges = 10 messages
      const historyText = recentHistory
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');
      fullPrompt = `Conversation history:\n${historyText}\n\n${fullPrompt}`;
    }

    // Prepare request
    const completionRequest: CompletionRequest = {
      prompt: fullPrompt,
      maxTokens: config.get<number>('chat.maxTokens', 2048),
      temperature: config.get<number>('chat.temperature', 0.7),
    };

    try {
      // Call backend
      const response = await backend.complete(completionRequest, model.id);

      // Update history
      history.push(
        { role: 'user', content: message, timestamp: Date.now() },
        { role: 'assistant', content: response.content, timestamp: Date.now() }
      );
      this.chatHistory.set(historyKey, history);

      return response.content;
    } catch (error: any) {
      throw new Error(`Error sending message: ${error.message}`);
    }
  }

  clearHistory(workspaceFolder?: vscode.WorkspaceFolder): void {
    if (workspaceFolder) {
      this.chatHistory.delete(workspaceFolder.uri.toString());
    } else {
      this.chatHistory.clear();
    }
  }

  getHistory(workspaceFolder?: vscode.WorkspaceFolder): ChatMessage[] {
    const key = workspaceFolder?.uri.toString() || 'global';
    return this.chatHistory.get(key) || [];
  }
}

