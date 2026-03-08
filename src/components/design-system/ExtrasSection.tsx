import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Move } from "lucide-react";
import { DesignSystemData } from "./types";

interface Props {
  designSystem: DesignSystemData;
}

export const ExtrasSection = ({ designSystem }: Props) => (
  <>
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="shadow-card border-border/50">
        <CardHeader><CardTitle className="text-lg">🌈 Gradients</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {designSystem.gradients.map((g) => (
              <div key={g.name}>
                <div className="h-12 rounded-lg" style={{ background: g.value }} />
                <p className="text-[10px] text-muted-foreground mt-1">{g.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border/50">
        <CardHeader><CardTitle className="text-lg">🔲 Borders</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(designSystem.borders || []).map((b) => (
              <div key={b.name} className="flex items-center gap-4">
                <span className="text-sm font-medium capitalize w-16">{b.name}</span>
                <div className="flex-1 h-0" style={{ borderTop: `${b.width} ${b.style} ${b.color}` }} />
                <span className="text-xs text-muted-foreground font-mono">{b.width}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <Card className="shadow-card border-border/50">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Layers className="h-4 w-4" /> Opacity</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(designSystem.opacity || []).map((o) => (
              <div key={o.name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-mono w-8">{o.name}</span>
                <div className="flex-1 h-6 rounded" style={{ backgroundColor: designSystem.colors.primary, opacity: o.value }} />
                <span className="text-xs text-muted-foreground font-mono w-10">{o.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border/50">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Move className="h-4 w-4" /> Z-Index</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(designSystem.zIndex || []).map((z) => (
              <div key={z.name} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                <span className="text-sm font-medium capitalize">{z.name}</span>
                <span className="text-xs text-muted-foreground font-mono">{z.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </>
);
