import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Palette, LayoutTemplate } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PromptInput } from "@/components/generator/PromptInput";
import { VariantCard } from "@/components/generator/VariantCard";
import { ExpandedPreview } from "@/components/generator/ExpandedPreview";
import { DesignSystemPreview } from "@/components/generator/DesignSystemPreview";
import { TemplatesPreview } from "@/components/generator/TemplatesPreview";

interface Variant {
  id: string;
  name: string;
  html: string;
  css: string;
}

interface TemplateItem {
  id: string;
  name: string;
  category: string;
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

  // Design system state
  const [designSystem, setDesignSystem] = useState<any>(null);
  const [dsLoading, setDsLoading] = useState(false);
  const [dsError, setDsError] = useState<string | null>(null);

  // Templates state
  const [screens, setScreens] = useState<TemplateItem[]>([]);
  const [components, setComponents] = useState<TemplateItem[]>([]);
  const [pageLayouts, setPageLayouts] = useState<TemplateItem[]>([]);
  const [formPatterns, setFormPatterns] = useState<TemplateItem[]>([]);
  const [dataDisplay, setDataDisplay] = useState<TemplateItem[]>([]);
  const [navigationPatterns, setNavigationPatterns] = useState<TemplateItem[]>([]);
  const [tplLoading, setTplLoading] = useState(false);
  const [tplError, setTplError] = useState<string | null>(null);

