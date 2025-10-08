import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId();

    const bot = await prisma.bot.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!bot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(bot);
  } catch (error) {
    console.error('Get bot error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bot' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = await getCurrentUserId();

    // Verify bot ownership
    const existingBot = await prisma.bot.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingBot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      );
    }

    const bot = await prisma.bot.update({
      where: { id },
      data: {
        name: body.name,
        color: body.color,
        avatarPath: body.avatarPath,
        systemPrompt: body.systemPrompt,
        defaultModel: body.defaultModel,
        temperature: body.temperature,
        topP: body.topP,
        visibility: body.visibility,
      },
    });

    return NextResponse.json(bot);
  } catch (error) {
    console.error('Update bot error:', error);
    return NextResponse.json(
      { error: 'Failed to update bot' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId();

    // Verify bot ownership
    const existingBot = await prisma.bot.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingBot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      );
    }

    // Delete associated chat sessions and messages
    await prisma.message.deleteMany({
      where: {
        session: {
          botId: id,
        },
      },
    });

    await prisma.chatSession.deleteMany({
      where: { botId: id },
    });

    // Delete the bot
    await prisma.bot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete bot error:', error);
    return NextResponse.json(
      { error: 'Failed to delete bot' },
      { status: 500 }
    );
  }
}