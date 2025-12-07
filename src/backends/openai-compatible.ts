/**
 * Backend for OpenAI-compatible servers (LM Studio, text-generation-webui, etc.)
 */

import { BaseBackend } from './backend';
import { Model, CompletionRequest, BackendResponse } from '../types';
import axios, { AxiosInstance } from 'axios';

export class OpenAICompatibleBackend extends BaseBackend {
  private client: AxiosInstance;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    super('OpenAI Compatible', baseUrl);
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
    });
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.client.get('/v1/models');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<Model[]> {
    try {
      const response = await this.client.get('/v1/models');
      const models: Model[] = (response.data.data || []).map((m: any) => ({
        id: m.id,
        name: m.id,
        backend: this.name,
        contextLength: m.context_length,
      }));
      return models;
    } catch (error) {
      console.error('Error fetching OpenAI-compatible models:', error);
      return [];
    }
  }

  async complete(request: CompletionRequest, model: string): Promise<BackendResponse> {
    try {
      const response = await this.client.post(
        '/v1/completions',
        {
          model,
          prompt: request.prompt,
          max_tokens: request.maxTokens,
          temperature: request.temperature,
          stop: request.stop || [],
        }
      );

      const content = response.data.choices?.[0]?.text || '';
      return {
        content,
        model: model,
        usage: {
          promptTokens: response.data.usage?.prompt_tokens,
          completionTokens: response.data.usage?.completion_tokens,
          totalTokens: response.data.usage?.total_tokens,
        },
      };
    } catch (error: any) {
      throw new Error(`OpenAI-compatible error: ${error.message}`);
    }
  }
}

