import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    // Get all user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all personas
    const personas = await prisma.persona.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    // Get all bots
    const bots = await prisma.bot.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    // Get all chat sessions with messages
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        bot: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Create export data structure
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: {
        displayName: user.displayName,
        locale: user.locale,
        timezone: user.timezone,
        theme: user.theme,
        defaultModel: user.defaultModel,
        security: user.security,
      },
      personas: personas.map(persona => ({
        name: persona.name,
        style: persona.style,
        speakingPatterns: persona.speakingPatterns,
        preferences: persona.preferences,
        tags: JSON.parse(persona.tags),
        createdAt: persona.createdAt,
      })),
      bots: bots.map(bot => ({
        name: bot.name,
        color: bot.color,
        avatarPath: bot.avatarPath,
        systemPrompt: bot.systemPrompt,
        defaultModel: bot.defaultModel,
        temperature: bot.temperature,
        topP: bot.topP,
        visibility: bot.visibility,
        createdAt: bot.createdAt,
      })),
      sessions: sessions.map(session => ({
        title: session.title,
        modelOverride: session.modelOverride,
        parametersOverride: session.parametersOverride,
        archived: session.archived,
        createdAt: session.createdAt,
        botName: session.bot?.name,
        messages: session.messages.map(message => ({
          role: message.role,
          content: message.content,
          metadata: message.metadata,
          createdAt: message.createdAt,
        })),
      })),
    };

    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Content-Disposition', `attachment; filename="localyapper-export-${new Date().toISOString().split('T')[0]}.json"`);

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers,
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}