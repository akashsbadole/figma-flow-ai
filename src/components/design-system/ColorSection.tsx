import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { DesignSystemData } from "./types";

interface Props {
  designSystem: DesignSystemData;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

export const ColorSection = ({ designSystem, copiedKey, onCopy }: Props) => {
  const colorGroups = {
    Brand: ["primary", "primaryLight", "primaryDark", "secondary", "secondaryLight", "accent"],
    Neutral: ["background", "surface", "foreground", "muted"],
    Semantic: ["success", "warning", "error", "info"],
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">🎨 4. Color System</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(colorGroups).map(([group, keys]) => (
          <div key={group}>
            <p className="text-sm font-medium text-muted-foreground mb-3">{group} Colors</p>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
              {keys.map((key) => {
                const val = designSystem.colors[key];
                if (!val) return null;
                return (
                  <button key={key} className="group/color space-y-1.5 text-left" onClick={() => onCopy(val, key)}>
                    <div className="h-16 rounded-lg border border-border/50 shadow-sm group-hover/color:ring-2 ring-primary transition-all" style={{ backgroundColor: val }} />
                    <p className="text-xs font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                    <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                      {val} {copiedKey === key && <Check className="h-3 w-3 text-accent" />}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Neutral Scale */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">Neutral Scale</p>
          <div className="flex gap-1 rounded-lg overflow-hidden border border-border/50">
            {(designSystem.neutralColors || []).map((c) => (
              <button key={c.name} className="flex-1 group/nc" onClick={() => onCopy(c.value, `neutral-${c.name}`)}>
                <div className="h-12" style={{ backgroundColor: c.value }} />
                <div className="p-1.5 bg-card">
                  <p className="text-[9px] text-muted-foreground truncate">{c.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dark Mode */}
        {designSystem.darkModeColors && (
          <div className="border-t border-border/50 pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">Dark Mode Palette</p>
            <div className="rounded-xl border border-border/50 bg-[#0f172a] p-4">
              <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                {Object.entries(designSystem.darkModeColors).map(([key, val]) => (
                  <button key={key} className="group/dc space-y-1.5 text-left" onClick={() => onCopy(val, `dark-${key}`)}>
                    <div className="h-12 rounded-lg border border-white/10 group-hover/dc:ring-2 ring-white/30 transition-all" style={{ backgroundColor: val }} />
                    <p className="text-[10px] text-white/60 capitalize truncate">{key.replace(/([A-Z])/g, " $1")}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
