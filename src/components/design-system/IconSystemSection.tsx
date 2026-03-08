import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { DesignSystemData, DEFAULT_ICON_SIZES } from "./types";

interface Props {
  designSystem: DesignSystemData;
}

export const IconSystemSection = ({ designSystem }: Props) => (
  <Card className="shadow-card border-border/50">
    <CardHeader>
      <CardTitle className="text-lg">🔷 7. Icon System</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex flex-wrap gap-6 items-end">
        {(designSystem.iconSystem?.sizes || designSystem.iconSizes || DEFAULT_ICON_SIZES).map((ic) => (
          <div key={ic.name} className="text-center">
            <div className="flex items-center justify-center" style={{ width: ic.value, height: ic.value }}>
              <Sparkles className="text-primary" style={{ width: ic.value, height: ic.value }} />
            </div>
            <p className="text-xs font-medium mt-1">{ic.name}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{ic.value}</p>
          </div>
        ))}
      </div>
      {designSystem.iconSystem && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground border-t border-border/50 pt-3">
          <span>Stroke: <strong className="text-foreground">{designSystem.iconSystem.strokeWidth}</strong></span>
          <span>Grid: <strong className="text-foreground">{designSystem.iconSystem.gridSize}</strong></span>
          <span>Corner: <strong className="text-foreground">{designSystem.iconSystem.cornerRadius}</strong></span>
        </div>
      )}
      <div className="rounded-lg bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">Recommended: {(designSystem.iconSystem?.recommendedLibraries || ["Lucide Icons", "Heroicons", "Material Icons"]).map((lib, i, arr) => (
          <span key={lib} className="font-medium text-foreground">{lib}{i < arr.length - 1 ? " · " : ""}</span>
        ))}</p>
      </div>
    </CardContent>
  </Card>
);
