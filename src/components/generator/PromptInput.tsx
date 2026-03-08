import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smartphone, Tablet, Monitor, Sparkles, Loader2, Image, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  onGenerate: (prompt: string, deviceType: string, referenceImage?: string) => void;
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
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (prompt.trim() && !generating) {
      onGenerate(prompt.trim(), deviceType, referenceImage || undefined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB limit

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setReferenceImage(base64);
      setReferencePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setReferenceImage(null);
    setReferencePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="relative rounded-2xl bg-card border border-border/50 shadow-elevated overflow-hidden">
        {/* Reference image preview */}
        {referencePreview && (
          <div className="px-5 pt-4 pb-0">
            <div className="relative inline-block">
              <img
                src={referencePreview}
                alt="Reference"
                className="h-20 rounded-lg border border-border/50 object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:scale-110 transition-transform"
              >
                <X className="h-3 w-3" />
              </button>
              <span className="absolute bottom-1 left-1 text-[10px] bg-foreground/70 text-background px-1.5 py-0.5 rounded">
                Reference
              </span>
            </div>
          </div>
        )}

        <Textarea
          placeholder={referenceImage ? "Describe what to create based on this reference..." : "Describe your design..."}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border-0 bg-transparent resize-none text-base min-h-[100px] p-5 pb-14 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
        />

        {/* Bottom toolbar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 border-t border-border/30">
          <div className="flex items-center gap-1">
            {/* Image attachment */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", referenceImage ? "text-primary" : "text-muted-foreground")}
              onClick={() => fileInputRef.current?.click()}
              title="Attach reference image"
            >
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
