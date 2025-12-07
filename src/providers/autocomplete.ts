/**
 * Provider for inline autocompletion
 */

import * as vscode from 'vscode';
import { CompletionRequest } from '../types';
import { BackendManager } from '../backends/manager';
import { ContextBuilder } from '../utils/context';

export class AutocompleteProvider
  implements vscode.InlineCompletionItemProvider
{
  private cancellationTokens: Map<string, AbortController> = new Map();

  constructor(private backendManager: BackendManager) {}

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionItem[] | null> {
    const config = vscode.workspace.getConfiguration('localvide');

    // Check if autocompletion is enabled
    if (!config.get<boolean>('autocomplete.enabled', true)) {
      return null;
    }

    // Check language
    const disabledLanguages = config.get<string[]>(
      'autocomplete.disabledLanguages',
      []
    );
    if (disabledLanguages.includes(document.languageId)) {
      return null;
    }

    // Check file size
    const maxFileSize = config.get<number>('autocomplete.maxFileSize', 100000);
    if (document.getText().length > maxFileSize) {
      return null;
    }

    // Get configured model
    const modelId = config.get<string>('model.autocomplete', '');
    if (!modelId) {
      return null;
    }

    const model = this.backendManager.getModelById(modelId);
    if (!model) {
      return null;
    }

    const backend = this.backendManager.getBackend(model.backend);
    if (!backend) {
      return null;
    }

    // Cancel previous request for this document
    const docKey = document.uri.toString();
    const previousToken = this.cancellationTokens.get(docKey);
    if (previousToken) {
      previousToken.abort();
    }

    const abortController = new AbortController();
    this.cancellationTokens.set(docKey, abortController);

    // Check if request was cancelled
    if (token.isCancellationRequested) {
      abortController.abort();
      return null;
    }

    try {
      // Build context
      const codeContext = await ContextBuilder.buildContext(
        document,
        position,
        config.get<number>('context.maxLines', 1000)
      );

      // Build prompt
      const prompt = ContextBuilder.buildPrompt(codeContext, 'complete');

      // Prepare request
      const completionRequest: CompletionRequest = {
        prompt,
        maxTokens: config.get<number>('autocomplete.maxTokens', 50),
        temperature: config.get<number>('autocomplete.temperature', 0.2),
        context: codeContext,
        stop: ['\n\n', '\n\t', '\n    '], // Stop at significant new lines
      };

      // Call backend
      const response = await backend.complete(completionRequest, model.id);

      // Clean up token
      this.cancellationTokens.delete(docKey);

      if (!response.content || response.content.trim().length === 0) {
        return null;
      }

      // Return suggestion
      return [
        new vscode.InlineCompletionItem(
          response.content.trim(),
          new vscode.Range(position, position)
        ),
      ];
    } catch (error) {
      this.cancellationTokens.delete(docKey);
      console.error('Autocompletion error:', error);
      return null;
    }
  }
}

