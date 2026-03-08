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

type UserFilter = "all" | "admin" | "pro" | "free";

const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<(UserProfile & { subscription?: UserSubscription; isAdmin?: boolean })[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());

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

    const { data: roles } = await supabase
      .from("user_roles")
      .select("*")
      .eq("role", "admin");

    const adminSet = new Set((roles as any[] || []).map((r: any) => r.user_id));
    setAdminIds(adminSet);

    const subsMap = new Map((subs as any[] || []).map((s: any) => [s.user_id, s]));
    const enriched = (profiles as any[] || []).map((p: any) => ({
      ...p,
      subscription: subsMap.get(p.user_id),
      isAdmin: adminSet.has(p.user_id),
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

  const toggleAdminRole = async (userId: string, currentlyAdmin: boolean) => {
    if (currentlyAdmin) {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");
      if (error) {
        toast({ title: "Failed to remove admin", variant: "destructive" });
        return;
      }
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" } as any);
      if (error) {
        toast({ title: "Failed to grant admin", variant: "destructive" });
        return;
      }
    }
    setAdminIds((prev) => {
      const next = new Set(prev);
      currentlyAdmin ? next.delete(userId) : next.add(userId);
      return next;
    });
    setUsers((prev) => prev.map((u) => u.user_id === userId ? { ...u, isAdmin: !currentlyAdmin } : u));
    toast({ title: currentlyAdmin ? "Admin role removed" : "Admin role granted" });
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "admin") return u.isAdmin;
    if (filter === "pro") return u.subscription?.plan === "pro";
    if (filter === "free") return !u.subscription || u.subscription.plan === "free";
    return true;
  });

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

        {/* Filter tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 p-1 rounded-lg bg-muted/50">
            {(["all", "admin", "pro", "free"] as UserFilter[]).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "ghost"}
                size="sm"
                className="text-xs h-7 capitalize"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f === "admin" ? "Admins" : f === "pro" ? "Pro Users" : "Free Users"}
              </Button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
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
                     <th className="text-left p-3 font-medium">Role</th>
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
                        <Badge variant={u.isAdmin ? "default" : "outline"} className={`text-xs ${u.isAdmin ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" : ""}`}>
                          {u.isAdmin ? "Admin" : "User"}
                        </Badge>
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
