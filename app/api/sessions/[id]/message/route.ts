import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const userId = 'demo-user'; // TODO: Get from auth

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
    const userMessage = await prisma.message.create({
      data: {
        sessionId,
        role: 'user',
        content: body.content,
      },
    });

    // Assemble context pack
    const contextPack = buildContextPack(session, persona, body.content);

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
              } catch (e) {
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

function buildContextPack(session: any, persona: any, userMessage: string) {
  const messages = [
    ...session.messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];

  let systemPrompt = session.bot.systemPrompt;

  // Add persona context if available
  if (persona) {
    systemPrompt += `\n\nYou are roleplaying as the user who is: ${persona.name}. ${persona.style}. Speaking patterns: ${persona.speakingPatterns}. Preferences: ${persona.preferences}.`;
  }

  // Simple context pack for now
  return {
    model: session.modelOverride || session.bot.defaultModel,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages,
    ],
    stream: true,
    options: {
      temperature: session.parametersOverride?.temperature || session.bot.temperature,
      top_p: session.parametersOverride?.topP || session.bot.topP,
    },
  };
}