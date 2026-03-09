import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { api } from "@/integrations/neon/client";
import { useEffect, useState } from "react";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<{ generations_used?: number; generations_limit?: number } | null>(null);

  useEffect(() => {
    if (user) {
      api.getSubscription()
        .then(setSubscription)
        .catch(() => setSubscription(null));
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const remaining = subscription ? (subscription.generations_limit || 0) - (subscription.generations_used || 0) : 0;

  return (
    <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-md gradient-primary flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm">AI Design Studio</span>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mr-2">
            <span>{remaining} generations left</span>
          </div>
        )}
        <ThemeToggle />
        {user ? (
          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col items-end mr-1">
              <span className="text-sm font-medium">{user.display_name || user.email}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
