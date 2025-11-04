"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Palette, Globe, Save } from 'lucide-react';
import { User as UserType } from '@/lib/types';

export default function SettingsPage() {
  const queryClient = useQueryClient();

  // Load user settings
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/user');
      if (!response.ok) throw new Error('Failed to load user');
      return response.json();
    },
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async (data: Partial<UserType>) => {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handleSave = (field: string, value: string | boolean) => {
    updateUser.mutate({ [field]: value });
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export');
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `localyapper-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importData = JSON.parse(text);

        const response = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(importData),
        });

        if (!response.ok) throw new Error('Import failed');

        const result = await response.json();
        alert(`Import successful!\n\nImported:\n${result.imported.personas} personas\n${result.imported.bots} bots\n${result.imported.sessions} sessions\n${result.imported.messages} messages`);

        // Refresh the page to show imported data
        window.location.reload();
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import data. Please check the file format.');
      }
    };
    input.click();
  };

  if (!user) {
    return (
      <div className="py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Customize your LocalYapper experience
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  defaultValue={user.theme}
                  onValueChange={(value) => handleSave('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultModel">Default Model</Label>
                <Input
                  id="defaultModel"
                  defaultValue={user.defaultModel || ''}
                  onBlur={(e) => handleSave('defaultModel', e.target.value)}
                  placeholder="e.g., llama2:7b, mistral:7b"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use bot-specific models
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Advanced
              </CardTitle>
              <CardDescription>
                Advanced configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">System Information</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>User ID: {user.id}</p>
                  <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                  <p>Last Updated: {new Date(user.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={handleExport}>
                  Export Data
                </Button>
                <Button variant="outline" className="w-full" onClick={handleImport}>
                  Import Data
                </Button>
                <Button variant="destructive" className="w-full">
                  Reset All Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => window.location.reload()}>
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </motion.div>
    </div>
  );
}