import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface Character {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  creatorId: string;
  isPublic: boolean;
  avatar: string;
  createdAt: string;
  chatCount: number;
}

const CharacterSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  systemPrompt: z.string().min(1).max(2000),
  isPublic: z.boolean().default(true),
  avatar: z.string().url().optional()
});

const dataDir = join(process.cwd(), 'data');
const charactersFile = join(dataDir, 'characters.json');

function ensureDataDir() {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

function getCharacters(): Character[] {
  ensureDataDir();
  if (!existsSync(charactersFile)) {
    return [];
  }
  try {
    const data = readFileSync(charactersFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveCharacters(characters: Character[]) {
  ensureDataDir();
  writeFileSync(charactersFile, JSON.stringify(characters, null, 2));
}

function getUserFromToken(request: NextRequest): string | null {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;
    
    const decoded = verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = getUserFromToken(request);
    const showAll = searchParams.get('all') === 'true';
    const creatorId = searchParams.get('creator');
    
    const characters = getCharacters();
    
    let filteredCharacters = characters;
    
    if (creatorId) {
      filteredCharacters = characters.filter(char => char.creatorId === creatorId);
    } else if (!showAll) {
      filteredCharacters = characters.filter(char => 
        char.isPublic || char.creatorId === userId
      );
    }
    
    return NextResponse.json(filteredCharacters);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = CharacterSchema.parse(body);
    
    const characters = getCharacters();
    
    const newCharacter: Character = {
      id: uuidv4(),
      name: validatedData.name,
      description: validatedData.description,
      systemPrompt: validatedData.systemPrompt,
      creatorId: userId,
      isPublic: validatedData.isPublic,
      avatar: validatedData.avatar || `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/243d308a-720b-431f-a55a-47252c903db9.png}`,
      createdAt: new Date().toISOString(),
      chatCount: 0
    };
    
    characters.push(newCharacter);
    saveCharacters(characters);
    
    return NextResponse.json(newCharacter, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid character data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create character' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Character ID required' },
        { status: 400 }
      );
    }
    
    const validatedData = CharacterSchema.partial().parse(updateData);
    
    const characters = getCharacters();
    const characterIndex = characters.findIndex(char => char.id === id);
    
    if (characterIndex === -1) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }
    
    const character = characters[characterIndex];
    
    if (character.creatorId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to update this character' },
        { status: 403 }
      );
    }
    
    characters[characterIndex] = {
      ...character,
      ...validatedData
    };
    
    saveCharacters(characters);
    
    return NextResponse.json(characters[characterIndex]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid character data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('id');
    
    if (!characterId) {
      return NextResponse.json(
        { error: 'Character ID required' },
        { status: 400 }
      );
    }
    
    const characters = getCharacters();
    const characterIndex = characters.findIndex(char => char.id === characterId);
    
    if (characterIndex === -1) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }
    
    const character = characters[characterIndex];
    
    if (character.creatorId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this character' },
        { status: 403 }
      );
    }
    
    characters.splice(characterIndex, 1);
    saveCharacters(characters);
    
    return NextResponse.json({ message: 'Character deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete character' },
      { status: 500 }
    );
  }
}