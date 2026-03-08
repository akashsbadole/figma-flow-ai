import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { DesignSystemData } from "./types";

interface Props {
  designSystem: DesignSystemData;
}

export const AnimationSection = ({ designSystem }: Props) => (
  <>
    {/* Transitions */}
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5" /> 9. Animation Parameters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(designSystem.transitions || []).map((t) => (
            <div key={t.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{t.name}</span>
                <span className="text-xs text-muted-foreground font-mono">{t.duration}</span>
              </div>
              <div className="group/trans relative h-8 bg-muted/50 rounded overflow-hidden cursor-pointer">
                <div
                  className="absolute left-0 top-0 h-full w-8 rounded bg-primary group-hover/trans:w-full"
                  style={{ transition: `width ${t.duration} ${t.easing}` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-mono">{t.easing}</p>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground italic">Hover bars to preview easing</p>
        </div>
      </CardContent>
    </Card>

    {/* Motion Tokens */}
    {designSystem.motionTokens && (
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" /> 9b. Motion & Animation Tokens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Easing Curves</p>
            <div className="space-y-2">
              {designSystem.motionTokens.easingCurves.map((e) => (
                <div key={e.name} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-24">{e.name}</span>
                  <div className="group/ease relative flex-1 h-6 bg-muted/50 rounded overflow-hidden cursor-pointer">
                    <div className="absolute left-0 top-0 h-full w-6 rounded bg-primary group-hover/ease:w-full" style={{ transition: `width 600ms ${e.value}` }} />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground max-w-[160px] truncate">{e.description}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-border/50 pt-3">
            <p className="text-sm font-medium text-muted-foreground mb-3">Duration Scale</p>
            <div className="flex flex-wrap gap-3">
              {designSystem.motionTokens.durations.map((d) => (
                <div key={d.name} className="bg-muted rounded-lg px-4 py-3 text-center">
                  <p className="text-xs font-medium">{d.name}</p>
                  <p className="text-lg font-mono font-bold text-primary">{d.value}</p>
                  <p className="text-[9px] text-muted-foreground">{d.useCase}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-border/50 pt-3">
            <p className="text-sm font-medium text-muted-foreground mb-3">Named Animations</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {designSystem.motionTokens.animations.map((a) => (
                <div key={a.name} className="rounded-lg border border-border/50 p-3">
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-[10px] text-muted-foreground">{a.duration} · {a.easing}</p>
                  <p className="text-[9px] font-mono text-muted-foreground/70 mt-1">{a.keyframes}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )}
  </>
);
