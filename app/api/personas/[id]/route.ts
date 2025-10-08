import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId();
    const body = await request.json();

    const persona = await prisma.persona.update({
      where: { id, userId },
      data: {
        name: body.name,
        style: body.style,
        speakingPatterns: body.speakingPatterns,
        preferences: body.preferences,
        tags: body.tags ? JSON.stringify(body.tags) : undefined,
      },
    });

    return NextResponse.json({
      ...persona,
      tags: JSON.parse(persona.tags),
    });
  } catch (error) {
    console.error('Update persona error:', error);
    return NextResponse.json(
      { error: 'Failed to update persona' },
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

    await prisma.persona.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete persona error:', error);
    return NextResponse.json(
      { error: 'Failed to delete persona' },
      { status: 500 }
    );
  }
}