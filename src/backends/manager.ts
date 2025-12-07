/**
 * Backend manager - detection and management
 */

import * as vscode from 'vscode';
import { BackendConfig, Model } from '../types';
import { IBackend } from './backend';
import { OllamaBackend } from './ollama';
import { OpenAICompatibleBackend } from './openai-compatible';

export class BackendManager {
  private backends: Map<string, IBackend> = new Map();
  private models: Model[] = [];
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = 'localvide.selectModel';
  }

  async initialize(): Promise<void> {
    await this.scanBackends();
    this.updateStatusBar();
  }

  async scanBackends(): Promise<void> {
    const config = vscode.workspace.getConfiguration('localvide');
    const backendConfigs: BackendConfig[] = config.get('backends', []);

    this.backends.clear();
    this.models = [];

    for (const backendConfig of backendConfigs) {
      if (!backendConfig.enabled) {
        continue;
      }

      let backend: IBackend | null = null;

      try {
        switch (backendConfig.type) {
          case 'ollama':
            backend = new OllamaBackend(backendConfig.baseUrl);
            break;
          case 'openai-compatible':
            backend = new OpenAICompatibleBackend(
              backendConfig.baseUrl,
              backendConfig.apiKey
            );
            break;
          default:
            console.warn(`Unsupported backend type: ${backendConfig.type}`);
            continue;
        }

        if (backend) {
          const isAvailable = await backend.isAvailable();
          if (isAvailable) {
            this.backends.set(backendConfig.name, backend);
            const models = await backend.listModels();
            this.models.push(...models);
            console.log(`Backend ${backendConfig.name} detected with ${models.length} models`);
          } else {
            console.log(`Backend ${backendConfig.name} not available`);
          }
        }
      } catch (error) {
        console.error(`Error scanning backend ${backendConfig.name}:`, error);
      }
    }

    if (this.models.length === 0) {
      vscode.window.showWarningMessage(
        'No local model backend detected. Make sure Ollama or LM Studio is running.',
        'Documentation'
      ).then((action) => {
        if (action === 'Documentation') {
          vscode.env.openExternal(
            vscode.Uri.parse('https://ollama.ai/')
          );
        }
      });
    }
  }

  getBackend(name: string): IBackend | undefined {
    return this.backends.get(name);
  }

  getModels(): Model[] {
    return this.models;
  }

  getModelById(id: string): Model | undefined {
    return this.models.find((m) => m.id === id);
  }

  getAvailableBackends(): string[] {
    return Array.from(this.backends.keys());
  }

  updateStatusBar(): void {
    const config = vscode.workspace.getConfiguration('localvide');
    const currentModel = config.get<string>('model.chat', '');
    
    if (this.models.length > 0) {
      const modelName = currentModel || this.models[0]?.name || 'No model';
      this.statusBarItem.text = `$(sparkle) LocalVide: ${modelName}`;
      this.statusBarItem.tooltip = `${this.backends.size} backend(s), ${this.models.length} model(s)`;
      this.statusBarItem.show();
    } else {
      this.statusBarItem.text = '$(sparkle) LocalVide: Offline';
      this.statusBarItem.tooltip = 'No backend detected';
      this.statusBarItem.show();
    }
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }
}

