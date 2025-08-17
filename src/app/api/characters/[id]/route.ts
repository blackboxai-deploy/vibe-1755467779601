import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

const dataDir = join(process.cwd(), 'data');
const charactersFile = join(dataDir, 'characters.json');

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

const updateCharacterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  systemPrompt: z.string().min(1).max(2000).optional(),
  isPublic: z.boolean().optional(),
  avatar: z.string().url().optional(),
});

function getCharacters(): Character[] {
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

function saveCharacters(characters: Character[]): void {
  writeFileSync(charactersFile, JSON.stringify(characters, null, 2));
}

function getUserFromToken(request: NextRequest): { userId: string } | null {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const characters = getCharacters();
    const character = characters.find(c => c.id === id);
    
    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    const user = getUserFromToken(request);
    
    if (!character.isPublic && (!user || user.userId !== character.creatorId)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(character);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateCharacterSchema.parse(body);

    const characters = getCharacters();
    const characterIndex = characters.findIndex(c => c.id === id);
    
    if (characterIndex === -1) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    const character = characters[characterIndex];
    
    if (character.creatorId !== user.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    characters[characterIndex] = {
      ...character,
      ...validatedData,
    };

    saveCharacters(characters);

    return NextResponse.json(characters[characterIndex]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const characters = getCharacters();
    const characterIndex = characters.findIndex(c => c.id === id);
    
    if (characterIndex === -1) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    const character = characters[characterIndex];
    
    if (character.creatorId !== user.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    characters.splice(characterIndex, 1);
    saveCharacters(characters);

    return NextResponse.json({ message: 'Character deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}