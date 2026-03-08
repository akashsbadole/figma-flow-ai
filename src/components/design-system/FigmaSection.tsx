import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Accessibility, FolderTree } from "lucide-react";
import { DesignSystemData, DEFAULT_TOKEN_NAMING, DEFAULT_AUTO_LAYOUT, DEFAULT_ACCESSIBILITY, DEFAULT_FILE_STRUCTURE } from "./types";

interface Props {
  designSystem: DesignSystemData;
  onCopy: (text: string, key: string) => void;
}

export const FigmaSection = ({ designSystem, onCopy }: Props) => (
  <>
    {/* Token Naming */}
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">🏷️ 10. Design Token Naming</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {(designSystem.tokenNaming || DEFAULT_TOKEN_NAMING).map((tn) => (
            <div key={tn.category} className="rounded-lg border border-border/50 p-3">
              <p className="text-sm font-medium mb-2">{tn.category}</p>
              <div className="space-y-1">
                {tn.examples.map((ex) => (
                  <button key={ex} onClick={() => onCopy(ex, `token-${ex}`)} className="block w-full text-left">
                    <code className="text-xs font-mono text-primary/80 hover:text-primary transition-colors">{ex}</code>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Auto Layout */}
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Layers className="h-5 w-5" /> 11. Auto Layout Rules (Figma)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted-foreground border-b border-border/50">
              <th className="text-left py-2">Pattern</th>
              <th className="text-left py-2">Direction</th>
              <th className="text-left py-2">Spacing</th>
              <th className="text-left py-2">Padding</th>
              <th className="text-left py-2">Alignment</th>
            </tr></thead>
            <tbody>
              {(designSystem.autoLayoutRules || DEFAULT_AUTO_LAYOUT).map((r) => (
                <tr key={r.name} className="border-b border-border/20">
                  <td className="py-2 font-medium">{r.name}</td>
                  <td className="py-2 font-mono text-xs text-muted-foreground">{r.direction}</td>
                  <td className="py-2 font-mono text-xs text-muted-foreground">{r.spacing}</td>
                  <td className="py-2 font-mono text-xs text-muted-foreground">{r.padding}</td>
                  <td className="py-2 font-mono text-xs text-muted-foreground">{r.alignment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    {/* Accessibility */}
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Accessibility className="h-5 w-5" /> 12. Accessibility Parameters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Contrast Ratios</p>
            {[
              { label: "Normal text", value: (designSystem.accessibility || DEFAULT_ACCESSIBILITY).contrastNormal },
              { label: "Large text", value: (designSystem.accessibility || DEFAULT_ACCESSIBILITY).contrastLarge },
            ].map((c) => (
              <div key={c.label} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <span className="text-sm">{c.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">{c.value}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">WCAG AA</span>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Interaction</p>
            {[
              { label: "Touch target min", value: (designSystem.accessibility || DEFAULT_ACCESSIBILITY).touchTargetMin },
              { label: "Focus ring width", value: (designSystem.accessibility || DEFAULT_ACCESSIBILITY).focusRingWidth },
              { label: "Focus ring color", value: (designSystem.accessibility || DEFAULT_ACCESSIBILITY).focusRingColor },
            ].map((a) => (
              <div key={a.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{a.label}</span>
                <span className="font-mono">{a.value}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-[44px] h-[44px] rounded-lg border-2 border-dashed border-primary/40 flex items-center justify-center">
                <span className="text-[9px] text-muted-foreground">44×44</span>
              </div>
              <span className="text-xs text-muted-foreground">Minimum touch target</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* File Structure */}
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FolderTree className="h-5 w-5" /> 13. Figma File Structure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-1">
          {(designSystem.figmaFileStructure || DEFAULT_FILE_STRUCTURE).map((item, i) => {
            const parts = item.split(" / ");
            return (
              <div key={i} className="flex items-center gap-2 py-1">
                {parts.length > 1 ? (
                  <>
                    <span className="text-[10px] text-muted-foreground font-mono w-28 truncate">{parts[0]}</span>
                    <span className="text-muted-foreground/30">/</span>
                    <span className="text-sm">{parts[1]}</span>
                  </>
                ) : (
                  <span className="text-sm font-medium">{item}</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  </>
);
