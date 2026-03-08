import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3X3, Monitor, Tablet, Smartphone } from "lucide-react";
import { DesignSystemData, DEFAULT_GRID } from "./types";

interface Props {
  designSystem: DesignSystemData;
}

export const LayoutSection = ({ designSystem }: Props) => (
  <Card className="shadow-card border-border/50">
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <Grid3X3 className="h-5 w-5" /> 1. Layout System
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">Grid System</p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: "Desktop", icon: <Monitor className="h-4 w-4" />, conf: designSystem.grid?.desktop || DEFAULT_GRID.desktop },
            { label: "Tablet", icon: <Tablet className="h-4 w-4" />, conf: designSystem.grid?.tablet || DEFAULT_GRID.tablet },
            { label: "Mobile", icon: <Smartphone className="h-4 w-4" />, conf: designSystem.grid?.mobile || DEFAULT_GRID.mobile },
          ].map((d) => (
            <div key={d.label} className="rounded-lg border border-border/50 p-4 space-y-2">
              <div className="flex items-center gap-2 font-medium text-sm">{d.icon} {d.label}</div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Columns</span><span className="font-mono">{d.conf.columns}</span></div>
                <div className="flex justify-between"><span>Gutter</span><span className="font-mono">{d.conf.gutter}</span></div>
                <div className="flex justify-between"><span>Margin</span><span className="font-mono">{d.conf.margin}</span></div>
              </div>
              <div className="flex gap-[2px] pt-2">
                {Array.from({ length: d.conf.columns }).map((_, i) => (
                  <div key={i} className="flex-1 h-6 bg-primary/15 rounded-sm" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border/50 pt-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">Breakpoints</p>
        <div className="flex flex-wrap gap-3">
          {(designSystem.breakpoints || []).map((b) => (
            <div key={b.name} className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2">
              <span className="text-sm font-medium capitalize">{b.name}</span>
              <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">{b.value}</span>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);
