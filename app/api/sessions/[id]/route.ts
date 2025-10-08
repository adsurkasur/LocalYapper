import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const userId = await getCurrentUserId();

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        bot: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const userId = await getCurrentUserId();

    const updateData: Partial<{
      title: string;
      archived: boolean;
      modelOverride: string | null;
      parametersOverride: string | null;
    }> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.archived !== undefined) updateData.archived = body.archived;
    if (body.modelOverride !== undefined) updateData.modelOverride = body.modelOverride;
    if (body.parametersOverride !== undefined) {
      updateData.parametersOverride = body.parametersOverride ? JSON.stringify(body.parametersOverride) : null;
    }

    const session = await prisma.chatSession.update({
      where: { id: sessionId, userId },
      data: updateData,
      include: {
        bot: true,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}