export interface GridConfig {
  desktop: { columns: number; gutter: string; margin: string };
  tablet: { columns: number; gutter: string; margin: string };
  mobile: { columns: number; gutter: string; margin: string };
}

export interface IconSize {
  name: string;
  value: string;
}

export interface ComponentSpec {
  name: string;
  sizes: { name: string; height: string; padding: string; fontSize: string }[];
  states: string[];
  borderRadius: string;
  border: string;
}

export interface AccessibilitySpec {
  contrastNormal: string;
  contrastLarge: string;
  touchTargetMin: string;
  focusRingWidth: string;
  focusRingColor: string;
}

export interface AutoLayoutRule {
  name: string;
  direction: string;
  spacing: string;
  padding: string;
  alignment: string;
}

export interface DesignSystemData {
  name: string;
  colors: Record<string, string>;
  darkModeColors?: Record<string, string>;
  neutralColors: { name: string; value: string }[];
  typography: {
    heading: string;
    body: string;
    mono: string;
    scale: { name: string; size: string; lineHeight: string; letterSpacing: string }[];
    weights: { name: string; value: number }[];
  };
  spacing: { name: string; value: string }[];
  borderRadius: { name: string; value: string }[];
  shadows: { name: string; value: string }[];
  gradients: { name: string; value: string }[];
  breakpoints: { name: string; value: string }[];
  opacity: { name: string; value: number }[];
  zIndex: { name: string; value: number }[];
  transitions: { name: string; duration: string; easing: string }[];
  borders: { name: string; width: string; style: string; color: string }[];
  grid: GridConfig;
  iconSizes: IconSize[];
  iconSystem?: {
    sizes: { name: string; value: string }[];
    strokeWidth: string;
    gridSize: string;
    cornerRadius: string;
    recommendedLibraries: string[];
  };
  motionTokens?: {
    easingCurves: { name: string; value: string; description: string }[];
    durations: { name: string; value: string; useCase: string }[];
    animations: { name: string; keyframes: string; duration: string; easing: string }[];
  };
  componentSpecs: ComponentSpec[];
  accessibility: AccessibilitySpec;
  autoLayoutRules: AutoLayoutRule[];
  figmaFileStructure: string[];
  tokenNaming: { category: string; examples: string[] }[];
  components: Record<string, string>;
}

export const DEFAULT_GRID: GridConfig = {
  desktop: { columns: 12, gutter: "24px", margin: "120px" },
  tablet: { columns: 8, gutter: "16px", margin: "64px" },
  mobile: { columns: 4, gutter: "16px", margin: "16px" },
};

export const DEFAULT_ICON_SIZES: IconSize[] = [
  { name: "xs", value: "12px" }, { name: "sm", value: "16px" },
  { name: "md", value: "20px" }, { name: "lg", value: "24px" }, { name: "xl", value: "32px" },
];

export const DEFAULT_COMPONENT_SPECS: ComponentSpec[] = [
  {
    name: "Button",
    sizes: [
      { name: "Small", height: "32px", padding: "8px 12px", fontSize: "14px" },
      { name: "Medium", height: "40px", padding: "10px 16px", fontSize: "14px" },
      { name: "Large", height: "48px", padding: "12px 24px", fontSize: "16px" },
    ],
    states: ["Default", "Hover", "Active", "Disabled", "Loading"],
    borderRadius: "8px",
    border: "none",
  },
  {
    name: "Input",
    sizes: [
      { name: "Small", height: "32px", padding: "6px 12px", fontSize: "14px" },
      { name: "Medium", height: "40px", padding: "10px 12px", fontSize: "14px" },
      { name: "Large", height: "48px", padding: "12px 16px", fontSize: "16px" },
    ],
    states: ["Default", "Focus", "Error", "Disabled"],
    borderRadius: "6px",
    border: "1px solid",
  },
  {
    name: "Card",
    sizes: [
      { name: "Compact", height: "auto", padding: "16px", fontSize: "14px" },
      { name: "Default", height: "auto", padding: "24px", fontSize: "16px" },
      { name: "Spacious", height: "auto", padding: "32px", fontSize: "16px" },
    ],
    states: ["Default", "Hover", "Selected"],
    borderRadius: "12px",
    border: "1px solid",
  },
];

export const DEFAULT_ACCESSIBILITY: AccessibilitySpec = {
  contrastNormal: "4.5:1",
  contrastLarge: "3:1",
  touchTargetMin: "44px × 44px",
  focusRingWidth: "2px",
  focusRingColor: "#2563EB",
};

export const DEFAULT_AUTO_LAYOUT: AutoLayoutRule[] = [
  { name: "Stack", direction: "Vertical", spacing: "16px", padding: "0px", alignment: "Stretch" },
  { name: "Row", direction: "Horizontal", spacing: "12px", padding: "0px", alignment: "Center" },
  { name: "Card Content", direction: "Vertical", spacing: "12px", padding: "24px", alignment: "Start" },
  { name: "Nav Bar", direction: "Horizontal", spacing: "8px", padding: "12px 24px", alignment: "Center" },
  { name: "Form Group", direction: "Vertical", spacing: "8px", padding: "0px", alignment: "Stretch" },
];

export const DEFAULT_FILE_STRUCTURE = [
  "01 Foundations / Colors",
  "01 Foundations / Typography",
  "01 Foundations / Spacing",
  "01 Foundations / Grid",
  "01 Foundations / Icons",
  "02 Components / Buttons",
  "02 Components / Inputs",
  "02 Components / Cards",
  "02 Components / Modals",
  "02 Components / Tables",
  "02 Components / Badges",
  "02 Components / Avatars",
  "02 Components / Alerts",
  "03 Patterns / Forms",
  "03 Patterns / Navigation",
  "03 Patterns / Dashboards",
  "03 Patterns / Data Tables",
  "04 Screens / Landing Page",
  "04 Screens / Dashboard",
  "04 Screens / Settings",
  "04 Screens / Auth Flows",
];

export const DEFAULT_TOKEN_NAMING = [
  { category: "Color", examples: ["color.primary.500", "color.primary.100", "color.gray.200", "color.semantic.success"] },
  { category: "Spacing", examples: ["spacing.xs", "spacing.sm", "spacing.md", "spacing.lg"] },
  { category: "Radius", examples: ["radius.sm", "radius.md", "radius.lg", "radius.pill"] },
  { category: "Font", examples: ["font.heading.h1", "font.heading.h2", "font.body.base", "font.body.sm"] },
  { category: "Shadow", examples: ["shadow.sm", "shadow.md", "shadow.lg", "shadow.xl"] },
  { category: "Z-Index", examples: ["z.base", "z.dropdown", "z.modal", "z.toast"] },
];
