"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User, Bot, Sparkles, ArrowRight } from 'lucide-react';

interface UserData {
  displayName: string;
}

interface SessionData {
  id: string;
  title: string;
  bot: {
    name: string;
    color: string;
  };
  _count?: {
    messages: number;
  };
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [recentSessions, setRecentSessions] = useState<SessionData[]>([]);

  useEffect(() => {
    // Load user data and recent sessions
    const loadData = async () => {
      try {
        const [userResponse, sessionsResponse] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/sessions?limit=3')
        ]);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }

        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          setRecentSessions(sessionsData);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const startNewChat = async () => {
    try {
      // Get first available bot
      const botsResponse = await fetch('/api/bots');
      if (!botsResponse.ok) throw new Error('No bots available');

      const bots = await botsResponse.json();
      if (bots.length === 0) {
        router.push('/bots');
        return;
      }

      // Create new session with first bot
      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId: bots[0].id }),
      });

      if (sessionResponse.ok) {
        const newSession = await sessionResponse.json();
        router.push(`/chat/${newSession.id}`);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      // Fallback to demo session
      router.push('/chat/demo-session-1');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight brand-title">LocalYapper</h1>
            </motion.div>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your privacy-first AI companion for immersive conversations.
              Experience roleplay with complete local control and data ownership.
            </p>

            <div className="flex items-center justify-center gap-4 mt-6">
              <Button onClick={startNewChat} size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Start New Chat
              </Button>
              <Button variant="outline" onClick={() => router.push('/bots')} size="lg">
                Manage Bots
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card>
                <CardContent className="p-6 text-center">
                  <User className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{user.displayName}</div>
                  <div className="text-sm text-muted-foreground">Welcome back!</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Bot className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{recentSessions.length}</div>
                  <div className="text-sm text-muted-foreground">Active Sessions</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">
                    {recentSessions.reduce((acc, s) => acc + (s._count?.messages || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Messages</div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Recent Sessions */}
          {recentSessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Recent Conversations
                  </CardTitle>
                  <CardDescription>
                    Continue where you left off
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => router.push(`/chat/${session.id}`)}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback style={{ backgroundColor: session.bot?.color }}>
                            {session.bot?.name?.[0] || 'B'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{session.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>with {session.bot?.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {session._count?.messages || 0} messages
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push('/profile')}
            >
              <CardContent className="p-6 text-center">
                <User className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                <div className="font-medium">Manage Personas</div>
                <div className="text-sm text-muted-foreground">Create and edit your identities</div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push('/bots')}
            >
              <CardContent className="p-6 text-center">
                <Bot className="h-8 w-8 mx-auto mb-3 text-green-500" />
                <div className="font-medium">Bot Library</div>
                <div className="text-sm text-muted-foreground">Configure AI companions</div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push('/search')}
            >
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                <div className="font-medium">Search</div>
                <div className="text-sm text-muted-foreground">Find conversations & content</div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push('/settings')}
            >
              <CardContent className="p-6 text-center">
                <Sparkles className="h-8 w-8 mx-auto mb-3 text-orange-500" />
                <div className="font-medium">Settings</div>
                <div className="text-sm text-muted-foreground">Customize your experience</div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}