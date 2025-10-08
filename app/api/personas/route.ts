import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // For now, get personas for demo user
    // TODO: Get from auth/session
    const userId = 'demo-user';

    const personas = await prisma.persona.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Parse tags from JSON
    const personasWithParsedTags = personas.map((persona: any) => ({
      ...persona,
      tags: JSON.parse(persona.tags),
    }));

    return NextResponse.json(personasWithParsedTags);
  } catch (error) {
    console.error('Get personas error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = 'demo-user'; // TODO: Get from auth

    const persona = await prisma.persona.create({
      data: {
        userId,
        name: body.name,
        style: body.style,
        speakingPatterns: body.speakingPatterns,
        preferences: body.preferences,
        tags: JSON.stringify(body.tags || []),
      },
    });

    return NextResponse.json({
      ...persona,
      tags: JSON.parse(persona.tags),
    });
  } catch (error) {
    console.error('Create persona error:', error);
    return NextResponse.json(
      { error: 'Failed to create persona' },
      { status: 500 }
    );
  }
}