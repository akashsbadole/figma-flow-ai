import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smartphone, Tablet, Monitor, Sparkles, Loader2, Image, X, Wand2, Settings2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/integrations/neon/client";
import { useToast } from "@/hooks/use-toast";

interface PromptInputProps {
  onGenerate: (prompt: string, deviceType: string, referenceImage?: string, category?: string) => void;
  generating: boolean;
}

const categories = [
  { id: "UI_DESIGN", label: "UI Design", icon: Monitor },
  { id: "SYSTEM_DESIGN", label: "System Design", icon: Wand2 },
];

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
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("UI_DESIGN");
  const [deviceType, setDeviceType] = useState("mobile");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [parameters, setParameters] = useState<Array<{ label: string; value: string; type: string }>>([]);
  const [editingParam, setEditingParam] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEnhance = async () => {
    if (!prompt.trim() || enhancing) return;
    setEnhancing(true);
    try {
      const result = await api.enhancePrompt(prompt);
      setPrompt(result.enhancedPrompt);
      setParameters(result.parameters);
      toast({ title: "Prompt enhanced!", description: "AI has refined your request and identified key parameters." });
    } catch (err: any) {
      toast({ title: "Enhancement failed", description: err.message, variant: "destructive" });
    } finally {
      setEnhancing(false);
    }
  };

  const handleSubmit = () => {
    if (prompt.trim() && !generating) {
      // We could append parameters to prompt if we wanted them to be explicitly used
      const finalPrompt = parameters.length > 0
        ? `${prompt}\n\nParameters: ${parameters.map(p => `${p.label}: ${p.value}`).join(", ")}`
        : prompt;
      onGenerate(finalPrompt.trim(), deviceType, referenceImage || undefined, category);
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

        {/* Parameters display */}
        {parameters.length > 0 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {parameters.map((param, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all border",
                  editingParam === idx
                    ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
                    : "bg-muted/50 border-border/40"
                )}
              >
                <Settings2 className="h-3 w-3 text-muted-foreground" />
                <span className="text-[11px] font-medium text-muted-foreground">{param.label}:</span>

                {editingParam === idx ? (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      className="text-[11px] font-medium bg-transparent border-0 p-0 focus:ring-0 w-20 text-foreground"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const newParams = [...parameters];
                          newParams[idx].value = editValue;
                          setParameters(newParams);
                          setEditingParam(null);
                        } else if (e.key === "Escape") {
                          setEditingParam(null);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const newParams = [...parameters];
                        newParams[idx].value = editValue;
                        setParameters(newParams);
                        setEditingParam(null);
                      }}
                      className="text-primary hover:scale-110"
                    >
                      <Check className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingParam(idx);
                      setEditValue(param.value);
                    }}
                    className="text-[11px] font-medium text-foreground hover:text-primary transition-colors cursor-text"
                  >
                    {param.value}
                  </button>
                )}

                <button
                  onClick={() => setParameters(p => p.filter((_, i) => i !== idx))}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

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

            <Button
              variant="ghost"
              size="sm"
              onClick={handleEnhance}
              disabled={!prompt.trim() || enhancing}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2"
              title="AI Prompt Enhancement"
            >
              {enhancing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">Enhance</span>
            </Button>

          {/* Category selector */}
          <div className="flex items-center bg-muted rounded-lg p-0.5 ml-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  category === c.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <c.icon className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{c.label}</span>
              </button>
            ))}
          </div>

            {/* Device selector */}
          <div className="flex items-center bg-muted rounded-lg p-0.5 ml-2">
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
            aria-label="Generate design"
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
