import { Sparkles, Github, Twitter, Heart } from "lucide-react";
import { useTheme } from "next-themes";

export function AppFooter() {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-4 px-4 md:px-6 border-t border-border/50 bg-background/50 backdrop-blur">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-violet-600 to-purple-700' 
                : 'bg-gradient-to-br from-violet-500 to-purple-600'
            }`}>
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium">AI Design Studio</span>
            <span className="text-muted-foreground/50">•</span>
            <span>© {currentYear}</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Help
            </a>
          </div>

          {/* Made with love */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500" />
            <span>for designers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}