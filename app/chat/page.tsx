"use client";

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// framer-motion used in child components
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, User, Bot, MessageSquare } from 'lucide-react';
import MessageList from '@/components/ui/message-list';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

interface Persona {
  id: string;
  name: string;
  style: string;
  speakingPatterns: string;
  preferences: string;
  tags: string[];
}

interface Session {
  id: string;
  title: string;
  messages: Message[];
  bot: {
    id: string;
    name: string;
    color: string;
  };
}

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [activePersonaId, setActivePersonaId] = useState<string>('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const queryClient = useQueryClient();

  // Load personas
  const { data: personas } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => {
      const response = await fetch('/api/personas');
      if (!response.ok) throw new Error('Failed to load personas');
      return response.json() as Promise<Persona[]>;
    },
  });

  // Load demo session
  const { data: session, isLoading } = useQuery({
    queryKey: ['session', 'demo-session-1'],
    queryFn: async () => {
      const response = await fetch('/api/sessions/demo-session-1');
      if (!response.ok) throw new Error('Failed to load session');
      return response.json() as Promise<Session>;
    },
  });

  // Set default persona
  useEffect(() => {
    if (personas && personas.length > 0 && !activePersonaId) {
      setActivePersonaId(personas[0].id);
    }
  }, [personas, activePersonaId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, currentResponse]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      setIsStreaming(true);
      setCurrentResponse('');

      const response = await fetch(`/api/sessions/demo-session-1/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, personaId: activePersonaId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');

        // Keep incomplete event in buffer
        buffer = events.pop() || '';

        for (const event of events) {
          if (event.startsWith('data: ')) {
            try {
              const data = JSON.parse(event.slice(6)); // Remove 'data: ' prefix
              if (data.response) {
                fullResponse += data.response;
                setCurrentResponse(fullResponse);
              }
              if (data.done) {
                break;
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      return fullResponse;
    },
    onSuccess: () => {
      // Refetch session to get updated messages
      queryClient.invalidateQueries({ queryKey: ['session', 'demo-session-1'] });
      setIsStreaming(false);
      setCurrentResponse('');
      setMessage('');
    },
    onError: () => {
      setIsStreaming(false);
      setCurrentResponse('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isStreaming) return;
    sendMessage.mutate(message);
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const regenerateMessage = (messageId: string) => {
    if (!session) return;
    const messageIndex = session.messages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1 && messageIndex > 0) {
      const userMessage = session.messages[messageIndex - 1];
      if (userMessage.role === 'user') {
        sendMessage.mutate(userMessage.content);
      }
    }
  };

  // timestamps are rendered by message components

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Session not found</h2>
          <p className="text-muted-foreground">The conversation you&apos;re looking for doesn&apos;t exist.</p>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/10"
      style={{ '--active-accent': session.bot.color } as React.CSSProperties}
    >
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-background shadow-lg">
              <AvatarFallback
                style={{ backgroundColor: session.bot.color }}
                className="text-white font-semibold"
              >
                {session.bot.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: session.bot.color }} />
                <h1 className="font-semibold text-lg tracking-tight">{session.bot.name}</h1>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Bot className="h-3 w-3" />
                {session.title}
              </p>
            </div>
          </div>

          {/* Persona Selector */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Persona:</span>
            </div>
            <Select value={activePersonaId} onValueChange={setActivePersonaId}>
              <SelectTrigger className="w-40 sm:w-48">
                <SelectValue placeholder="Select persona" />
              </SelectTrigger>
              <SelectContent>
                {personas?.map((persona) => (
                  <SelectItem key={persona.id} value={persona.id}>
                    <div className="flex items-center gap-2">
                      <span>{persona.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {persona.tags[0]}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-6">
        <MessageList
          messages={session.messages}
          botColor={session.bot.color}
          isStreaming={isStreaming}
          currentResponse={currentResponse}
          copiedMessageId={copiedMessageId}
          onCopy={copyToClipboard}
          onRegenerate={regenerateMessage}
        />
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0">
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="flex-1 relative">
              <div className="rounded-2xl border border-muted-foreground/15 bg-card/40 shadow-sm">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message. Shift+Enter for newline."
                  disabled={isStreaming}
                  className="pr-16 py-3 text-sm rounded-2xl border-0 min-h-[44px] resize-none bg-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  onInput={(e) => {
                    const el = e.currentTarget as HTMLTextAreaElement;
                    el.style.height = 'auto';
                    el.style.height = Math.min(el.scrollHeight, 240) + 'px';
                  }}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-2">
                  <span className="hidden sm:block text-[11px] text-muted-foreground mr-1">
                    Enter to send
                  </span>
                  <Button
                    type="submit"
                    disabled={!message.trim() || isStreaming}
                    size="icon"
                    className="h-9 w-9 rounded-xl"
                    aria-label="Send message"
                  >
                    {isStreaming ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {isStreaming && (
            <div className="flex items-center justify-center mt-3">
              <Badge variant="secondary" className="text-xs">
                <Bot className="h-3 w-3 mr-1" />
                {session.bot.name} is typing...
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
