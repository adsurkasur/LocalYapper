"use client";

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Copy,
  RotateCcw,
  Check,
  CheckCheck,
  Clock,
  User,
  Bot,
  MessageSquare
} from 'lucide-react';

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
    // Find the user message before this assistant message
    if (!session) return;
    const messageIndex = session.messages.findIndex(m => m.id === messageId);
    if (messageIndex !== undefined && messageIndex > 0) {
      const userMessage = session.messages[messageIndex - 1];
      if (userMessage.role === 'user') {
        sendMessage.mutate(userMessage.content);
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

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
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/10">
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
              <h1 className="font-semibold text-lg">{session.bot.name}</h1>
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
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence>
            {session.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 group ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="h-8 w-8 ring-1 ring-muted-foreground/20 flex-shrink-0">
                    <AvatarFallback
                      style={{ backgroundColor: session.bot.color }}
                      className="text-white text-sm"
                    >
                      {session.bot.name[0]}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`flex flex-col gap-1 max-w-[75%] sm:max-w-[70%] ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}>
                  <div className={`relative group/message ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 border border-muted-foreground/10'
                  } rounded-2xl px-4 py-3 shadow-sm`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                    </p>

                    {/* Message Actions */}
                    <div className={`absolute top-0 ${
                      msg.role === 'user' ? '-left-12' : '-right-12'
                    } opacity-0 group-hover/message:opacity-100 transition-opacity flex gap-1`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-muted"
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                      >
                        {copiedMessageId === msg.id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>

                      {msg.role === 'assistant' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-muted"
                          onClick={() => regenerateMessage(msg.id)}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Timestamp and Status */}
                  <div className={`flex items-center gap-1 text-xs text-muted-foreground px-2 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(msg.createdAt)}</span>
                    {msg.role === 'user' && (
                      <CheckCheck className="h-3 w-3 text-green-500 ml-1" />
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <Avatar className="h-8 w-8 ring-1 ring-muted-foreground/20 flex-shrink-0">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                      U
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Streaming response */}
          <AnimatePresence>
            {isStreaming && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex gap-3 justify-start"
              >
                <Avatar className="h-8 w-8 ring-1 ring-muted-foreground/20 flex-shrink-0">
                  <AvatarFallback
                    style={{ backgroundColor: session.bot.color }}
                    className="text-white text-sm"
                  >
                    {session.bot.name[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col gap-1 max-w-[75%] sm:max-w-[70%] items-start">
                  <div className="bg-muted/50 border border-muted-foreground/10 rounded-2xl px-4 py-3 shadow-sm">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {currentResponse}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block ml-1"
                      >
                        ▊
                      </motion.span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground px-2">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        className="w-1 h-1 bg-muted-foreground/50 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        className="w-1 h-1 bg-muted-foreground/50 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                        className="w-1 h-1 bg-muted-foreground/50 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0">
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isStreaming}
                className="pr-12 py-3 text-sm rounded-xl border-muted-foreground/20 focus:border-primary/50 min-h-[44px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              {message.trim() && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  Press Enter to send
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={!message.trim() || isStreaming}
              size="lg"
              className="rounded-xl px-6 h-11"
            >
              {isStreaming ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
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