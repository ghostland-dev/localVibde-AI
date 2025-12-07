/**
 * Backend for Ollama
 */

import { BaseBackend } from './backend';
import { Model, CompletionRequest, BackendResponse } from '../types';
import axios, { AxiosInstance } from 'axios';

export class OllamaBackend extends BaseBackend {
  private client: AxiosInstance;

  constructor(baseUrl: string = 'http://localhost:11434') {
    super('Ollama', baseUrl);
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
    });
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/tags');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<Model[]> {
    try {
      const response = await this.client.get('/api/tags');
      const models: Model[] = (response.data.models || []).map((m: any) => ({
        id: m.name,
        name: m.name,
        backend: this.name,
        contextLength: m.details?.context_length,
      }));
      return models;
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      return [];
    }
  }

  async complete(request: CompletionRequest, model: string): Promise<BackendResponse> {
    try {
      const response = await this.client.post('/api/generate', {
        model,
        prompt: request.prompt,
        options: {
          temperature: request.temperature,
          num_predict: request.maxTokens,
          stop: request.stop || [],
        },
        stream: false,
      });

      return {
        content: response.data.response || '',
        model: model,
      };
    } catch (error: any) {
      throw new Error(`Ollama error: ${error.message}`);
    }
  }

  async streamComplete(
    request: CompletionRequest,
    model: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const response = await this.client.post(
        '/api/generate',
        {
          model,
          prompt: request.prompt,
          options: {
            temperature: request.temperature,
            num_predict: request.maxTokens,
            stop: request.stop || [],
          },
          stream: true,
        },
        {
          responseType: 'stream',
        }
      );

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => {
          const lines = chunk.toString().split('\n').filter((line: string) => line.trim());
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                onChunk(data.response);
              }
              if (data.done) {
                resolve();
              }
            } catch {
              // Ignore invalid lines
            }
          }
        });

        response.data.on('end', () => resolve());
        response.data.on('error', (error: Error) => reject(error));
      });
    } catch (error: any) {
      throw new Error(`Ollama error (stream): ${error.message}`);
    }
  }
}

