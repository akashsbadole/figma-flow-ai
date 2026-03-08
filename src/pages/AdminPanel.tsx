import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Shield, Users, Ban, CheckCircle, Search, Loader2, Crown, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_enabled: boolean;
  created_at: string;
}

interface UserSubscription {
  user_id: string;
  plan: string;
  status: string;
  generations_used: number;
  generations_limit: number;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<(UserProfile & { subscription?: UserSubscription })[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (data) {
      setIsAdmin(true);
      loadUsers();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load users", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data: subs } = await supabase
      .from("user_subscriptions")
      .select("*");

    const subsMap = new Map((subs as any[] || []).map((s: any) => [s.user_id, s]));
    const enriched = (profiles as any[] || []).map((p: any) => ({
      ...p,
      subscription: subsMap.get(p.user_id),
    }));

    setUsers(enriched);
    setLoading(false);
  };

  const toggleUserStatus = async (userId: string, currentEnabled: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_enabled: !currentEnabled })
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Failed to update", variant: "destructive" });
    } else {
      setUsers((prev) => prev.map((u) => u.user_id === userId ? { ...u, is_enabled: !currentEnabled } : u));
      toast({ title: `User ${!currentEnabled ? "enabled" : "disabled"}` });
    }
  };

  const updatePlan = async (userId: string, plan: string) => {
    const newLimit = plan === "pro" ? 999 : 5;
    const { error } = await supabase
      .from("user_subscriptions")
      .update({ plan, generations_limit: newLimit })
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Failed to update plan", variant: "destructive" });
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId
            ? { ...u, subscription: { ...u.subscription!, plan, generations_limit: newLimit } }
            : u
        )
      );
      toast({ title: `Plan updated to ${plan}` });
    }
  };

  const filtered = users.filter(
    (u) =>
      !searchQuery ||
      u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin && !loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have admin privileges.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">Manage users, plans, and account status</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-1" />
              <p className="text-2xl font-bold">{users.filter((u) => u.is_enabled).length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <Crown className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
              <p className="text-2xl font-bold">{users.filter((u) => u.subscription?.plan === "pro").length}</p>
              <p className="text-xs text-muted-foreground">Pro Users</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <Ban className="h-6 w-6 mx-auto text-destructive mb-1" />
              <p className="text-2xl font-bold">{users.filter((u) => !u.is_enabled).length}</p>
              <p className="text-xs text-muted-foreground">Disabled</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left p-3 font-medium">User</th>
                    <th className="text-left p-3 font-medium">Plan</th>
                    <th className="text-left p-3 font-medium">Usage</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Joined</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.user_id} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{u.display_name || "Unknown"}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{u.user_id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={u.subscription?.plan === "pro" ? "default" : "secondary"} className="text-xs">
                          {u.subscription?.plan === "pro" ? "Pro" : "Free"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="text-xs font-mono">
                          {u.subscription?.generations_used || 0} / {u.subscription?.generations_limit || 5}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant={u.is_enabled ? "default" : "destructive"} className="text-xs">
                          {u.is_enabled ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant={u.is_enabled ? "destructive" : "default"}
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => toggleUserStatus(u.user_id, u.is_enabled)}
                          >
                            {u.is_enabled ? <><Ban className="h-3 w-3 mr-1" /> Disable</> : <><CheckCircle className="h-3 w-3 mr-1" /> Enable</>}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => updatePlan(u.user_id, u.subscription?.plan === "pro" ? "free" : "pro")}
                          >
                            {u.subscription?.plan === "pro" ? "→ Free" : "→ Pro"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminPanel;
