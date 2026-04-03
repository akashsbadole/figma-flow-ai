import React from 'react';
import { Layers, ChevronRight, ChevronDown, Square, Type, Circle, MousePointer2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayerNode {
  id: string;
  name: string;
  type: string;
  children?: LayerNode[];
}

interface LayersPanelProps {
  svgCode: string;
  className?: string;
}

export function LayersPanel({ svgCode, className }: LayersPanelProps) {
  const [layers, setLayers] = React.useState<LayerNode[]>([]);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (!svgCode) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgCode, 'image/svg+xml');
    const svg = doc.querySelector('svg');

    if (!svg) return;

    const buildTree = (el: Element): LayerNode => {
      const type = el.tagName.toLowerCase();
      const id = el.getAttribute('id') || `${type}-${Math.random().toString(36).substr(2, 9)}`;
      const name = el.getAttribute('id') || el.getAttribute('data-name') || type.charAt(0).toUpperCase() + type.slice(1);

      const children = Array.from(el.children).map(buildTree);

      return {
        id,
        name,
        type,
        children: children.length > 0 ? children : undefined
      };
    };

    const tree = Array.from(svg.children).map(buildTree);
    setLayers(tree);

    // Auto-expand top level
    const initialExpanded: Record<string, boolean> = {};
    tree.forEach(node => {
      if (node.children) initialExpanded[node.id] = true;
    });
    setExpanded(initialExpanded);
  }, [svgCode]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'g': return <Layers className="h-3.5 w-3.5 text-muted-foreground" />;
      case 'rect': return <Square className="h-3.5 w-3.5 text-muted-foreground" />;
      case 'text': return <Type className="h-3.5 w-3.5 text-muted-foreground" />;
      case 'circle':
      case 'ellipse': return <Circle className="h-3.5 w-3.5 text-muted-foreground" />;
      default: return <MousePointer2 className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const renderNode = (node: LayerNode, depth = 0) => {
    const isExpanded = expanded[node.id];
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none">
        <div
          className={cn(
            "flex items-center gap-1.5 py-1.5 px-2 hover:bg-muted/50 cursor-pointer rounded-md transition-colors",
            depth > 0 && "ml-3"
          )}
          onClick={() => hasChildren && toggleExpand(node.id)}
        >
          <div className="w-4 flex items-center justify-center">
            {hasChildren && (
              isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
            )}
          </div>
          {getIcon(node.type)}
          <span className="text-xs font-medium truncate">{node.name}</span>
          <span className="text-[10px] text-muted-foreground/60 uppercase ml-auto">{node.type}</span>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-border/40 ml-4.5 mt-0.5">
            {node.children?.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full bg-card border-l border-border/40", className)}>
      <div className="p-3 border-b border-border/40 flex items-center gap-2">
        <Layers className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Layers</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {layers.length > 0 ? (
          layers.map(node => renderNode(node))
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground p-4 text-center italic">
            No layers found in this design
          </div>
        )}
      </div>
    </div>
  );
}
