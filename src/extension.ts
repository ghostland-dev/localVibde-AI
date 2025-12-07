/**
 * Main entry point for LocalVide AI extension
 */

import * as vscode from 'vscode';
import { BackendManager } from './backends/manager';
import { AutocompleteProvider } from './providers/autocomplete';
import { ChatProvider } from './providers/chat';
import { ReviewProvider } from './providers/review';
import { ChatWebviewProvider } from './webview/chatWebview';

let backendManager: BackendManager;
let autocompleteProvider: AutocompleteProvider;
let chatProvider: ChatProvider;
let reviewProvider: ReviewProvider;

export async function activate(context: vscode.ExtensionContext) {
  console.log('LocalVide AI is now active!');

  // Initialize backend manager
  backendManager = new BackendManager();
  await backendManager.initialize();

  // Initialize providers
  autocompleteProvider = new AutocompleteProvider(backendManager);
  chatProvider = new ChatProvider(backendManager);
  reviewProvider = new ReviewProvider(backendManager);

  // Register autocomplete provider
  context.subscriptions.push(
    vscode.languages.registerInlineCompletionItemProvider(
      { scheme: 'file' },
      autocompleteProvider
    )
  );

  // Register webview for chat
  const chatWebviewProvider = new ChatWebviewProvider(
    context.extensionUri,
    chatProvider
  );
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ChatWebviewProvider.viewType,
      chatWebviewProvider
    )
  );

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('localvide.openChat', () => {
      vscode.commands.executeCommand('localvide.chatView.focus');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('localvide.reloadModels', async () => {
      vscode.window.showInformationMessage('Reloading models...');
      await backendManager.scanBackends();
      backendManager.updateStatusBar();
      vscode.window.showInformationMessage(
        `${backendManager.getModels().length} model(s) detected`
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('localvide.selectModel', async () => {
      const models = backendManager.getModels();
      if (models.length === 0) {
        vscode.window.showWarningMessage(
          'No models available. Check that your backend is running.'
        );
        return;
      }

      const modelItems = models.map((m) => ({
        label: m.name,
        description: m.backend,
        id: m.id,
      }));

      const selected = await vscode.window.showQuickPick(modelItems, {
        placeHolder: 'Select a model',
      });

      if (selected) {
        const config = vscode.workspace.getConfiguration('localvide');
        await config.update('model.chat', selected.id, true);
        await config.update('model.autocomplete', selected.id, true);
        await config.update('model.review', selected.id, true);
        backendManager.updateStatusBar();
        vscode.window.showInformationMessage(
          `Model selected: ${selected.label}`
        );
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('localvide.reviewFile', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No file open');
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Analyzing file...',
          cancellable: false,
        },
        async (progress) => {
          try {
            const review = await reviewProvider.reviewCode(editor.document);
            const doc = await vscode.workspace.openTextDocument({
              content: review,
              language: 'markdown',
            });
            await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
          } catch (error: any) {
            vscode.window.showErrorMessage(
              `Error during review: ${error.message}`
            );
          }
        }
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('localvide.reviewSelection', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || !editor.selection || editor.selection.isEmpty) {
        vscode.window.showWarningMessage('Please select some code');
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Analyzing selection...',
          cancellable: false,
        },
        async (progress) => {
          try {
            const review = await reviewProvider.reviewCode(
              editor.document,
              editor.selection
            );
            const doc = await vscode.workspace.openTextDocument({
              content: review,
              language: 'markdown',
            });
            await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
          } catch (error: any) {
            vscode.window.showErrorMessage(
              `Error during review: ${error.message}`
            );
          }
        }
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('localvide.refactorSelection', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || !editor.selection || editor.selection.isEmpty) {
        vscode.window.showWarningMessage('Please select some code');
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Refactoring...',
          cancellable: false,
        },
        async (progress) => {
          try {
            const refactored = await reviewProvider.refactorCode(
              editor.document,
              editor.selection
            );
            await editor.edit((editBuilder) => {
              editBuilder.replace(editor.selection, refactored);
            });
            vscode.window.showInformationMessage('Code refactored successfully');
          } catch (error: any) {
            vscode.window.showErrorMessage(
              `Error during refactoring: ${error.message}`
            );
          }
        }
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('localvide.optimizeSelection', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || !editor.selection || editor.selection.isEmpty) {
        vscode.window.showWarningMessage('Please select some code');
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Optimizing...',
          cancellable: false,
        },
        async (progress) => {
          try {
            const optimized = await reviewProvider.optimizeCode(
              editor.document,
              editor.selection
            );
            await editor.edit((editBuilder) => {
              editBuilder.replace(editor.selection, optimized);
            });
            vscode.window.showInformationMessage('Code optimized successfully');
          } catch (error: any) {
            vscode.window.showErrorMessage(
              `Error during optimization: ${error.message}`
            );
          }
        }
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('localvide.explainCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || !editor.selection || editor.selection.isEmpty) {
        vscode.window.showWarningMessage('Please select some code');
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Explaining...',
          cancellable: false,
        },
        async (progress) => {
          try {
            const explanation = await reviewProvider.explainCode(
              editor.document,
              editor.selection
            );
            const doc = await vscode.workspace.openTextDocument({
              content: explanation,
              language: 'markdown',
            });
            await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
          } catch (error: any) {
            vscode.window.showErrorMessage(
              `Error during explanation: ${error.message}`
            );
          }
        }
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('localvide.generateTests', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || !editor.selection || editor.selection.isEmpty) {
        vscode.window.showWarningMessage('Please select some code');
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Generating tests...',
          cancellable: false,
        },
        async (progress) => {
          try {
            const tests = await reviewProvider.generateTests(
              editor.document,
              editor.selection
            );
            const doc = await vscode.workspace.openTextDocument({
              content: tests,
              language: editor.document.languageId,
            });
            await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
          } catch (error: any) {
            vscode.window.showErrorMessage(
              `Error during test generation: ${error.message}`
            );
          }
        }
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('localvide.openSettings', () => {
      vscode.commands.executeCommand(
        'workbench.action.openSettings',
        'localvide'
      );
    })
  );

  // Update status bar periodically
  setInterval(() => {
    backendManager.updateStatusBar();
  }, 60000); // Every minute
}

export function deactivate() {
  if (backendManager) {
    backendManager.dispose();
  }
}

