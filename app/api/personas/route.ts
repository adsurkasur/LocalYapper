import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PersonaWithTags, CreatePersonaRequest, Persona } from '@/lib/types';
import { getCurrentUserId } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    const personas = await prisma.persona.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Parse tags from JSON
    const personasWithParsedTags: PersonaWithTags[] = personas.map((persona: Persona) => ({
      ...persona,
      tags: JSON.parse(persona.tags) as string[],
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
    const body: CreatePersonaRequest = await request.json();
    const userId = await getCurrentUserId();

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
      tags: JSON.parse(persona.tags) as string[],
    });
  } catch (error) {
    console.error('Create persona error:', error);
    return NextResponse.json(
      { error: 'Failed to create persona' },
      { status: 500 }
    );
  }
}