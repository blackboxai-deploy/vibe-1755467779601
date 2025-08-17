export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  creatorId: string;
  creatorUsername?: string;
  isPublic: boolean;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  chatCount: number;
  tags: string[];
}

export interface Chat {
  id: string;
  userId: string;
  characterId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  title?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateCharacterRequest {
  name: string;
  description: string;
  systemPrompt: string;
  isPublic: boolean;
  avatar?: string;
  tags?: string[];
}

export interface UpdateCharacterRequest {
  name?: string;
  description?: string;
  systemPrompt?: string;
  isPublic?: boolean;
  avatar?: string;
  tags?: string[];
}

export interface ChatRequest {
  characterId: string;
  message: string;
  chatId?: string;
}

export interface ChatResponse {
  message: string;
  chatId: string;
  messageId: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  creatorId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CharacterFilters {
  search?: string;
  tags?: string[];
  creatorId?: string;
  isPublic?: boolean;
  sortBy?: 'createdAt' | 'chatCount' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  charactersCreated: number;
  totalChats: number;
}

export interface ChatSummary {
  id: string;
  characterId: string;
  characterName: string;
  characterAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ClaudeRequest {
  model: string;
  messages: ClaudeMessage[];
  max_tokens: number;
  temperature?: number;
  stream?: boolean;
}

export interface ClaudeResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}