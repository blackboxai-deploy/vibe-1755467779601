import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { characterDb, chatDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('Chat API called');
    
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    console.log('Token found:', !!token);
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user;
    try {
      user = verifyToken(token);
      console.log('User verified:', user.userId);
    } catch (error) {
      console.log('Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { message, characterId, chatId } = body;
    console.log('Request body:', { message, characterId, chatId });

    if (!message || !characterId) {
      return NextResponse.json({ error: 'Message and characterId are required' }, { status: 400 });
    }

    // Get character data
    const character = await characterDb.getById(characterId);
    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Get or create chat
    const currentChatId = chatId || `${user.userId}-${characterId}`;
    let chat = await chatDb.getById(currentChatId);
    
    if (!chat) {
      chat = await chatDb.create({
        userId: user.userId,
        characterId,
        messages: []
      });
    }

    // Save user message
    chat = await chatDb.addMessage(chat.id, {
      role: 'user',
      content: message
    });

    if (!chat) {
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    // Get recent messages for context
    const recentMessages = chat.messages.slice(-10); // Last 10 messages for context

    // Prepare messages for AI
    const messages = [
      {
        role: 'system',
        content: character.systemPrompt
      },
      ...recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Call Claude Sonnet-4 via custom endpoint
    const aiResponse = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'CustomerId': 'cus_SGPn4uhjPI0F4w',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx'
      },
      body: JSON.stringify({
        model: 'openrouter/anthropic/claude-sonnet-4',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices[0]?.message?.content || 'I apologize, but I cannot respond right now.';

    // Save assistant message
    const updatedChat = await chatDb.addMessage(chat.id, {
      role: 'assistant',
      content: assistantMessage
    });

    if (!updatedChat) {
      return NextResponse.json({ error: 'Failed to save assistant message' }, { status: 500 });
    }

    const assistantMessageObj = updatedChat.messages[updatedChat.messages.length - 1];

    return NextResponse.json({
      message: assistantMessageObj,
      chatId: chat.id
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user;
    try {
      user = verifyToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    const chat = await chatDb.getById(chatId);
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    
    return NextResponse.json({ messages: chat.messages });

  } catch (error) {
    console.error('Get chat history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}