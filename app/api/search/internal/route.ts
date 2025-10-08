import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({
        sessions: [],
        messages: [],
        personas: [],
        bots: [],
      });
    }

    const searchTerm = query.toLowerCase();

    // Search chat sessions
    const sessions = await prisma.chatSession.findMany({
      where: {
        userId,
        title: {
          contains: searchTerm,
        },
      },
      include: {
        bot: true,
        _count: {
          select: { messages: true },
        },
      },
      take: 10,
    });

    // Search messages
    const messages = await prisma.message.findMany({
      where: {
        session: {
          userId,
        },
        content: {
          contains: searchTerm,
        },
      },
      include: {
        session: {
          include: {
            bot: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Search personas
    const personas = await prisma.persona.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: searchTerm } },
          { style: { contains: searchTerm } },
          { speakingPatterns: { contains: searchTerm } },
          { preferences: { contains: searchTerm } },
        ],
      },
      take: 10,
    });

    // Search bots
    const bots = await prisma.bot.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: searchTerm } },
          { systemPrompt: { contains: searchTerm } },
        ],
      },
      take: 10,
    });

    // Parse persona tags for display
    const personasWithTags = personas.map(persona => ({
      ...persona,
      tags: JSON.parse(persona.tags) as string[],
    }));

    return NextResponse.json({
      sessions,
      messages,
      personas: personasWithTags,
      bots,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}