  const handleGenerate = async (prompt: string, deviceType: string, referenceImage?: string) => {
    if (!user) return;
    setGenerating(true);
    setResult(null);
    setSelectedVariant(null);
    setCurrentPrompt(prompt);
    setDesignSystem(null);
    setDsError(null);
    setScreens([]);
    setComponents([]);
    setPageLayouts([]);
    setFormPatterns([]);
    setDataDisplay([]);
    setNavigationPatterns([]);
    setTplError(null);

    try {
      // Launch all 3 generations in parallel
      const [designRes, dsRes, tplRes] = await Promise.allSettled([
        supabase.functions.invoke("generate-design", {
          body: { prompt, deviceType, variantCount: 4, referenceImage },
        }),
        (async () => {
          setDsLoading(true);
          const r = await supabase.functions.invoke("generate-design-system", { body: { prompt } });
          setDsLoading(false);
          return r;
        })(),
        (async () => {
          setTplLoading(true);
          const r = await supabase.functions.invoke("generate-templates", { body: { prompt, deviceType } });
          setTplLoading(false);
          return r;
        })(),
      ]);

      // Handle variants
      if (designRes.status === "fulfilled") {
        const { data, error } = designRes.value;
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        setResult(data);
        if (data.variants?.length > 0) {
          setSelectedVariant(data.variants[0].id);
          await supabase.from("designs").insert({
            user_id: user.id,
            prompt,
            html_code: data.variants[0].html,
            css_code: data.variants[0].css,
          });
        }
      } else {
        throw designRes.reason;
      }

      // Handle design system
      if (dsRes.status === "fulfilled") {
        const { data, error } = dsRes.value;
        if (!error && data?.designSystem) {
          setDesignSystem(data.designSystem);
        } else {
          setDsError(error?.message || data?.error || "Failed to generate design system");
        }
      } else {
        setDsError("Design system generation failed");
      }

      // Handle templates
      if (tplRes.status === "fulfilled") {
        const { data, error } = tplRes.value;
        if (!error && !data?.error) {
          setScreens(data?.screens || data?.pageLayouts || []);
          setComponents(data?.components || []);
          setPageLayouts(data?.pageLayouts || []);
          setFormPatterns(data?.formPatterns || []);
          setDataDisplay(data?.dataDisplay || []);
          setNavigationPatterns(data?.navigationPatterns || []);
        }
        } else {
          setTplError(error?.message || data?.error || "Failed to generate templates");
        }
      } else {
        setTplError("Template generation failed");
      }

      toast({ title: "Generation complete!", description: "Designs, system, and templates ready" });
    } catch (error: any) {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    } finally {
      setGenerating(false);
      setDsLoading(false);
      setTplLoading(false);
    }
  };

  const handleIterate = async (followUp: string, currentHtml: string, currentCss: string): Promise<{ html: string; css: string } | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-design", {
        body: {
          prompt: followUp,
          deviceType: result?.deviceType || "mobile",
          variantCount: 1,
          iterateOn: { html: currentHtml, css: currentCss },
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      const v = data.variants?.[0];
      if (!v) throw new Error("No result returned");
      if (user) {
        await supabase.from("designs").insert({
          user_id: user.id,
          prompt: `${currentPrompt} → ${followUp}`,
          html_code: v.html,
          css_code: v.css,
        });
      }
      return { html: v.html, css: v.css };
    } catch (err: any) {
      toast({ title: "Iteration failed", description: err.message, variant: "destructive" });
      return null;
    }
  };

  const anyLoading = generating || dsLoading || tplLoading;
  const hasResults = result || designSystem || screens.length > 0 || components.length > 0;

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {!hasResults && !anyLoading && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Design at the speed of AI</h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Generate UI variants, design systems, and templates — all at once
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full">
              <PromptInput onGenerate={handleGenerate} generating={generating} />
            </motion.div>
          </div>
        )}

        {anyLoading && !result && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center animate-pulse shadow-glow">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <p className="text-muted-foreground">Generating {currentPrompt ? `"${currentPrompt}"` : "designs"}...</p>
            <p className="text-xs text-muted-foreground/60">Creating variants, design system & templates in parallel</p>
          </div>
        )}

        {hasResults && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <PromptInput onGenerate={handleGenerate} generating={generating} />
            </div>

            <Tabs defaultValue="variants" className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 pt-3 border-b border-border/50">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="variants" className="gap-1.5">
                    <Wand2 className="h-3.5 w-3.5" />
                    Variants {result ? `(${result.variants.length})` : ""}
                  </TabsTrigger>
                  <TabsTrigger value="design-system" className="gap-1.5">
                    <Palette className="h-3.5 w-3.5" />
                    Design System
                    {dsLoading && <span className="ml-1 h-2 w-2 rounded-full bg-primary animate-pulse" />}
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="gap-1.5">
                    <LayoutTemplate className="h-3.5 w-3.5" />
                    Templates
                    {tplLoading && <span className="ml-1 h-2 w-2 rounded-full bg-primary animate-pulse" />}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="variants" className="flex-1 overflow-auto p-6 mt-0">
                {result && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto"
                  >
                    {result.variants.map((variant, i) => (
                      <motion.div key={variant.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
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
                )}
              </TabsContent>

              <TabsContent value="design-system" className="flex-1 overflow-auto p-6 mt-0">
                <div className="max-w-4xl mx-auto">
                  <DesignSystemPreview data={designSystem} loading={dsLoading} error={dsError} />
                </div>
              </TabsContent>

              <TabsContent value="templates" className="flex-1 overflow-auto p-6 mt-0">
                <div className="max-w-7xl mx-auto">
                  <TemplatesPreview
                    screens={screens}
                    components={components}
                    pageLayouts={pageLayouts}
                    formPatterns={formPatterns}
                    dataDisplay={dataDisplay}
                    navigationPatterns={navigationPatterns}
                    deviceWidth={result?.deviceWidth || 390}
                    deviceHeight={result?.deviceHeight || 844}
                    loading={tplLoading}
                    error={tplError}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <AnimatePresence>
          {expandedVariant && result && (
            <ExpandedPreview
              variant={expandedVariant}
              deviceType={result.deviceType}
              deviceWidth={result.deviceWidth}
              deviceHeight={result.deviceHeight}
              onClose={() => setExpandedVariant(null)}
              onIterate={handleIterate}
            />
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default Generator;
