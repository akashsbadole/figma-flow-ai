import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
  LayoutDashboard, Wand2, LayoutGrid, Palette, LogOut, Sparkles,
  Clock, Image, Crown, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
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
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle()
        .then(({ data }) => setIsAdmin(!!data));
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
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {!collapsed && <span className="font-bold">AI Design Studio</span>}
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={handleSignOut}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
