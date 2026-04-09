import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/integrations/neon/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Wand2, LayoutGrid, Palette, Plus, Zap, Crown, 
  TrendingUp, Sparkles, ArrowRight, Clock, Folder,
  Play, BarChart3, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<{ id: string; name: string; type: string; updated_at: string }[]>([]);
  const [recentDesigns, setRecentDesigns] = useState<{ id: string; prompt: string; image_url?: string; created_at?: string }[]>([]);
  const [subscription, setSubscription] = useState<{ plan: string; status: string; generations_used: number; generations_limit?: number } | null>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [projectsRes, designsRes, subRes, histRes] = await Promise.all([
          api.getProjects(),
          api.getDesigns(),
          api.getSubscription(),
          api.getGenerationHistory(),
        ]);
        setProjects(Array.isArray(projectsRes) ? projectsRes : []);
        setRecentDesigns(Array.isArray(designsRes) ? designsRes.slice(0, 6) : []);
        setSubscription((subRes && (subRes as any).error) ? null : subRes);
        setHistoryCount(Array.isArray(histRes) ? histRes.length : 0);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const tools = [
    {
      title: "AI Generator",
      description: "Create designs from text prompts",
      icon: Wand2,
      path: "/generator",
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-50 dark:bg-violet-950/30",
    },
    {
      title: "Templates",
      description: "Browse pre-made UI templates",
      icon: LayoutGrid,
      path: "/templates",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "Design System",
      description: "Build design tokens with AI",
      icon: Palette,
      path: "/design-system",
      color: "from-orange-500 to-amber-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  const stats = [
    { label: "Total Designs", value: historyCount, icon: BarChart3, color: "text-violet-600" },
    { label: "Projects", value: projects.length, icon: Folder, color: "text-emerald-600" },
    { label: "This Month", value: recentDesigns.length, icon: Clock, color: "text-orange-600" },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-muted/30">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 lg:p-10 text-white shadow-lg"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-white/80" />
                <span className="text-white/80 font-medium">AI Design Studio</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                Welcome back{user?.display_name ? `, ${user.display_name}` : ""} 👋
              </h1>
              <p className="text-white/70 text-lg max-w-xl">
                Ready to create something amazing? Your AI-powered design assistant is here.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate("/generator")}
                className="bg-white/15 border-white/20 text-white hover:bg-white/25 backdrop-blur"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Start Creating
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{loading ? "..." : stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${stat.color.replace('text-', 'bg-')}/10`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Subscription Card */}
        {subscription && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-violet-100 dark:border-violet-800/30"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/40">
                  {subscription.plan === 'pro' ? (
                    <Crown className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  ) : (
                    <Zap className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-xl font-semibold capitalize flex items-center gap-2">
                    {subscription.plan}
                    {subscription.plan === 'pro' && (
                      <span className="text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full">
                        PRO
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Generations Used</p>
                  <p className="text-xl font-semibold">
                    {subscription.generations_used}
                    {subscription.plan === 'free' && (
                      <span className="text-muted-foreground text-sm font-normal"> / {subscription.generations_limit}</span>
                    )}
                  </p>
                </div>
                {subscription.plan === 'free' && (
                  <Button 
                    size="sm"
                    onClick={() => navigate("/pricing")}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div
                  className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800"
                  onClick={() => navigate(tool.path)}
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${tool.bgColor}`} />
                  <div className="relative z-10">
                    <div className={`inline-flex p-2.5 rounded-lg mb-4 bg-gradient-to-br ${tool.color}`}>
                      <tool.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                  <ArrowRight className="absolute bottom-5 right-5 h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Projects</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/generator")}
              className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Project
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl p-5 border border-border/50 animate-pulse">
                  <div className="h-5 bg-muted rounded w-3/4 mb-3" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-card rounded-xl p-10 border border-dashed border-border text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Folder className="h-7 w-7 text-violet-500" />
              </div>
              <h3 className="font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">Create your first project to get started</p>
              <Button 
                onClick={() => navigate("/generator")}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 6).map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="bg-card rounded-xl p-5 border border-border/50 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all cursor-pointer group"
                  onClick={() => navigate("/generator")}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate group-hover:text-violet-600 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 capitalize">
                        {project.type}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 transition-colors">
                      <Play className="h-4 w-4 text-muted-foreground group-hover:text-violet-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Designs */}
        {recentDesigns.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Designs</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentDesigns.map((design, i) => (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer"
                  onClick={() => navigate("/history")}
                >
                  {design.image_url ? (
                    <img 
                      src={design.image_url} 
                      alt={design.prompt} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Wand2 className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate">{design.prompt}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;