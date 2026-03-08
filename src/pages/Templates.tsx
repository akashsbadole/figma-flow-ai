import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { LayoutGrid, Search, Heart, Download, Code, Eye, X, Copy, Check } from "lucide-react";

const categories = ["All", "Landing Pages", "Dashboards", "Forms", "Cards", "Navigation", "E-commerce"];

// Sample templates (these would come from DB)
const sampleTemplates = [
  {
    id: "1", name: "Hero Section", description: "Modern hero with gradient background", category: "Landing Pages",
    thumbnail_url: "", tags: ["hero", "gradient", "modern"],
    html_code: `<section class="hero">\n  <div class="container">\n    <h1>Build Something Amazing</h1>\n    <p>Create stunning web experiences with our platform</p>\n    <button class="cta-btn">Get Started</button>\n  </div>\n</section>`,
    css_code: `.hero { min-height: 80vh; display: flex; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }\n.container { max-width: 800px; margin: 0 auto; text-align: center; padding: 2rem; }\nh1 { font-size: 3.5rem; font-weight: 700; margin-bottom: 1rem; }\np { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; }\n.cta-btn { padding: 1rem 2.5rem; font-size: 1.1rem; border: none; border-radius: 8px; background: white; color: #667eea; font-weight: 600; cursor: pointer; }`,
    is_premium: false,
  },
  {
    id: "2", name: "Pricing Cards", description: "Three-tier pricing layout", category: "Cards",
    thumbnail_url: "", tags: ["pricing", "cards", "business"],
    html_code: `<div class="pricing-grid">\n  <div class="plan"><h3>Starter</h3><div class="price">$9/mo</div><ul><li>5 Projects</li><li>Basic Support</li></ul><button>Choose</button></div>\n  <div class="plan featured"><h3>Pro</h3><div class="price">$29/mo</div><ul><li>Unlimited Projects</li><li>Priority Support</li></ul><button>Choose</button></div>\n  <div class="plan"><h3>Enterprise</h3><div class="price">$99/mo</div><ul><li>Custom Solutions</li><li>Dedicated Support</li></ul><button>Choose</button></div>\n</div>`,
    css_code: `.pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; max-width: 900px; margin: 0 auto; padding: 2rem; }\n.plan { border: 1px solid #e5e7eb; border-radius: 12px; padding: 2rem; text-align: center; }\n.plan.featured { border-color: #667eea; box-shadow: 0 4px 20px rgba(102,126,234,0.15); }\n.price { font-size: 2rem; font-weight: 700; margin: 1rem 0; }\nbutton { width: 100%; padding: 0.75rem; border: none; border-radius: 8px; background: #667eea; color: white; font-weight: 600; cursor: pointer; }`,
    is_premium: false,
  },
  {
    id: "3", name: "Dashboard Stats", description: "Stats cards with charts area", category: "Dashboards",
    thumbnail_url: "", tags: ["dashboard", "stats", "analytics"],
    html_code: `<div class="stats-grid">\n  <div class="stat-card"><div class="stat-label">Revenue</div><div class="stat-value">$45,231</div><div class="stat-change positive">+20.1%</div></div>\n  <div class="stat-card"><div class="stat-label">Users</div><div class="stat-value">2,350</div><div class="stat-change positive">+12.5%</div></div>\n  <div class="stat-card"><div class="stat-label">Orders</div><div class="stat-value">1,230</div><div class="stat-change negative">-3.2%</div></div>\n  <div class="stat-card"><div class="stat-label">Conversion</div><div class="stat-value">3.2%</div><div class="stat-change positive">+1.1%</div></div>\n</div>`,
    css_code: `.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; padding: 2rem; }\n.stat-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; }\n.stat-label { font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem; }\n.stat-value { font-size: 1.875rem; font-weight: 700; }\n.stat-change { font-size: 0.75rem; margin-top: 0.5rem; }\n.positive { color: #10b981; }\n.negative { color: #ef4444; }`,
    is_premium: false,
  },
  {
    id: "4", name: "Contact Form", description: "Clean contact form with validation", category: "Forms",
    thumbnail_url: "", tags: ["form", "contact", "clean"],
    html_code: `<div class="form-container">\n  <h2>Get in Touch</h2>\n  <form>\n    <div class="form-group"><label>Name</label><input type="text" placeholder="Your name" /></div>\n    <div class="form-group"><label>Email</label><input type="email" placeholder="you@example.com" /></div>\n    <div class="form-group"><label>Message</label><textarea placeholder="Your message..." rows="4"></textarea></div>\n    <button type="submit">Send Message</button>\n  </form>\n</div>`,
    css_code: `.form-container { max-width: 500px; margin: 0 auto; padding: 2rem; }\nh2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; }\n.form-group { margin-bottom: 1rem; }\nlabel { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }\ninput, textarea { width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 1rem; }\nbutton { width: 100%; padding: 0.75rem; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 0.5rem; }`,
    is_premium: false,
  },
  {
    id: "5", name: "Navigation Bar", description: "Responsive nav with dropdown", category: "Navigation",
    thumbnail_url: "", tags: ["navbar", "responsive", "dropdown"],
    html_code: `<nav class="navbar">\n  <div class="nav-brand">Brand</div>\n  <div class="nav-links">\n    <a href="#">Home</a>\n    <a href="#">Features</a>\n    <a href="#">Pricing</a>\n    <a href="#">About</a>\n  </div>\n  <button class="nav-cta">Sign Up</button>\n</nav>`,
    css_code: `.navbar { display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; background: white; border-bottom: 1px solid #e5e7eb; }\n.nav-brand { font-size: 1.25rem; font-weight: 700; color: #667eea; }\n.nav-links { display: flex; gap: 2rem; }\n.nav-links a { text-decoration: none; color: #4b5563; font-weight: 500; }\n.nav-links a:hover { color: #667eea; }\n.nav-cta { padding: 0.5rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }`,
    is_premium: false,
  },
  {
    id: "6", name: "Product Card Grid", description: "E-commerce product cards", category: "E-commerce",
    thumbnail_url: "", tags: ["product", "ecommerce", "grid"],
    html_code: `<div class="product-grid">\n  <div class="product-card"><div class="product-image"></div><div class="product-info"><h3>Product Name</h3><p class="product-price">$49.99</p><button>Add to Cart</button></div></div>\n  <div class="product-card"><div class="product-image"></div><div class="product-info"><h3>Product Name</h3><p class="product-price">$39.99</p><button>Add to Cart</button></div></div>\n  <div class="product-card"><div class="product-image"></div><div class="product-info"><h3>Product Name</h3><p class="product-price">$59.99</p><button>Add to Cart</button></div></div>\n</div>`,
    css_code: `.product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; padding: 2rem; }\n.product-card { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }\n.product-image { height: 200px; background: linear-gradient(135deg, #f3f4f6, #e5e7eb); }\n.product-info { padding: 1rem; }\nh3 { font-weight: 600; margin-bottom: 0.5rem; }\n.product-price { font-size: 1.25rem; font-weight: 700; color: #667eea; margin-bottom: 1rem; }\nbutton { width: 100%; padding: 0.75rem; background: #111827; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }`,
    is_premium: false,
  },
];

