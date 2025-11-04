import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';
import { buildContextPack, getTimeContext } from '@/lib/prompt-assembly';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const userId = await getCurrentUserId();

    // Get session with bot and messages
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        bot: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get active persona
    let persona = null;
    if (body.personaId) {
      persona = await prisma.persona.findFirst({
        where: { id: body.personaId, userId },
      });
    } else {
      // Default to first persona
      persona = await prisma.persona.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Create user message
    await prisma.message.create({
      data: {
        sessionId,
        role: 'user',
        content: body.content,
      },
    });

    // Parse persona tags if persona exists
    const personaWithTags = persona ? {
      ...persona,
      tags: JSON.parse(persona.tags) as string[],
    } : null;

    // Get user timezone for time awareness
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { timezone: true },
    });
    const userTimezone = user?.timezone || 'UTC';

    // Assemble context pack with time awareness
    const timeContext = getTimeContext(userTimezone);
    const contextPack = buildContextPack(session, personaWithTags, body.content, {}, timeContext);

    // Call Ollama
    const ollamaResponse = await fetch(`${process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contextPack),
    });

    if (!ollamaResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get response from Ollama' },
        { status: ollamaResponse.status }
      );
    }

    // Create assistant message placeholder
    const assistantMessage = await prisma.message.create({
      data: {
        sessionId,
        role: 'assistant',
        content: '',
      },
    });

    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaResponse.body?.getReader();
        if (!reader) {
          controller.error(new Error('No response body'));
          return;
        }

        let fullResponse = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                if (data.response) {
                  fullResponse += data.response;
                  controller.enqueue(new TextEncoder().encode(data.response));
                }
                if (data.done) break;
              } catch {
                // Ignore parse errors
              }
            }
          }

          // Update the message with full content
          await prisma.message.update({
            where: { id: assistantMessage.id },
            data: { content: fullResponse },
          });

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}