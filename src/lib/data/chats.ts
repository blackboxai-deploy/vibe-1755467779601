import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { Chat, Message } from '@/lib/types';

const DATA_DIR = join(process.cwd(), 'data');
const CHATS_FILE = join(DATA_DIR, 'chats.json');

export async function getChats(): Promise<Chat[]> {
  try {
    const data = await readFile(CHATS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading chats:', error);
    return [];
  }
}

export async function getChatById(id: string): Promise<Chat | null> {
  const chats = await getChats();
  return chats.find(chat => chat.id === id) || null;
}

export async function getUserChats(userId: string): Promise<Chat[]> {
  const chats = await getChats();
  return chats.filter(chat => chat.userId === userId);
}

export async function saveChat(chat: Chat): Promise<void> {
  const chats = await getChats();
  const existingIndex = chats.findIndex(c => c.id === chat.id);
  
  if (existingIndex >= 0) {
    chats[existingIndex] = chat;
  } else {
    chats.push(chat);
  }
  
  await writeFile(CHATS_FILE, JSON.stringify(chats, null, 2));
}

export async function addMessageToChat(chatId: string, message: Message): Promise<void> {
  const chats = await getChats();
  const chatIndex = chats.findIndex(chat => chat.id === chatId);
  
  if (chatIndex >= 0) {
    chats[chatIndex].messages.push(message);
    chats[chatIndex].updatedAt = new Date().toISOString();
    await writeFile(CHATS_FILE, JSON.stringify(chats, null, 2));
  }
}

export async function deleteChat(id: string): Promise<void> {
  const chats = await getChats();
  const filteredChats = chats.filter(chat => chat.id !== id);
  await writeFile(CHATS_FILE, JSON.stringify(filteredChats, null, 2));
}