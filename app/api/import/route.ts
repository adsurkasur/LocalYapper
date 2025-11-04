import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';

interface ImportData {
  version: string;
  exportedAt: string;
  user: {
    displayName: string;
    locale: string;
    timezone: string;
    theme: string;
    defaultModel?: string | null;
    security?: string | null;
  };
  personas: Array<{
    name: string;
    style: string;
    speakingPatterns: string;
    preferences: string;
    tags: string[];
    createdAt: Date;
  }>;
  bots: Array<{
    name: string;
    color: string;
    avatarPath?: string | null;
    systemPrompt: string;
    defaultModel: string;
    temperature: number;
    topP: number;
    visibility: string;
    createdAt: Date;
  }>;
  sessions: Array<{
    title: string;
    modelOverride?: string | null;
    parametersOverride?: string | null;
    archived: boolean;
    createdAt: Date;
    botName?: string;
    messages: Array<{
      role: string;
      content: string;
      metadata?: string | null;
      createdAt: Date;
    }>;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const importData: ImportData = await request.json();

    // Validate import data structure
    if (!importData.version || !importData.user || !importData.personas || !importData.bots || !importData.sessions) {
      return NextResponse.json(
        { error: 'Invalid import data format' },
        { status: 400 }
      );
    }

    // Update user profile
    await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: importData.user.displayName,
        locale: importData.user.locale,
        timezone: importData.user.timezone,
        theme: importData.user.theme,
        defaultModel: importData.user.defaultModel,
      },
    });

    // Import personas
    for (const personaData of importData.personas) {
      await prisma.persona.create({
        data: {
          userId,
          name: personaData.name,
          style: personaData.style,
          speakingPatterns: personaData.speakingPatterns,
          preferences: personaData.preferences,
          tags: JSON.stringify(personaData.tags),
          createdAt: new Date(personaData.createdAt),
        },
      });
    }

    // Import bots
    for (const botData of importData.bots) {
      await prisma.bot.create({
        data: {
          userId,
          name: botData.name,
          color: botData.color,
          avatarPath: botData.avatarPath,
          systemPrompt: botData.systemPrompt,
          defaultModel: botData.defaultModel,
          temperature: botData.temperature,
          topP: botData.topP,
          visibility: botData.visibility,
          createdAt: new Date(botData.createdAt),
        },
      });
    }

    // Import sessions and messages
    for (const sessionData of importData.sessions) {
      // Find bot by name if specified
      let botId = null;
      if (sessionData.botName) {
        const bot = await prisma.bot.findFirst({
          where: {
            userId,
            name: sessionData.botName,
          },
        });
        botId = bot?.id;
      }

      // Skip sessions without valid bots
      if (!botId) {
        console.warn(`Skipping session "${sessionData.title}" - no matching bot found`);
        continue;
      }

      const session = await prisma.chatSession.create({
        data: {
          userId,
          botId,
          title: sessionData.title,
          modelOverride: sessionData.modelOverride,
          parametersOverride: sessionData.parametersOverride,
          archived: sessionData.archived,
          createdAt: new Date(sessionData.createdAt),
        },
      });

      // Import messages
      for (const messageData of sessionData.messages) {
        await prisma.message.create({
          data: {
            sessionId: session.id,
            role: messageData.role,
            content: messageData.content,
            metadata: messageData.metadata,
            createdAt: new Date(messageData.createdAt),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: {
        personas: importData.personas.length,
        bots: importData.bots.length,
        sessions: importData.sessions.length,
        messages: importData.sessions.reduce((total, session) => total + session.messages.length, 0),
      },
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    );
  }
}