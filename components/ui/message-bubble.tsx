"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import MessageActions from "./message-actions";

function formatRelative(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

interface MessageBubbleProps {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  botColor?: string;
  copiedMessageId: string | null;
  onCopy: (content: string, id: string) => void;
  onRegenerate?: (id: string) => void;
}

export function MessageBubble({ id, role, content, createdAt, botColor, copiedMessageId, onCopy, onRegenerate }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} group`}>
      {!isUser && (
        <Avatar className="h-8 w-8 ring-1 ring-muted-foreground/20 flex-shrink-0">
          <AvatarFallback style={{ backgroundColor: botColor }} className="text-white text-sm">
            {botColor ? '' : 'B'}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col gap-1 max-w-[75%] sm:max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted/60 border border-muted-foreground/10'} rounded-2xl px-5 py-4 shadow-md relative`}>
          {!isUser && (
            <div
              className="absolute left-0 top-0 h-full w-2.5 rounded-l-2xl opacity-80"
              style={{ backgroundColor: botColor || 'transparent' }}
            />
          )}
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>

          <div className={`absolute top-2 ${isUser ? '-left-12' : '-right-12'} opacity-0 group-hover:opacity-100 transition-opacity`}>
            <MessageActions id={id} content={content} copiedMessageId={copiedMessageId} onCopy={onCopy} onRegenerate={onRegenerate} />
          </div>
        </div>

        <div className={`flex items-center gap-1 text-xs text-muted-foreground px-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span>{formatRelative(createdAt)}</span>
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 ring-1 ring-muted-foreground/20 flex-shrink-0">
          <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export default MessageBubble;
