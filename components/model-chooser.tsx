"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Bot, Settings, Check, AlertCircle } from 'lucide-react';
import { OllamaModel } from '@/lib/types';

interface ModelChooserProps {
  currentModel?: string;
  onModelSelect: (model: string) => void;
  trigger?: React.ReactNode;
}

export function ModelChooser({ currentModel, onModelSelect, trigger }: ModelChooserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(currentModel || '');

  // Load available models
  const { data: models, isLoading, error } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await fetch('/api/ollama/models');
      if (!response.ok) throw new Error('Failed to load models');
      return response.json();
    },
    enabled: isOpen, // Only load when modal is open
  });

  const handleConfirm = () => {
    onModelSelect(selectedModel);
    setIsOpen(false);
  };

  const availableModels = models?.models?.filter((model: OllamaModel) =>
    model.name.includes('llama') ||
    model.name.includes('mistral') ||
    model.name.includes('qwen') ||
    model.name.includes('codellama') ||
    model.name.includes('phi')
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Bot className="h-4 w-4 mr-2" />
            {currentModel || 'Select Model'}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Choose AI Model
          </DialogTitle>
          <DialogDescription>
            Select the AI model to use for this conversation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading available models...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="h-4 w-4" />
              <div>
                <p className="font-medium">Failed to load models</p>
                <p className="text-sm">Make sure Ollama is running and models are installed.</p>
              </div>
            </div>
          )}

          {!isLoading && !error && availableModels.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Models Available</h3>
              <p className="text-muted-foreground mb-4">
                Install some models in Ollama to get started:
              </p>
              <div className="space-y-2 text-sm text-left bg-muted p-4 rounded-md">
                <p><code>ollama pull llama2:7b</code></p>
                <p><code>ollama pull mistral:7b</code></p>
                <p><code>ollama pull codellama:7b</code></p>
              </div>
            </div>
          )}

          <AnimatePresence>
            {availableModels.map((model: OllamaModel) => (
              <motion.div
                key={model.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedModel === model.name
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedModel(model.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedModel === model.name && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <h3 className="font-medium">{model.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {(model.size / 1024 / 1024 / 1024).toFixed(1)}GB
                        </Badge>
                        {model.details?.family && (
                          <Badge variant="secondary" className="text-xs">
                            {model.details.family}
                          </Badge>
                        )}
                        {model.details?.quantization_level && (
                          <Badge variant="outline" className="text-xs">
                            {model.details.quantization_level}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {model.details && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Format: {model.details.format}</p>
                    {model.details.parameter_size && (
                      <p>Parameters: {model.details.parameter_size}</p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {availableModels.length > 0 && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleConfirm} disabled={!selectedModel}>
                Use Selected Model
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}