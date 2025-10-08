import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const user = await prisma.user.upsert({
    where: { id: 'demo-user' },
    update: {},
    create: {
      id: 'demo-user',
      displayName: 'Demo User',
      locale: 'en-US',
      timezone: 'America/New_York',
      theme: 'system',
    },
  });

  // Create demo personas
  const persona1 = await prisma.persona.upsert({
    where: { id: 'demo-persona-1' },
    update: {},
    create: {
      id: 'demo-persona-1',
      userId: user.id,
      name: 'Nova',
      style: 'Warm, empathetic, creative',
      speakingPatterns: 'Short paragraphs, asks clarifying questions',
      preferences: 'Fantasy roleplay, cozy scenes, gentle humor',
      tags: JSON.stringify(['roleplay', 'creative']),
    },
  });

  // Create demo bots
  const bot1 = await prisma.bot.upsert({
    where: { id: 'demo-bot-1' },
    update: {},
    create: {
      id: 'demo-bot-1',
      userId: user.id,
      name: 'Aria',
      color: '#3AD29F',
      systemPrompt: `You are Aria, a warm, empathetic roleplay companion. Stay in-character at all times. You enjoy cozy, slice-of-life scenes and gentle humor. Match the user's speaking style and preferences.`,
      defaultModel: 'llama3.2:3b',
      temperature: 0.7,
      topP: 0.9,
    },
  });

  const bot2 = await prisma.bot.upsert({
    where: { id: 'demo-bot-2' },
    update: {},
    create: {
      id: 'demo-bot-2',
      userId: user.id,
      name: 'Sage',
      color: '#A97FFF',
      systemPrompt: `You are Sage, a wise and mysterious storyteller. You speak in poetic, flowing prose. You love weaving tales of adventure and magic.`,
      defaultModel: 'llama3.2:3b',
      temperature: 0.8,
      topP: 0.95,
    },
  });

  // Create demo session
  const session = await prisma.chatSession.upsert({
    where: { id: 'demo-session-1' },
    update: {},
    create: {
      id: 'demo-session-1',
      userId: user.id,
      botId: bot1.id,
      title: 'Evening Chat',
      messages: {
        create: [
          {
            role: 'user',
            content: "Let's watch the rain together on the porch.",
          },
          {
            role: 'assistant',
            content: "I love rainy evenings. The sound of raindrops on the roof is so soothing. What would you like to drink? I can make us some tea.",
          },
        ],
      },
    },
  });

  // Create settings
  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      ollamaHost: 'http://127.0.0.1:11434',
      internetEnabled: false,
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });