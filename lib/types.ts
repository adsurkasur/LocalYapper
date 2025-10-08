// Base entity types
export interface User {
  id: string;
  displayName: string;
  avatarPath?: string | null;
  locale: string;
  timezone: string;
  theme: string;
  defaultBotId?: string | null;
  defaultModel?: string | null;
  security?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Persona {
  id: string;
  userId: string;
  name: string;
  style: string;
  speakingPatterns: string;
  preferences: string;
  tags: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bot {
  id: string;
  userId: string;
  name: string;
  color: string;
  avatarPath?: string | null;
  systemPrompt: string;
  defaultModel: string;
  temperature: number;
  topP: number;
  visibility: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  botId: string;
  title: string;
  modelOverride?: string | null;
  parametersOverride?: string | null;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  metadata?: string | null;
  createdAt: Date;
}

export interface Settings {
  id: string;
  ollamaHost: string;
  internetEnabled: boolean;
  updatedAt: Date;
}

// Extended types for API responses
export interface PersonaWithTags extends Omit<Persona, 'tags'> {
  tags: string[];
}

export interface SessionWithDetails extends ChatSession {
  messages?: Message[];
  bot?: Bot;
}

export interface UserProfile extends User {
  personas?: PersonaWithTags[];
  bots?: Bot[];
}

// API request/response types
export interface CreatePersonaRequest {
  name: string;
  style: string;
  speakingPatterns: string;
  preferences: string;
  tags: string[];
}

export interface CreateBotRequest {
  name: string;
  color?: string;
  avatarPath?: string;
  systemPrompt: string;
  defaultModel: string;
  temperature?: number;
  topP?: number;
  visibility?: string;
}

export interface CreateSessionRequest {
  botId: string;
  title?: string;
  modelOverride?: string;
  parametersOverride?: Record<string, unknown>;
}

export interface SendMessageRequest {
  content: string;
  personaId?: string;
}

// Ollama API types
export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  details?: {
    format: string;
    family: string;
    families: string[] | null;
    parameter_size: string;
    quantization_level: string;
  };
  modified_at: string;
}

export interface OllamaTagsResponse {
  models: OllamaModel[];
}

export interface OllamaChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
  };
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message?: {
    role: string;
    content: string;
  };
  done?: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
  eval_duration?: number;
}