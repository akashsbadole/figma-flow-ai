import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MousePointerClick } from "lucide-react";
import { DesignSystemData, DEFAULT_COMPONENT_SPECS } from "./types";

interface Props {
  designSystem: DesignSystemData;
}

export const ComponentParamsSection = ({ designSystem }: Props) => {
  const specs = designSystem.componentSpecs || DEFAULT_COMPONENT_SPECS;

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MousePointerClick className="h-5 w-5" /> 8. Component Parameters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={specs[0]?.name?.toLowerCase()}>
          <TabsList className="flex-wrap h-auto gap-1">
            {specs.map((cs) => (
              <TabsTrigger key={cs.name} value={cs.name.toLowerCase()}>{cs.name}</TabsTrigger>
            ))}
          </TabsList>
          {specs.map((cs) => (
            <TabsContent key={cs.name} value={cs.name.toLowerCase()} className="mt-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Sizes</p>
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border/50 text-muted-foreground">
                      <th className="text-left py-1.5">Size</th>
                      <th className="text-left py-1.5">Height</th>
                      <th className="text-left py-1.5">Padding</th>
                      <th className="text-left py-1.5">Font</th>
                    </tr></thead>
                    <tbody>
                      {cs.sizes.map((sz) => (
                        <tr key={sz.name} className="border-b border-border/20">
                          <td className="py-1.5 font-medium">{sz.name}</td>
                          <td className="py-1.5 font-mono text-muted-foreground">{sz.height}</td>
                          <td className="py-1.5 font-mono text-muted-foreground">{sz.padding}</td>
                          <td className="py-1.5 font-mono text-muted-foreground">{sz.fontSize}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">States</p>
                    <div className="flex flex-wrap gap-2">
                      {cs.states.map((st) => (
                        <span key={st} className="px-2.5 py-1 rounded-full text-xs bg-muted font-medium">{st}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Border Radius</span>
                      <span className="font-mono">{cs.borderRadius}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Border</span>
                      <span className="font-mono">{cs.border}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
