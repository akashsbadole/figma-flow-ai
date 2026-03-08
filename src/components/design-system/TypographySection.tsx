import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Type } from "lucide-react";
import { DesignSystemData } from "./types";

interface Props {
  designSystem: DesignSystemData;
}

export const TypographySection = ({ designSystem }: Props) => (
  <Card className="shadow-card border-border/50">
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <Type className="h-5 w-5" /> 3. Typography System
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: "Heading", font: designSystem.typography.heading },
          { label: "Body", font: designSystem.typography.body },
          { label: "Mono", font: designSystem.typography.mono },
        ].map((f) => (
          <div key={f.label} className="space-y-1">
            <p className="text-xs text-muted-foreground">{f.label}</p>
            <p className="text-2xl font-bold" style={{ fontFamily: `'${f.font}', sans-serif` }}>{f.font}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-border/50 pt-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">Type Scale</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted-foreground border-b border-border/50">
              <th className="text-left py-2 w-16">Token</th>
              <th className="text-left py-2 w-16">Size</th>
              <th className="text-left py-2 w-16">Line H.</th>
              <th className="text-left py-2">Preview</th>
            </tr></thead>
            <tbody>
              {designSystem.typography.scale.map((s) => (
                <tr key={s.name} className="border-b border-border/20">
                  <td className="py-2 font-mono text-xs text-muted-foreground">{s.name}</td>
                  <td className="py-2 font-mono text-xs text-muted-foreground">{s.size}</td>
                  <td className="py-2 font-mono text-xs text-muted-foreground">{s.lineHeight}</td>
                  <td className="py-2">
                    <span style={{ fontSize: s.size, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing }} className="truncate block max-w-xs">
                      The quick brown fox
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-border/50 pt-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">Font Weights</p>
        <div className="flex flex-wrap gap-6">
          {designSystem.typography.weights.map((w) => (
            <div key={w.name} className="text-center">
              <p style={{ fontWeight: w.value }} className="text-2xl">Aa</p>
              <p className="text-xs text-muted-foreground capitalize">{w.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{w.value}</p>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);
