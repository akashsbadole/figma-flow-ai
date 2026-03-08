import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smartphone, Tablet, Monitor, Sparkles, Loader2, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  onGenerate: (prompt: string, deviceType: string) => void;
  generating: boolean;
}

const devices = [
  { id: "mobile", label: "App", icon: Smartphone },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "desktop", label: "Web", icon: Monitor },
];

const examples = [
  "Indoor plant care dashboard with watering schedules",
  "Recipe sharing app with cooking instructions",
  "Personal finance tracker with budget charts",
  "Music streaming app with playlist management",
  "Travel booking app with destination explorer",
];

export function PromptInput({ onGenerate, generating }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [deviceType, setDeviceType] = useState("mobile");

  const handleSubmit = () => {
    if (prompt.trim() && !generating) {
      onGenerate(prompt.trim(), deviceType);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Main input card */}
      <div className="relative rounded-2xl bg-card border border-border/50 shadow-elevated overflow-hidden">
        <Textarea
          placeholder="Describe your design..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border-0 bg-transparent resize-none text-base min-h-[100px] p-5 pb-14 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
        />

        {/* Bottom toolbar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 border-t border-border/30">
          <div className="flex items-center gap-1">
            {/* Attachment button placeholder */}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled>
              <Image className="h-4 w-4" />
            </Button>

            {/* Device selector */}
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              {devices.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDeviceType(d.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    deviceType === d.id
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <d.icon className="h-3.5 w-3.5" />
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || generating}
            size="sm"
            className="gradient-primary text-primary-foreground rounded-lg px-4"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Example prompts */}
      {!generating && (
        <div className="flex flex-wrap gap-2 justify-center">
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="text-xs px-3 py-1.5 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
