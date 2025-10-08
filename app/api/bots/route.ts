import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    const bots = await prisma.bot.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bots);
  } catch (error) {
    console.error('Get bots error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = await getCurrentUserId();

    const bot = await prisma.bot.create({
      data: {
        userId,
        name: body.name,
        color: body.color || '#4C82FF',
        avatarPath: body.avatarPath,
        systemPrompt: body.systemPrompt,
        defaultModel: body.defaultModel,
        temperature: body.temperature || 0.7,
        topP: body.topP || 0.9,
        visibility: body.visibility || 'private',
      },
    });

    return NextResponse.json(bot);
  } catch (error) {
    console.error('Create bot error:', error);
    return NextResponse.json(
      { error: 'Failed to create bot' },
      { status: 500 }
    );
  }
}