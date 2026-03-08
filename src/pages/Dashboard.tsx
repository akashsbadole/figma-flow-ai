import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wand2, LayoutGrid, Palette, FolderOpen, Plus, Zap, Crown, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [recentDesigns, setRecentDesigns] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [projectsRes, designsRes] = await Promise.all([
        supabase.from("projects").select("*").order("updated_at", { ascending: false }).limit(6),
        supabase.from("designs").select("*").order("created_at", { ascending: false }).limit(4),
      ]);
      setProjects(projectsRes.data || []);
      setRecentDesigns(designsRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const tools = [
    {
      title: "AI Generator",
      description: "Generate designs from text prompts using AI",
      icon: Wand2,
      path: "/generator",
      gradient: "gradient-primary",
    },
    {
      title: "Template Gallery",
      description: "Browse and download pre-made UI templates",
      icon: LayoutGrid,
      path: "/templates",
      gradient: "gradient-accent",
    },
    {
      title: "Design System",
      description: "Build color palettes, typography & tokens with AI",
      icon: Palette,
      path: "/design-system",
      gradient: "gradient-warm",
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user?.user_metadata?.display_name ? `, ${user.user_metadata.display_name}` : ""}
          </h1>
          <p className="text-muted-foreground">What would you like to create today?</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className="cursor-pointer hover:shadow-elevated transition-all duration-300 group border-border/50"
                onClick={() => navigate(tool.path)}
              >
                <CardHeader>
                  <div className={`h-10 w-10 rounded-xl ${tool.gradient} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Projects */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/generator")}>
              <Plus className="h-4 w-4 mr-1" /> New Project
            </Button>
          </div>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2 mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FolderOpen className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-sm">No projects yet. Create your first design!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-card transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {project.type} · {new Date(project.updated_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Designs */}
        {recentDesigns.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Designs</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {recentDesigns.map((design) => (
                <Card key={design.id} className="overflow-hidden hover:shadow-card transition-shadow">
                  {design.image_url && (
                    <div className="aspect-video bg-muted">
                      <img src={design.image_url} alt={design.prompt} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-3">
                    <p className="text-sm truncate text-muted-foreground">{design.prompt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
