"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bot, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { CreateBotRequest, Bot as BotType, OllamaModel } from '@/lib/types';

export default function BotsPage() {
  const [isCreateBotOpen, setIsCreateBotOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<BotType | null>(null);
  const queryClient = useQueryClient();

  // Load bots
  const { data: bots } = useQuery({
    queryKey: ['bots'],
    queryFn: async () => {
      const response = await fetch('/api/bots');
      if (!response.ok) throw new Error('Failed to load bots');
      return response.json();
    },
  });

  // Load models for selection
  const { data: models } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await fetch('/api/ollama/models');
      if (!response.ok) throw new Error('Failed to load models');
      return response.json();
    },
  });

  // Create bot mutation
  const createBot = useMutation({
    mutationFn: async (data: CreateBotRequest) => {
      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create bot');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
      setIsCreateBotOpen(false);
    },
  });

  // Update bot mutation
  const updateBot = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateBotRequest> }) => {
      const response = await fetch(`/api/bots/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update bot');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
      setEditingBot(null);
    },
  });

  // Delete bot mutation
  const deleteBot = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/bots/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete bot');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
    },
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Your Bots</h1>
              <p className="text-muted-foreground">
                Create and manage AI characters for your conversations
              </p>
            </div>
          </div>

          <Dialog open={isCreateBotOpen} onOpenChange={setIsCreateBotOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Bot
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Bot</DialogTitle>
                <DialogDescription>
                  Define a new AI character with personality and capabilities
                </DialogDescription>
              </DialogHeader>
              <BotForm
                models={models?.models || []}
                onSubmit={(data) => createBot.mutate(data)}
                onCancel={() => setIsCreateBotOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots?.map((bot: BotType) => (
            <motion.div
              key={bot.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback style={{ backgroundColor: bot.color }}>
                          {bot.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{bot.name}</CardTitle>
                        <CardDescription>{bot.defaultModel}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingBot(bot)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Delete this bot? This will also delete all associated sessions.')) {
                            deleteBot.mutate(bot.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1">
                  <div>
                    <p className="text-sm font-medium mb-1">System Prompt</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {bot.systemPrompt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Temperature:</span>
                    <Badge variant="outline">{bot.temperature}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Top-P:</span>
                    <Badge variant="outline">{bot.topP}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Visibility:</span>
                    <Badge variant={bot.visibility === 'private' ? 'secondary' : 'default'}>
                      {bot.visibility}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {(!bots || bots.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bots yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first AI character to start roleplaying
            </p>
            <Button onClick={() => setIsCreateBotOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Bot
            </Button>
          </motion.div>
        )}

        {/* Edit Bot Dialog */}
        {editingBot && (
          <Dialog open={!!editingBot} onOpenChange={() => setEditingBot(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Bot</DialogTitle>
                <DialogDescription>
                  Update your bot&apos;s characteristics and settings
                </DialogDescription>
              </DialogHeader>
              <BotForm
                initialData={editingBot}
                models={models?.models || []}
                onSubmit={(data) => updateBot.mutate({ id: editingBot.id, data })}
                onCancel={() => setEditingBot(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </motion.div>
    </div>
  );
}

interface BotFormProps {
  initialData?: BotType;
  models: OllamaModel[];
  onSubmit: (data: CreateBotRequest) => void;
  onCancel: () => void;
}

function BotForm({ initialData, models, onSubmit, onCancel }: BotFormProps) {
  const [formData, setFormData] = useState<CreateBotRequest>({
    name: initialData?.name || '',
    color: initialData?.color || '#4C82FF',
    avatarPath: initialData?.avatarPath || '',
    systemPrompt: initialData?.systemPrompt || '',
    defaultModel: initialData?.defaultModel || '',
    temperature: initialData?.temperature || 0.7,
    topP: initialData?.topP || 0.9,
    visibility: initialData?.visibility || 'private',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const availableModels = models.filter(model =>
    model.name.includes('llama') || model.name.includes('mistral') || model.name.includes('qwen')
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Aria, Sage"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea
          id="systemPrompt"
          value={formData.systemPrompt}
          onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
          placeholder="Define your bot's personality, role, and behavior..."
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="defaultModel">Default Model</Label>
          <Select
            value={formData.defaultModel}
            onValueChange={(value) => setFormData({ ...formData, defaultModel: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.name} value={model.name}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select
            value={formData.visibility}
            onValueChange={(value) => setFormData({ ...formData, visibility: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="shared">Shared</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature ({formData.temperature})</Label>
          <Input
            id="temperature"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="topP">Top-P ({formData.topP})</Label>
          <Input
            id="topP"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={formData.topP}
            onChange={(e) => setFormData({ ...formData, topP: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {!formData.defaultModel && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            No model selected. Make sure Ollama is running and models are installed.
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={!formData.defaultModel}>
          Save Bot
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}