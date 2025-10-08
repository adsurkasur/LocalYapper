"use client";

import { AnimatePresence, motion } from 'framer-motion';
import MessageBubble from './message-bubble';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

interface MessageListProps {
  messages: Message[];
  botColor?: string;
  isStreaming: boolean;
  currentResponse: string;
  copiedMessageId: string | null;
  onCopy: (content: string, id: string) => void;
  onRegenerate: (id: string) => void;
}

export default function MessageList({ messages, botColor, isStreaming, currentResponse, copiedMessageId, onCopy, onRegenerate }: MessageListProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <MessageBubble
              id={msg.id}
              role={msg.role}
              content={msg.content}
              createdAt={msg.createdAt}
              botColor={botColor}
              copiedMessageId={copiedMessageId}
              onCopy={onCopy}
              onRegenerate={onRegenerate}
            />
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
            <div className="h-8 w-8 rounded-full bg-muted/40" />

            <div className="flex flex-col gap-1 max-w-[75%] sm:max-w-[70%] items-start">
              <div className="bg-muted/50 border border-muted-foreground/10 rounded-2xl px-4 py-3 shadow-sm">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {currentResponse}
                  <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block ml-1">▊</motion.span>
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground px-2">
                <div className="flex gap-1">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
