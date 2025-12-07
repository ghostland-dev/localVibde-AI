/**
 * Types for LocalVide AI extension
 */

export interface BackendConfig {
  name: string;
  type: 'ollama' | 'openai-compatible' | 'custom';
  baseUrl: string;
  enabled: boolean;
  apiKey?: string;
  headers?: Record<string, string>;
}

export interface Model {
  id: string;
  name: string;
  backend: string;
  contextLength?: number;
}

export interface CompletionRequest {
  prompt: string;
  maxTokens: number;
  temperature: number;
  stop?: string[];
  context?: CodeContext;
}

export interface CodeContext {
  before: string;
  after: string;
  filePath: string;
  language?: string;
  relatedFiles?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface BackendResponse {
  content: string;
  model?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface ModelProfile {
  name: string;
  autocomplete: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
  chat: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
  review: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
}

