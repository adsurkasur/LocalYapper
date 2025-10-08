import { SessionWithDetails, PersonaWithTags, Message } from '@/lib/types';

export interface MemoryPolicy {
  windowTurns?: number;
  tokenBudget?: number;
  pins?: string[];
  summarizer?: 'simple' | 'llm';
}

export interface ContextPack {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  stream: boolean;
  options: {
    temperature: number;
    top_p: number;
  };
  metadata?: {
    tokenEstimate?: number;
    memoryUsed?: number;
    timeContext?: string;
  };
}

export function buildContextPack(
  session: SessionWithDetails,
  persona: PersonaWithTags | null,
  userMessage: string,
  memoryPolicy: MemoryPolicy = {},
  timeContext?: { iso: string; weekday: string; timeOfDay: string },
  searchFacts?: Array<{ title: string; content: string; timestamp: string }>
): ContextPack {
  if (!session.bot) {
    throw new Error('Session bot not found');
  }

  const messages = session.messages || [];
  let systemPrompt = session.bot.systemPrompt;

  // Add persona context if available
  if (persona) {
    systemPrompt += `\n\nYou are roleplaying as the user who is: ${persona.name}. ${persona.style}. Speaking patterns: ${persona.speakingPatterns}. Preferences: ${persona.preferences}.`;
  }

  // Add time awareness if enabled
  if (timeContext) {
    systemPrompt += `\n\nCurrent time context: ${timeContext.iso} (${timeContext.weekday}, ${timeContext.timeOfDay}).`;
  }

  // Add search facts if available
  if (searchFacts && searchFacts.length > 0) {
    const factsBlock = searchFacts
      .map(fact => `[${fact.timestamp}] ${fact.title}: ${fact.content}`)
      .join('\n');
    systemPrompt += `\n\nWeb search facts:\n${factsBlock}`;
  }

  // Add behavioral directive
  systemPrompt += `\n\nRoleplay focus: Stay in-character at all times. Do not claim real-world execution. Engage naturally in the conversation.`;

  // Build message history with memory constraints
  const recentMessages = applyMemoryPolicy(messages, memoryPolicy);

  // Parse parameters override if present
  const paramsOverride = session.parametersOverride ? JSON.parse(session.parametersOverride) : {};

  const contextPack: ContextPack = {
    model: session.modelOverride || session.bot.defaultModel,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...recentMessages.map((msg: Message) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ],
    stream: true,
    options: {
      temperature: paramsOverride.temperature ?? session.bot.temperature,
      top_p: paramsOverride.topP ?? session.bot.topP,
    },
  };

  // Add metadata for debugging
  contextPack.metadata = {
    tokenEstimate: estimateTokens(contextPack),
    memoryUsed: recentMessages.length,
    timeContext: timeContext ? `${timeContext.iso} (${timeContext.weekday})` : undefined,
  };

  return contextPack;
}

function applyMemoryPolicy(messages: Message[], policy: MemoryPolicy): Message[] {
  const { windowTurns = 50 } = policy;

  // For now, use simple turn-based window
  // TODO: Implement token-based budgeting and summarization
  const recentMessages = messages.slice(-windowTurns);

  // Add pinned facts as system messages if specified
  // TODO: Implement pinned facts injection

  return recentMessages;
}

function estimateTokens(contextPack: ContextPack): number {
  // Rough estimation: ~4 characters per token
  const totalChars = contextPack.messages.reduce((sum, msg) => sum + msg.content.length, 0);
  return Math.ceil(totalChars / 4);
}

export function getTimeContext(timezone: string = 'UTC'): { iso: string; weekday: string; timeOfDay: string } {
  const now = new Date();
  const utcTime = now.toISOString();
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone });

  const hour = now.getHours();
  let timeOfDay: string;
  if (hour < 6) timeOfDay = 'early morning';
  else if (hour < 12) timeOfDay = 'morning';
  else if (hour < 17) timeOfDay = 'afternoon';
  else if (hour < 21) timeOfDay = 'evening';
  else timeOfDay = 'night';

  return {
    iso: utcTime,
    weekday,
    timeOfDay,
  };
}

export function formatContextPackForDisplay(contextPack: ContextPack): string {
  let output = `Model: ${contextPack.model}\n`;
  output += `Temperature: ${contextPack.options.temperature}, Top-P: ${contextPack.options.top_p}\n`;
  output += `Estimated Tokens: ${contextPack.metadata?.tokenEstimate || 'Unknown'}\n\n`;

  output += 'Messages:\n';
  contextPack.messages.forEach((msg, i) => {
    output += `${i + 1}. ${msg.role.toUpperCase()}: ${msg.content}\n`;
  });

  return output;
}