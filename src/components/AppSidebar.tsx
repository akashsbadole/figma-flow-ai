import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Wand2,
  LayoutGrid,
  Palette,
  LogOut,
  Sparkles,
  Clock,
  Image,
  Crown,
  Shield,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { api } from "@/integrations/neon/client";
import { useEffect, useState } from "react";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI Generator", url: "/generator", icon: Wand2 },
  { title: "Image to Design", url: "/image-to-design", icon: Image },
  { title: "My Designs", url: "/my-designs", icon: Clock },
  { title: "Templates", url: "/templates", icon: LayoutGrid },
  { title: "Design System", url: "/design-system", icon: Palette },
  { title: "History", url: "/history", icon: Clock },
  { title: "Pricing", url: "/pricing", icon: Crown },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      api.getAdminUsers()
        .then((data) => {
          if (data?.profiles) {
            const userRole = data.roles?.find((r: any) => r.user_id === user.id && r.role === 'admin');
            setIsAdmin(!!userRole);
          }
        })
        .catch(() => setIsAdmin(false));
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const navItems = isAdmin
    ? [...mainNavItems, { title: "Admin Panel", url: "/admin", icon: Shield }]
    : mainNavItems;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm whitespace-nowrap">AI Design</span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className={`p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-all ${
            collapsed ? "absolute -right-3 top-5 bg-sidebar border shadow-md" : ""
          }`}
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={`px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 ${collapsed ? "hidden" : ""}`}>
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative
                        hover:bg-sidebar-accent hover:text-sidebar-foreground`}
                      activeClassName="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 [&::before]:absolute [&::before]:left-0 [&::before]:top-1/2 [&::before]:-translate-y-1/2 [&::before]:w-[3px] [&::before]:h-6 [&::before]:bg-violet-600 [&::before]:rounded-r"
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2 gap-2">
        <ThemeToggle collapsed={collapsed} />
        
        <button
          onClick={handleSignOut}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive transition-all w-full ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}