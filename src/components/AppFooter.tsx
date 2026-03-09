import { Sparkles } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="py-4 px-4 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>AI Design Studio</span>
        </div>
        <p>© {new Date().getFullYear()} All rights reserved.</p>
      </div>
    </footer>
  );
}
