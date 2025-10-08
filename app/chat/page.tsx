"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullResponse += chunk;
        setCurrentResponse(fullResponse);
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

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return <div className="flex items-center justify-center min-h-screen">Session not found</div>;
  }

  const activePersona = personas?.find(p => p.id === activePersonaId);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback style={{ backgroundColor: session.bot.color }}>
                {session.bot.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold">{session.bot.name}</h1>
              <p className="text-sm text-muted-foreground">{session.title}</p>
            </div>
          </div>

          {/* Persona Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Persona:</span>
            <Select value={activePersonaId} onValueChange={setActivePersonaId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select persona" />
              </SelectTrigger>
              <SelectContent>
                {personas?.map((persona) => (
                  <SelectItem key={persona.id} value={persona.id}>
                    {persona.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          <AnimatePresence>
            {session.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <Avatar>
                    <AvatarFallback style={{ backgroundColor: session.bot.color }}>
                      {session.bot.name[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                <Card className={`max-w-[70%] p-3 ${
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : ''
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </Card>
                {msg.role === 'user' && (
                  <Avatar>
                    <AvatarFallback>U</AvatarFallback>
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
                <Avatar>
                  <AvatarFallback style={{ backgroundColor: session.bot.color }}>
                    {session.bot.name[0]}
                  </AvatarFallback>
                </Avatar>
                <Card className="max-w-[70%] p-3">
                  <p className="whitespace-pre-wrap">{currentResponse}</p>
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    ▊
                  </motion.span>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isStreaming}
              className="flex-1"
            />
            <Button type="submit" disabled={!message.trim() || isStreaming}>
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}