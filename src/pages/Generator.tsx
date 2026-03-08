import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";
import { PromptInput } from "@/components/generator/PromptInput";
import { VariantCard } from "@/components/generator/VariantCard";
import { ExpandedPreview } from "@/components/generator/ExpandedPreview";

interface Variant {
  id: string;
  name: string;
  html: string;
  css: string;
}

interface GenerationResult {
  variants: Variant[];
  deviceType: "mobile" | "tablet" | "desktop";
  deviceWidth: number;
  deviceHeight: number;
  deviceLabel: string;
}

const Generator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [expandedVariant, setExpandedVariant] = useState<Variant | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");

  const handleGenerate = async (prompt: string, deviceType: string) => {
    if (!user) return;
    setGenerating(true);
    setResult(null);
    setSelectedVariant(null);
    setCurrentPrompt(prompt);

    try {
      const { data, error } = await supabase.functions.invoke("generate-design", {
        body: { prompt, deviceType, variantCount: 4 },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResult(data);
      if (data.variants?.length > 0) {
        setSelectedVariant(data.variants[0].id);
      }

      // Save first variant to designs table
      if (data.variants?.length > 0) {
        const first = data.variants[0];
        await supabase.from("designs").insert({
          user_id: user.id,
          prompt,
          html_code: first.html,
          css_code: first.css,
        });
      }

      toast({ title: "Designs generated!", description: `${data.variants?.length || 0} variants created` });
    } catch (error: any) {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Header area with prompt - Stitch style */}
        {!result && !generating && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-3"
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Design at the speed of AI
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Transform ideas into UI designs for mobile and web applications
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full"
            >
              <PromptInput onGenerate={handleGenerate} generating={generating} />
            </motion.div>
          </div>
        )}

        {/* Generating state */}
        {generating && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center animate-pulse shadow-glow">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <p className="text-muted-foreground">Generating {currentPrompt ? `"${currentPrompt}"` : "designs"}...</p>
            <p className="text-xs text-muted-foreground/60">Creating 4 unique variants</p>
          </div>
        )}

        {/* Results - variant grid */}
        {result && !generating && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top bar with prompt re-entry */}
            <div className="p-4 border-b border-border/50 flex items-center gap-4">
              <div className="flex-1">
                <PromptInput onGenerate={handleGenerate} generating={generating} />
              </div>
            </div>

            {/* Variant grid */}
            <div className="flex-1 overflow-auto p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto"
              >
                {result.variants.map((variant, i) => (
                  <motion.div
                    key={variant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <VariantCard
                      variant={variant}
                      deviceType={result.deviceType}
                      deviceWidth={result.deviceWidth}
                      deviceHeight={result.deviceHeight}
                      isSelected={selectedVariant === variant.id}
                      onSelect={() => setSelectedVariant(variant.id)}
                      onExpand={() => setExpandedVariant(variant)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        )}

        {/* Expanded preview overlay */}
        <AnimatePresence>
          {expandedVariant && result && (
            <ExpandedPreview
              variant={expandedVariant}
              deviceType={result.deviceType}
              deviceWidth={result.deviceWidth}
              deviceHeight={result.deviceHeight}
              onClose={() => setExpandedVariant(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default Generator;
