import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Image, Palette, LayoutGrid, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

const features = [
  {
    icon: Wand2,
    title: "AI Design Generator",
    description: "Generate multiple UI variants from a single text prompt. Get 4 unique designs instantly.",
  },
  {
    icon: Image,
    title: "Image to Code",
    description: "Upload a screenshot or mockup and get production-ready HTML, CSS, React & Tailwind code.",
  },
  {
    icon: Palette,
    title: "Design System Builder",
    description: "Generate complete design systems with colors, typography, spacing, and component specs.",
  },
  {
    icon: LayoutGrid,
    title: "Template Gallery",
    description: "Browse curated UI templates. Download as HTML, copy for Figma, or grab the code.",
  },
];

const benefits = [
  "Generate 4 design variants at once",
  "Export to HTML, CSS, React, Tailwind",
  "Full design system with tokens",
  "Figma-ready exports",
  "Dark mode support",
  "Image-to-code conversion",
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">AI Design Studio</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button className="gradient-primary text-primary-foreground" onClick={() => navigate("/auth")}>
              Get Started Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-3.5 w-3.5" />
              AI-Powered Design Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Design at the
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                speed of AI
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Generate UI designs, complete design systems, and production-ready code — all from a simple text prompt.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="gradient-primary text-primary-foreground text-lg px-8 h-12"
                onClick={() => navigate("/auth")}
              >
                Start Creating Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-12" onClick={() => navigate("/auth")}>
                View Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need to design faster
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From text prompts to production code in seconds. No design experience required.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:shadow-elevated transition-all duration-300"
              >
                <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">
                Built for designers & developers
              </h2>
              <p className="text-muted-foreground mb-8">
                Whether you're prototyping a new app or building a full design system, AI Design Studio gives you the tools to move fast.
              </p>
              <div className="grid gap-3">
                {benefits.map((b) => (
                  <div key={b} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                    <span className="text-sm">{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl gradient-primary opacity-10 absolute inset-0" />
              <div className="relative bg-card border border-border/50 rounded-2xl p-8 shadow-elevated">
                <div className="space-y-4">
                  <div className="h-3 rounded bg-primary/20 w-3/4" />
                  <div className="h-3 rounded bg-muted w-full" />
                  <div className="h-3 rounded bg-muted w-5/6" />
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="h-20 rounded-lg bg-primary/10" />
                    <div className="h-20 rounded-lg bg-accent/10" />
                    <div className="h-20 rounded-lg bg-accent/10" />
                    <div className="h-20 rounded-lg bg-primary/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl gradient-primary p-12 shadow-glow">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to start designing?</h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">
              5 free generations. No credit card required.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 h-12"
              onClick={() => navigate("/auth")}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI Design Studio</span>
          </div>
          <p>© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
