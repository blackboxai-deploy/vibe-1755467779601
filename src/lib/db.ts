import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Data directory path
const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Generic file operations
async function readJsonFile<T>(filename: string): Promise<T[]> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Type definitions
export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  creatorId: string;
  isPublic: boolean;
  avatar: string;
  createdAt: string;
  chatCount: number;
  category?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  userId: string;
  characterId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// User operations
export const userDb = {
  async getAll(): Promise<User[]> {
    return readJsonFile<User>('users.json');
  },

  async getById(id: string): Promise<User | null> {
    const users = await this.getAll();
    return users.find(user => user.id === id) || null;
  },

  async getByEmail(email: string): Promise<User | null> {
    const users = await this.getAll();
    return users.find(user => user.email === email) || null;
  },

  async getByUsername(username: string): Promise<User | null> {
    const users = await this.getAll();
    return users.find(user => user.username === username) || null;
  },

  async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const users = await this.getAll();
    const newUser: User = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    await writeJsonFile('users.json', users);
    return newUser;
  },

  async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const users = await this.getAll();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updates };
    await writeJsonFile('users.json', users);
    return users[index];
  },

  async delete(id: string): Promise<boolean> {
    const users = await this.getAll();
    const filteredUsers = users.filter(user => user.id !== id);
    
    if (filteredUsers.length === users.length) return false;
    
    await writeJsonFile('users.json', filteredUsers);
    return true;
  }
};

// Export helper functions for backward compatibility
export async function getUserById(id: string): Promise<User | null> {
  return userDb.getById(id);
}

// Character operations
export const characterDb = {
  async getAll(): Promise<Character[]> {
    return readJsonFile<Character>('characters.json');
  },

  async getById(id: string): Promise<Character | null> {
    const characters = await this.getAll();
    return characters.find(character => character.id === id) || null;
  },

  async getByCreatorId(creatorId: string): Promise<Character[]> {
    const characters = await this.getAll();
    return characters.filter(character => character.creatorId === creatorId);
  },

  async getPublic(): Promise<Character[]> {
    const characters = await this.getAll();
    return characters.filter(character => character.isPublic);
  },

  async getPopular(limit: number = 10): Promise<Character[]> {
    const characters = await this.getPublic();
    return characters
      .sort((a, b) => b.chatCount - a.chatCount)
      .slice(0, limit);
  },

  async search(query: string): Promise<Character[]> {
    const characters = await this.getPublic();
    const lowercaseQuery = query.toLowerCase();
    
    return characters.filter(character =>
      character.name.toLowerCase().includes(lowercaseQuery) ||
      character.description.toLowerCase().includes(lowercaseQuery) ||
      character.category?.toLowerCase().includes(lowercaseQuery)
    );
  },

  async create(characterData: Omit<Character, 'id' | 'createdAt' | 'chatCount'>): Promise<Character> {
    const characters = await this.getAll();
    const newCharacter: Character = {
      id: uuidv4(),
      ...characterData,
      chatCount: 0,
      createdAt: new Date().toISOString(),
    };
    characters.push(newCharacter);
    await writeJsonFile('characters.json', characters);
    return newCharacter;
  },

  async update(id: string, updates: Partial<Omit<Character, 'id' | 'createdAt'>>): Promise<Character | null> {
    const characters = await this.getAll();
    const index = characters.findIndex(character => character.id === id);
    
    if (index === -1) return null;
    
    characters[index] = { ...characters[index], ...updates };
    await writeJsonFile('characters.json', characters);
    return characters[index];
  },

  async incrementChatCount(id: string): Promise<void> {
    const characters = await this.getAll();
    const index = characters.findIndex(character => character.id === id);
    
    if (index !== -1) {
      characters[index].chatCount += 1;
      await writeJsonFile('characters.json', characters);
    }
  },

  async delete(id: string): Promise<boolean> {
    const characters = await this.getAll();
    const filteredCharacters = characters.filter(character => character.id !== id);
    
    if (filteredCharacters.length === characters.length) return false;
    
    await writeJsonFile('characters.json', filteredCharacters);
    return true;
  }
};

// Chat operations
export const chatDb = {
  async getAll(): Promise<Chat[]> {
    return readJsonFile<Chat>('chats.json');
  },

  async getById(id: string): Promise<Chat | null> {
    const chats = await this.getAll();
    return chats.find(chat => chat.id === id) || null;
  },

  async getByUserId(userId: string): Promise<Chat[]> {
    const chats = await this.getAll();
    return chats.filter(chat => chat.userId === userId);
  },

  async getByUserAndCharacter(userId: string, characterId: string): Promise<Chat | null> {
    const chats = await this.getAll();
    return chats.find(chat => chat.userId === userId && chat.characterId === characterId) || null;
  },

  async create(chatData: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>): Promise<Chat> {
    const chats = await this.getAll();
    const newChat: Chat = {
      id: uuidv4(),
      ...chatData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    chats.push(newChat);
    await writeJsonFile('chats.json', chats);
    return newChat;
  },

  async addMessage(chatId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Chat | null> {
    const chats = await this.getAll();
    const index = chats.findIndex(chat => chat.id === chatId);
    
    if (index === -1) return null;
    
    const newMessage: Message = {
      id: uuidv4(),
      ...message,
      timestamp: new Date().toISOString(),
    };
    
    chats[index].messages.push(newMessage);
    chats[index].updatedAt = new Date().toISOString();
    
    await writeJsonFile('chats.json', chats);
    return chats[index];
  },

  async update(id: string, updates: Partial<Omit<Chat, 'id' | 'createdAt'>>): Promise<Chat | null> {
    const chats = await this.getAll();
    const index = chats.findIndex(chat => chat.id === id);
    
    if (index === -1) return null;
    
    chats[index] = { 
      ...chats[index], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await writeJsonFile('chats.json', chats);
    return chats[index];
  },

  async delete(id: string): Promise<boolean> {
    const chats = await this.getAll();
    const filteredChats = chats.filter(chat => chat.id !== id);
    
    if (filteredChats.length === chats.length) return false;
    
    await writeJsonFile('chats.json', filteredChats);
    return true;
  },

  async deleteByCharacterId(characterId: string): Promise<void> {
    const chats = await this.getAll();
    const filteredChats = chats.filter(chat => chat.characterId !== characterId);
    await writeJsonFile('chats.json', filteredChats);
  }
};