import { Card } from "@/components/ui/card";
import { Loader2, Palette } from "lucide-react";

interface DesignSystemData {
  name: string;
  colors: Record<string, string>;
  typography: { heading: string; body: string; mono: string; scale?: any[]; weights?: any[] };
  spacing: { name: string; value: string }[];
  borderRadius: { name: string; value: string }[];
  shadows: { name: string; value: string }[];
  [key: string]: any;
}

interface DesignSystemPreviewProps {
  data: DesignSystemData | null;
  loading: boolean;
  error?: string | null;
}

export function DesignSystemPreview({ data, loading, error }: DesignSystemPreviewProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Generating design system...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <Palette className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">Design system will appear here</p>
      </div>
    );
  }

  const colorEntries = Object.entries(data.colors || {});
  const spacingItems = data.spacing || [];
  const radiusItems = data.borderRadius || [];
  const shadowItems = data.shadows || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">{data.name}</h3>
        <p className="text-xs text-muted-foreground">Auto-generated design tokens</p>
      </div>

      {/* Colors */}
      <div>
        <h4 className="text-sm font-medium mb-3">Colors</h4>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {colorEntries.map(([name, hex]) => (
            <div key={name} className="text-center">
              <div
                className="w-full aspect-square rounded-lg border border-border/50 shadow-sm"
                style={{ backgroundColor: hex }}
              />
              <p className="text-[10px] text-muted-foreground mt-1 truncate">{name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <h4 className="text-sm font-medium mb-2">Typography</h4>
        <div className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">Heading:</span> {data.typography.heading}</p>
          <p><span className="text-muted-foreground">Body:</span> {data.typography.body}</p>
          <p><span className="text-muted-foreground">Mono:</span> {data.typography.mono}</p>
        </div>
      </div>

      {/* Spacing */}
      {spacingItems.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Spacing</h4>
          <div className="flex flex-wrap gap-2">
            {spacingItems.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded text-xs">
                <span className="font-mono text-muted-foreground">{s.name}</span>
                <span>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Border Radius */}
      {radiusItems.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Border Radius</h4>
          <div className="flex flex-wrap gap-3">
            {radiusItems.map((r) => (
              <div key={r.name} className="text-center">
                <div
                  className="w-10 h-10 bg-primary/20 border border-primary/40"
                  style={{ borderRadius: r.value }}
                />
                <p className="text-[10px] text-muted-foreground mt-1">{r.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shadows */}
      {shadowItems.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Shadows</h4>
          <div className="flex flex-wrap gap-3">
            {shadowItems.map((s) => (
              <div key={s.name} className="text-center">
                <div
                  className="w-14 h-14 bg-card rounded-lg"
                  style={{ boxShadow: s.value }}
                />
                <p className="text-[10px] text-muted-foreground mt-1">{s.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
