import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DesignSystemData } from "./types";

interface Props {
  designSystem: DesignSystemData;
}

export const SpacingSection = ({ designSystem }: Props) => (
  <Card className="shadow-card border-border/50">
    <CardHeader>
      <CardTitle className="text-lg">📏 2. Spacing System</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-xs text-muted-foreground mb-3">Based on 8px scale</p>
      <div className="space-y-2">
        {designSystem.spacing.map((s) => (
          <div key={s.name} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-mono w-10">{s.name}</span>
            <div className="h-5 rounded bg-primary/20 transition-all" style={{ width: `calc(${s.value} * 2)` }} />
            <span className="text-xs text-muted-foreground font-mono">{s.value}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