const Templates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [previewTemplate, setPreviewTemplate] = useState<typeof sampleTemplates[0] | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const filtered = sampleTemplates.filter((t) => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag => tag.includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const downloadTemplate = (template: typeof sampleTemplates[0], format: "html" | "code") => {
    const content = format === "html"
      ? `<!DOCTYPE html>\n<html>\n<head>\n<style>\n${template.css_code}\n</style>\n</head>\n<body>\n${template.html_code}\n</body>\n</html>`
      : `/* HTML */\n${template.html_code}\n\n/* CSS */\n${template.css_code}`;
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.name.toLowerCase().replace(/\s+/g, "-")}.${format === "html" ? "html" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: `${template.name} downloaded as ${format.toUpperCase()}` });
  };

  const copyToFigma = async (template: typeof sampleTemplates[0]) => {
    const html = `<style>${template.css_code}</style>${template.html_code}`;
    try {
      const htmlBlob = new Blob([html], { type: "text/html" });
      const textBlob = new Blob([html], { type: "text/plain" });
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob }),
      ]);
      toast({ title: "Copied for Figma!", description: "Paste directly into Figma" });
    } catch {
      await navigator.clipboard.writeText(html);
      toast({ title: "Copied as HTML" });
    }
  };

  const toggleSave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutGrid className="h-8 w-8 text-accent" />
            Template Gallery
          </h1>
          <p className="text-muted-foreground mt-1">Browse and download pre-made UI templates</p>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? "gradient-primary text-primary-foreground" : ""}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-elevated transition-all duration-300 group border-border/50">
                {/* Preview */}
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <iframe
                    srcDoc={`<style>body{margin:0;transform:scale(0.5);transform-origin:0 0;width:200%;height:200%;}${template.css_code}</style>${template.html_code}`}
                    className="w-full h-full pointer-events-none"
                    title={template.name}
                    sandbox=""
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button size="sm" variant="secondary" onClick={() => setPreviewTemplate(template)}>
                      <Eye className="h-4 w-4 mr-1" /> Preview
                    </Button>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <button onClick={() => toggleSave(template.id)} className="text-muted-foreground hover:text-primary transition-colors">
                      <Heart className={`h-4 w-4 ${savedIds.has(template.id) ? "fill-primary text-primary" : ""}`} />
                    </button>
                  </div>
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => copyToFigma(template)}>
                      <Copy className="h-3 w-3 mr-1" /> Figma
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => downloadTemplate(template, "html")}>
                      <Download className="h-3 w-3 mr-1" /> HTML
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => downloadTemplate(template, "code")}>
                      <Code className="h-3 w-3 mr-1" /> Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Preview Dialog */}
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{previewTemplate?.name}</DialogTitle>
              <DialogDescription>{previewTemplate?.description}</DialogDescription>
            </DialogHeader>
            {previewTemplate && (
              <Tabs defaultValue="preview">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="css">CSS</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <div className="rounded-lg overflow-hidden border border-border">
                    <iframe
                      srcDoc={`<style>${previewTemplate.css_code}</style>${previewTemplate.html_code}`}
                      className="w-full h-[500px]"
                      title="Template preview"
                      sandbox="allow-scripts"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="html" className="mt-4">
                  <pre className="rounded-lg bg-muted p-4 overflow-auto text-sm font-mono max-h-[400px]"><code>{previewTemplate.html_code}</code></pre>
                </TabsContent>
                <TabsContent value="css" className="mt-4">
                  <pre className="rounded-lg bg-muted p-4 overflow-auto text-sm font-mono max-h-[400px]"><code>{previewTemplate.css_code}</code></pre>
                </TabsContent>
              </Tabs>
            )}
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => previewTemplate && copyToFigma(previewTemplate)}>
                <Copy className="h-4 w-4 mr-1" /> Copy for Figma
              </Button>
              <Button variant="outline" onClick={() => previewTemplate && downloadTemplate(previewTemplate, "html")}>
                <Download className="h-4 w-4 mr-1" /> Download HTML
              </Button>
              <Button variant="outline" onClick={() => previewTemplate && downloadTemplate(previewTemplate, "code")}>
                <Code className="h-4 w-4 mr-1" /> Download Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Templates;
