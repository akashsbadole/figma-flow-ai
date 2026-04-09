import { useState } from "react";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = localStorage.getItem("sidebar:collapsed");
    return stored === null ? true : stored === "false";
  });

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={(open) => {
      setSidebarOpen(open);
      localStorage.setItem("sidebar:collapsed", String(!open));
    }}>
      <div className="min-h-screen flex w-full relative">
        {/* Mobile Overlay */}
        <MobileOverlay />
        
        {/* Sidebar */}
        <AppSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          <AppHeader />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
          <AppFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}

function MobileOverlay() {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  
  if (!isMobile) return null;
  
  return (
    <div 
      className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200 ${openMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={() => setOpenMobile(false)}
    />
  );
}