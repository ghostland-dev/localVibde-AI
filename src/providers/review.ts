/**
 * Provider for review and refactoring
 */

import * as vscode from 'vscode';
import { CompletionRequest } from '../types';
import { BackendManager } from '../backends/manager';
import { ContextBuilder } from '../utils/context';

export class ReviewProvider {
  constructor(private backendManager: BackendManager) {}

  async reviewCode(
    document: vscode.TextDocument,
    selection?: vscode.Selection
  ): Promise<string> {
    const config = vscode.workspace.getConfiguration('localvide');
    const modelId = config.get<string>('model.review', '');

    if (!modelId) {
      throw new Error('No model configured for review');
    }

    const model = this.backendManager.getModelById(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const backend = this.backendManager.getBackend(model.backend);
    if (!backend) {
      throw new Error(`Backend ${model.backend} not found`);
    }

    const code = selection
      ? document.getText(selection)
      : document.getText();

    const position = selection
      ? selection.start
      : new vscode.Position(0, 0);

    const codeContext = await ContextBuilder.buildContext(document, position);
    const prompt = ContextBuilder.buildPrompt(codeContext, 'review');

    const completionRequest: CompletionRequest = {
      prompt,
      maxTokens: config.get<number>('review.maxTokens', 4096),
      temperature: config.get<number>('review.temperature', 0.3),
      context: codeContext,
    };

    try {
      const response = await backend.complete(completionRequest, model.id);
      return response.content;
    } catch (error: any) {
      throw new Error(`Error during review: ${error.message}`);
    }
  }

  async refactorCode(
    document: vscode.TextDocument,
    selection: vscode.Selection
  ): Promise<string> {
    const config = vscode.workspace.getConfiguration('localvide');
    const modelId = config.get<string>('model.review', '');

    if (!modelId) {
      throw new Error('No model configured for refactoring');
    }

    const model = this.backendManager.getModelById(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const backend = this.backendManager.getBackend(model.backend);
    if (!backend) {
      throw new Error(`Backend ${model.backend} not found`);
    }

    const codeContext = await ContextBuilder.buildContext(
      document,
      selection.start
    );
    const prompt = ContextBuilder.buildPrompt(codeContext, 'refactor');

    const completionRequest: CompletionRequest = {
      prompt,
      maxTokens: config.get<number>('review.maxTokens', 4096),
      temperature: config.get<number>('review.temperature', 0.3),
      context: codeContext,
    };

    try {
      const response = await backend.complete(completionRequest, model.id);
      return response.content;
    } catch (error: any) {
      throw new Error(`Error during refactoring: ${error.message}`);
    }
  }

  async optimizeCode(
    document: vscode.TextDocument,
    selection: vscode.Selection
  ): Promise<string> {
    const config = vscode.workspace.getConfiguration('localvide');
    const modelId = config.get<string>('model.review', '');

    if (!modelId) {
      throw new Error('No model configured for optimization');
    }

    const model = this.backendManager.getModelById(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const backend = this.backendManager.getBackend(model.backend);
    if (!backend) {
      throw new Error(`Backend ${model.backend} not found`);
    }

    const codeContext = await ContextBuilder.buildContext(
      document,
      selection.start
    );
    const prompt = ContextBuilder.buildPrompt(codeContext, 'optimize');

    const completionRequest: CompletionRequest = {
      prompt,
      maxTokens: config.get<number>('review.maxTokens', 4096),
      temperature: config.get<number>('review.temperature', 0.3),
      context: codeContext,
    };

    try {
      const response = await backend.complete(completionRequest, model.id);
      return response.content;
    } catch (error: any) {
      throw new Error(`Error during optimization: ${error.message}`);
    }
  }

  async explainCode(
    document: vscode.TextDocument,
    selection: vscode.Selection
  ): Promise<string> {
    const config = vscode.workspace.getConfiguration('localvide');
    const modelId = config.get<string>('model.chat', '');

    if (!modelId) {
      throw new Error('No model configured for explanation');
    }

    const model = this.backendManager.getModelById(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const backend = this.backendManager.getBackend(model.backend);
    if (!backend) {
      throw new Error(`Backend ${model.backend} not found`);
    }

    const codeContext = await ContextBuilder.buildContext(
      document,
      selection.start
    );
    const prompt = ContextBuilder.buildPrompt(codeContext, 'explain');

    const completionRequest: CompletionRequest = {
      prompt,
      maxTokens: config.get<number>('chat.maxTokens', 2048),
      temperature: config.get<number>('chat.temperature', 0.7),
      context: codeContext,
    };

    try {
      const response = await backend.complete(completionRequest, model.id);
      return response.content;
    } catch (error: any) {
      throw new Error(`Error during explanation: ${error.message}`);
    }
  }

  async generateTests(
    document: vscode.TextDocument,
    selection: vscode.Selection
  ): Promise<string> {
    const config = vscode.workspace.getConfiguration('localvide');
    const modelId = config.get<string>('model.review', '');

    if (!modelId) {
      throw new Error('No model configured for test generation');
    }

    const model = this.backendManager.getModelById(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const backend = this.backendManager.getBackend(model.backend);
    if (!backend) {
      throw new Error(`Backend ${model.backend} not found`);
    }

    const codeContext = await ContextBuilder.buildContext(
      document,
      selection.start
    );
    const prompt = ContextBuilder.buildPrompt(codeContext, 'tests');

    const completionRequest: CompletionRequest = {
      prompt,
      maxTokens: config.get<number>('review.maxTokens', 4096),
      temperature: config.get<number>('review.temperature', 0.3),
      context: codeContext,
    };

    try {
      const response = await backend.complete(completionRequest, model.id);
      return response.content;
    } catch (error: any) {
      throw new Error(`Error during test generation: ${error.message}`);
    }
  }
}

