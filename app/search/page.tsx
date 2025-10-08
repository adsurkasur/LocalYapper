"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare, User, Bot, ArrowRight } from 'lucide-react';

interface SearchResult {
  sessions: Array<{
    id: string;
    title: string;
    createdAt: string;
    bot?: {
      name: string;
      color: string;
    };
    _count?: {
      messages: number;
    };
  }>;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: string;
    session: {
      id: string;
      title: string;
      bot?: {
        name: string;
        color: string;
      };
    };
  }>;
  personas: Array<{
    id: string;
    name: string;
    style: string;
    tags: string[];
    createdAt: string;
  }>;
  bots: Array<{
    id: string;
    name: string;
    color: string;
    systemPrompt: string;
    defaultModel: string;
    createdAt: string;
  }>;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  });

  // Search query
  const { data: results, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async (): Promise<SearchResult> => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return { sessions: [], messages: [], personas: [], bots: [] };
      }

      const response = await fetch(`/api/search/internal?q=${encodeURIComponent(debouncedQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: debouncedQuery.length >= 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(query);
  };

  const totalResults = results ? (
    results.sessions.length +
    results.messages.length +
    results.personas.length +
    results.bots.length
  ) : 0;

  return (
    <div className="py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <Search className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Search</h1>
            <p className="text-muted-foreground">
              Find conversations, personas, and bots in your data
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="flex gap-2">
            <Input
              type="search"
              placeholder="Search your conversations, personas, and bots..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </form>

        {debouncedQuery && (
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              'Searching...'
            ) : (
              `Found ${totalResults} results for "${debouncedQuery}"`
            )}
          </div>
        )}

        <AnimatePresence>
          {results && totalResults > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Chat Sessions */}
              {results.sessions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Chat Sessions ({results.sessions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {results.sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => window.location.href = `/chat?session=${session.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback style={{ backgroundColor: session.bot?.color || '#4C82FF' }}>
                              {session.bot?.name[0] || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{session.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.bot?.name || 'Unknown bot'} • {session._count?.messages || 0} messages
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Messages */}
              {results.messages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Messages ({results.messages.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {results.messages.slice(0, 5).map((message) => (
                      <div
                        key={message.id}
                        className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => window.location.href = `/chat?session=${message.session.id}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
                            {message.role}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {message.session.title}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2">{message.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {results.messages.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">
                        And {results.messages.length - 5} more messages...
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Personas */}
              {results.personas.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personas ({results.personas.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {results.personas.map((persona) => (
                      <div
                        key={persona.id}
                        className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => window.location.href = '/profile'}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{persona.name}</h3>
                          <div className="flex gap-1">
                            {persona.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {persona.style}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Bots */}
              {results.bots.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      Bots ({results.bots.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {results.bots.map((bot) => (
                      <div
                        key={bot.id}
                        className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => window.location.href = '/bots'}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback style={{ backgroundColor: bot.color }}>
                              {bot.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{bot.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {bot.defaultModel}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {bot.systemPrompt}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {debouncedQuery && !isLoading && totalResults === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or check your spelling
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}