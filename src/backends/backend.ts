/**
 * Abstract interface for model backends
 */

import { BackendConfig, Model, CompletionRequest, BackendResponse } from '../types';

export interface IBackend {
  name: string;
  baseUrl: string;
  isAvailable(): Promise<boolean>;
  listModels(): Promise<Model[]>;
  complete(request: CompletionRequest, model: string): Promise<BackendResponse>;
  streamComplete?(
    request: CompletionRequest,
    model: string,
    onChunk: (chunk: string) => void
  ): Promise<void>;
}

export abstract class BaseBackend implements IBackend {
  constructor(public name: string, public baseUrl: string) {}

  abstract isAvailable(): Promise<boolean>;
  abstract listModels(): Promise<Model[]>;
  abstract complete(request: CompletionRequest, model: string): Promise<BackendResponse>;
  
  protected async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = 30000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

