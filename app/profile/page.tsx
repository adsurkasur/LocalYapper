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
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Plus, Edit, Trash2, Upload } from 'lucide-react';
import { PersonaWithTags, CreatePersonaRequest } from '@/lib/types';

export default function ProfilePage() {
  const [isCreatePersonaOpen, setIsCreatePersonaOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<PersonaWithTags | null>(null);
  const queryClient = useQueryClient();

  // Load user profile
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/user');
      if (!response.ok) throw new Error('Failed to load user');
      return response.json();
    },
  });

  // Load personas
  const { data: personas } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => {
      const response = await fetch('/api/personas');
      if (!response.ok) throw new Error('Failed to load personas');
      return response.json() as Promise<PersonaWithTags[]>;
    },
  });

  // Create persona mutation
  const createPersona = useMutation({
    mutationFn: async (data: CreatePersonaRequest) => {
      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create persona');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      setIsCreatePersonaOpen(false);
    },
  });

  // Update persona mutation
  const updatePersona = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreatePersonaRequest> }) => {
      const response = await fetch(`/api/personas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update persona');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      setEditingPersona(null);
    },
  });

  // Delete persona mutation
  const deletePersona = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/personas/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete persona');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
    },
  });

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <User className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Profile & Personas</h1>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="personas">Personas</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>
                  Manage your display name, avatar, and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg">
                      {user?.displayName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      defaultValue={user?.displayName || ''}
                      placeholder="Enter your display name"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Change Avatar
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="locale">Locale</Label>
                    <Select defaultValue={user?.locale || 'en-US'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es-ES">Spanish</SelectItem>
                        <SelectItem value="fr-FR">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select defaultValue={user?.theme || 'system'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personas" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Your Personas</h2>
                <p className="text-muted-foreground">
                  Create different personalities for your conversations
                </p>
              </div>
              <Dialog open={isCreatePersonaOpen} onOpenChange={setIsCreatePersonaOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Persona
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Persona</DialogTitle>
                    <DialogDescription>
                      Define a new personality for your roleplay conversations
                    </DialogDescription>
                  </DialogHeader>
                  <PersonaForm
                    onSubmit={(data) => createPersona.mutate(data)}
                    onCancel={() => setIsCreatePersonaOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personas?.map((persona) => (
                <motion.div
                  key={persona.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{persona.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingPersona(persona)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Delete this persona?')) {
                                deletePersona.mutate(persona.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Style</p>
                        <p className="text-sm text-muted-foreground">{persona.style}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Speaking Patterns</p>
                        <p className="text-sm text-muted-foreground">{persona.speakingPatterns}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {persona.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Persona Dialog */}
        {editingPersona && (
          <Dialog open={!!editingPersona} onOpenChange={() => setEditingPersona(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Persona</DialogTitle>
                <DialogDescription>
                  Update your persona&apos;s characteristics
                </DialogDescription>
              </DialogHeader>
              <PersonaForm
                initialData={editingPersona}
                onSubmit={(data) => updatePersona.mutate({ id: editingPersona.id, data })}
                onCancel={() => setEditingPersona(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </motion.div>
    </div>
  );
}

interface PersonaFormProps {
  initialData?: PersonaWithTags;
  onSubmit: (data: CreatePersonaRequest) => void;
  onCancel: () => void;
}

function PersonaForm({ initialData, onSubmit, onCancel }: PersonaFormProps) {
  const [formData, setFormData] = useState<CreatePersonaRequest>({
    name: initialData?.name || '',
    style: initialData?.style || '',
    speakingPatterns: initialData?.speakingPatterns || '',
    preferences: initialData?.preferences || '',
    tags: initialData?.tags || [],
  });
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Alex, The Adventurer"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="style">Style</Label>
        <Textarea
          id="style"
          value={formData.style}
          onChange={(e) => setFormData({ ...formData, style: e.target.value })}
          placeholder="e.g., Warm, empathetic, creative"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="speakingPatterns">Speaking Patterns</Label>
        <Textarea
          id="speakingPatterns"
          value={formData.speakingPatterns}
          onChange={(e) => setFormData({ ...formData, speakingPatterns: e.target.value })}
          placeholder="e.g., Short paragraphs, asks clarifying questions"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferences">Preferences</Label>
        <Textarea
          id="preferences"
          value={formData.preferences}
          onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
          placeholder="e.g., Fantasy roleplay, cozy scenes, gentle humor"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} variant="outline">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {formData.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
              {tag} ×
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit">Save Persona</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}