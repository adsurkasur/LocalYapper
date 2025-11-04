import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get('botId');
    const limit = searchParams.get('limit');

    const where = botId ? { userId, botId, archived: false } : { userId, archived: false };

    const sessions = await prisma.chatSession.findMany({
      where,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        bot: true,
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = await getCurrentUserId();

    const session = await prisma.chatSession.create({
      data: {
        userId,
        botId: body.botId,
        title: body.title || 'New Chat',
        modelOverride: body.modelOverride,
        parametersOverride: body.parametersOverride ? JSON.stringify(body.parametersOverride) : null,
      },
      include: {
        bot: true,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}