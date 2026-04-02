import React from 'react';
import { Settings2, Palette, Type, Space, Box, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PropertiesPanelProps {
  tokens?: {
    colors?: string[];
    fonts?: string[];
    fontSizes?: string[];
  };
  className?: string;
}

export function PropertiesPanel({ tokens, className }: PropertiesPanelProps) {
  const [copied, setCopied] = React.useState<string | null>(null);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1500);
  };

  const renderSection = (title: string, icon: React.ReactNode, items: string[], type: 'color' | 'text') => {
    if (!items || items.length === 0) return null;

    return (
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider border-b border-border/30 pb-2">
          {icon}
          {title}
        </div>
        <div className="grid grid-cols-1 gap-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="group flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/20 hover:border-primary/30 transition-all cursor-default"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                {type === 'color' && (
                  <div
                    className="h-5 w-5 rounded-md border border-border/50 shrink-0 shadow-sm"
                    style={{ backgroundColor: item }}
                  />
                )}
                <span className="text-xs font-mono truncate">{item}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopy(item)}
              >
                {copied === item ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full bg-card border-l border-border/40 overflow-y-auto", className)}>
      <div className="p-3 border-b border-border/40 flex items-center gap-2">
        <Settings2 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Properties</h3>
      </div>

      <div className="p-4">
        {tokens ? (
          <>
            {renderSection('Colors', <Palette className="h-3.5 w-3.5" />, tokens.colors || [], 'color')}
            {renderSection('Fonts', <Type className="h-3.5 w-3.5" />, tokens.fonts || [], 'text')}
            {renderSection('Sizes', <Box className="h-3.5 w-3.5" />, tokens.fontSizes || [], 'text')}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground p-4 text-center italic mt-10">
            Select a variant to see design tokens
          </div>
        )}
      </div>
    </div>
  );
}
