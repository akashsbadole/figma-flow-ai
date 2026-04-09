import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/integrations/neon/client";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Palette, LayoutTemplate, PackageOpen, Folder } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { PromptInput } from "@/components/generator/PromptInput";
import { VariantCard } from "@/components/generator/VariantCard";
import { ExpandedPreview } from "@/components/generator/ExpandedPreview";
import { DesignSystemPreview } from "@/components/generator/DesignSystemPreview";
import { TemplatesPreview } from "@/components/generator/TemplatesPreview";
import { useGenerationLimit } from "@/hooks/useGenerationLimit";
import { exportVariantsAsZip } from "@/lib/export-utils";

interface Variant {
  id: string;
  name: string;
  html: string;
  css: string;
  svg?: string;
  metadata?: {
    extractedTokens?: {
      colors: string[];
      fonts: string[];
      fontSizes: string[];
    };
  };
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
  const { checkAndIncrement } = useGenerationLimit();
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [expandedVariant, setExpandedVariant] = useState<Variant | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const [designSystem, setDesignSystem] = useState<any>(null);
  const [dsLoading, setDsLoading] = useState(false);
  const [dsError, setDsError] = useState<string | null>(null);

  const [screens, setScreens] = useState<TemplateItem[]>([]);
  const [components, setComponents] = useState<TemplateItem[]>([]);
  const [pageLayouts, setPageLayouts] = useState<TemplateItem[]>([]);
  const [formPatterns, setFormPatterns] = useState<TemplateItem[]>([]);
  const [dataDisplay, setDataDisplay] = useState<TemplateItem[]>([]);
  const [navigationPatterns, setNavigationPatterns] = useState<TemplateItem[]>([]);
  const [tplLoading, setTplLoading] = useState(false);
  const [tplError, setTplError] = useState<string | null>(null);

  const handleGenerate = async (prompt: string, deviceType: string, referenceImage?: string, category?: string) => {
    if (!user) return;
    const allowed = await checkAndIncrement();
    if (!allowed) return;
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
      setDsLoading(true);
      setTplLoading(true);

      const finalPrompt = category === "SYSTEM_DESIGN"
        ? `SYSTEM DESIGN & ARCHITECTURE DIAGRAM: ${prompt}. Focus on service boxes, database cylinders, and labeled arrows showing data flow.`
        : prompt;

      const data = await api.generateFullDesign({ prompt: finalPrompt, deviceType, variantCount: 4, referenceImage });

      if (data.variants?.length > 0) {
        const resultData = {
          variants: data.variants,
          deviceType: (deviceType as any) || "desktop",
          deviceWidth: data.deviceInfo?.width || 1440,
          deviceHeight: data.deviceInfo?.height || 900,
          deviceLabel: data.deviceInfo?.label || "Web",
        };

        setResult(resultData);
        setSelectedVariant(data.variants[0].id);

        // Background saving
        api.createDesign({
          project_id: selectedProjectId || undefined,
          prompt,
          html_code: data.variants[0].html,
          css_code: data.variants[0].css,
          svg_code: data.variants[0].svg,
          metadata: {
            deviceType,
            variantCount: data.variants.length,
            referenceImage: referenceImage ? true : false,
            extractedTokens: data.variants[0].metadata?.extractedTokens
          }
        }).catch(console.error);

        api.createGenerationHistory({
          type: "full-generation",
          prompt,
          result: {
            variantCount: data.variants.length,
            hasDesignSystem: !!data.designSystem,
            templateCount: Object.keys(data.templates || {}).length
          },
        }).catch(console.error);
      }

      if (data.designSystem) {
        setDesignSystem(data.designSystem);
        if (selectedProjectId) {
          api.createDesignSystem({
            project_id: selectedProjectId,
            name: data.designSystem.name || `${currentPrompt} System`,
            colors: data.designSystem.colors,
            typography: data.designSystem.typography,
            spacing: data.designSystem.spacing,
            components: data.designSystem.components,
          }).catch(console.error);
        }
      }

      if (data.templates) {
        setScreens(data.templates.screens || []);
        setComponents(data.templates.components || []);
        setPageLayouts(data.templates.layouts || []);
        setFormPatterns(data.templates.formPatterns || []);
        setDataDisplay(data.templates.dataDisplay || []);
        setNavigationPatterns(data.templates.navigationPatterns || []);
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
      const data = await api.generateDesign({
        prompt: followUp,
        deviceType: result?.deviceType || "mobile",
        variantCount: 1,
      });
      if (data.error) throw new Error(data.error);
      const v = data.variants?.[0];
      if (!v) throw new Error("No result returned");
      if (user) {
        await api.createDesign({
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

  const handleBulkExport = async () => {
    if (!result?.variants.length) return;
    try {
      const projectName = currentPrompt.slice(0, 40).replace(/[^a-zA-Z0-9\s-]/g, "").trim().replace(/\s+/g, "-") || "designs";
      const blob = await exportVariantsAsZip(result.variants, projectName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "ZIP downloaded!", description: `${result.variants.length} variants exported` });
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    }
  };

  const anyLoading = generating || dsLoading || tplLoading;
  const hasResults = result || designSystem || screens.length > 0 || components.length > 0;

  const { data: projects } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: () => api.getProjects(),
    enabled: !!user,
  });

  return (
    <AppLayout>
      <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-muted/30">
        {!hasResults && !anyLoading && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 gap-6 md:gap-10">
            {/* Project Selector - Desktop */}
            <div className="absolute top-20 right-4 w-64 z-10 hidden md:block">
              <Select
                value={selectedProjectId || "none"}
                onValueChange={(val) => setSelectedProjectId(val === "none" ? null : val)}
              >
                <SelectTrigger className="w-full bg-card/80 backdrop-blur border-border/50">
                  <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Hero Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Design Generation
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Design at the speed of AI
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto">
                Generate beautiful UI variants, complete design systems, and reusable templates — all from a simple text prompt.
              </p>
            </motion.div>

            {/* Prompt Input */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full">
              <PromptInput onGenerate={handleGenerate} generating={generating} />
            </motion.div>
          </div>
        )}

        {anyLoading && !result && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 animate-ping opacity-20"></div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">Generating{currentPrompt ? ` "${currentPrompt.slice(0, 30)}..."` : ""}</p>
              <p className="text-sm text-muted-foreground">Creating variants, design system & templates</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {hasResults && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border/50 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <PromptInput onGenerate={handleGenerate} generating={generating} />
              </div>
              <div className="w-full md:w-64">
                <Select
                  value={selectedProjectId || "none"}
                  onValueChange={(val) => setSelectedProjectId(val === "none" ? null : val)}
                >
                  <SelectTrigger className="w-full bg-card/50 border-border/50">
                    <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Project</SelectItem>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  <>
                    <div className="flex justify-end mb-4 max-w-7xl mx-auto">
                      <Button variant="outline" size="sm" onClick={handleBulkExport}>
                        <PackageOpen className="h-4 w-4 mr-1" /> Export All as ZIP
                      </Button>
                    </div>
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
                  </>
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
