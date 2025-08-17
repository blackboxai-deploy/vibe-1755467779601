import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { Character } from '@/lib/types';

const DATA_DIR = join(process.cwd(), 'data');
const CHARACTERS_FILE = join(DATA_DIR, 'characters.json');

export async function getCharacters(): Promise<Character[]> {
  try {
    const data = await readFile(CHARACTERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading characters:', error);
    return [];
  }
}

export async function getCharacterById(id: string): Promise<Character | null> {
  const characters = await getCharacters();
  return characters.find(char => char.id === id) || null;
}

export async function saveCharacter(character: Character): Promise<void> {
  const characters = await getCharacters();
  const existingIndex = characters.findIndex(char => char.id === character.id);
  
  if (existingIndex >= 0) {
    characters[existingIndex] = character;
  } else {
    characters.push(character);
  }
  
  await writeFile(CHARACTERS_FILE, JSON.stringify(characters, null, 2));
}

export async function deleteCharacter(id: string): Promise<void> {
  const characters = await getCharacters();
  const filteredCharacters = characters.filter(char => char.id !== id);
  await writeFile(CHARACTERS_FILE, JSON.stringify(filteredCharacters, null, 2));
}

export async function getPublicCharacters(): Promise<Character[]> {
  const characters = await getCharacters();
  return characters.filter(char => char.isPublic);
}

export async function getUserCharacters(userId: string): Promise<Character[]> {
  const characters = await getCharacters();
  return characters.filter(char => char.creatorId === userId);
}