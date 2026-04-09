import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sparkles, LogOut, Crown, Menu, Bell, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { api } from "@/integrations/neon/client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toggleSidebar, isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const [subscription, setSubscription] = useState<{ plan?: string; generations_used?: number; generations_limit?: number } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.getSubscription()
        .then((data: any) => !data.error && setSubscription(data))
        .catch(() => setSubscription(null));
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const remaining = subscription ? (subscription.generations_limit || 0) - (subscription.generations_used || 0) : 0;
  const isPro = subscription?.plan === 'pro';

  return (
    <header className="h-14 md:h-16 flex items-center justify-between border-b border-border px-3 md:px-5 bg-background/80 backdrop-blur-md sticky top-0 z-40">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* Logo - Mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search designs..."
              className="w-64 lg:w-80 h-9 pl-10 pr-4 rounded-lg bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Search Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:hidden"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9 hidden sm:flex relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full"></span>
        </Button>

        {/* User Plan Badge */}
        {user && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border">
            {isPro ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400">
                <Crown className="w-3.5 h-3.5" />
                Pro
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">{remaining} left</span>
            )}
          </div>
        )}

        {/* User Menu */}
        {user ? (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium leading-tight">{user.display_name || user.email?.split('@')[0]}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        )}
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="absolute top-14 left-0 right-0 p-3 bg-background border-b border-border md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search designs..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}