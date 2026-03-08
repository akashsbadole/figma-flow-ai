import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DesignSystemData } from "./types";

interface Props {
  designSystem: DesignSystemData;
}

export const ShadowsSection = ({ designSystem }: Props) => (
  <Card className="shadow-card border-border/50">
    <CardHeader>
      <CardTitle className="text-lg">🌗 5. Shadows & Border Radius</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      {/* Shadows */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">Shadows</p>
        <div className="flex flex-wrap gap-6">
          {designSystem.shadows.map((s) => (
            <div key={s.name} className="text-center">
              <div className="w-20 h-20 rounded-lg bg-card border border-border/30" style={{ boxShadow: s.value }} />
              <p className="text-xs font-medium mt-2">{s.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono max-w-[120px] truncate">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div className="border-t border-border/50 pt-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">Border Radius</p>
        <div className="flex flex-wrap gap-4 items-end">
          {designSystem.borderRadius.map((r) => (
            <div key={r.name} className="text-center">
              <div className="w-16 h-16 bg-primary/15 border-2 border-primary/30" style={{ borderRadius: r.value }} />
              <p className="text-xs font-medium mt-1">{r.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{r.value}</p>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);
