"use client";

import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, Check } from "lucide-react";

interface MessageActionsProps {
  id: string;
  content: string;
  copiedMessageId: string | null;
  onCopy: (content: string, id: string) => void;
  onRegenerate?: (id: string) => void;
}

export function MessageActions({ id, content, copiedMessageId, onCopy, onRegenerate }: MessageActionsProps) {
  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0 text-muted-foreground/80 hover:text-foreground hover:bg-transparent"
        onClick={() => onCopy(content, id)}
        aria-label="Copy message"
      >
        {copiedMessageId === id ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>

      {onRegenerate && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-muted-foreground/80 hover:text-foreground hover:bg-transparent"
          onClick={() => onRegenerate(id)}
          aria-label="Regenerate message"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export default MessageActions;
