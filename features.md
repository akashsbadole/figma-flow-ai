# Complete Blueprint: AI-Powered SVG Design Generation SaaS 
 
--- 
 
## 1. PRODUCT ARCHITECTURE 
 
### 1.1 High-Level System Flow 
 
``` 
User Instruction (Text) 
        ↓ 
Intent Classifier (what type of design?) 
        ↓ 
Context Builder (gather design system, preferences, constraints) 
        ↓ 
Design Planner (break into layout structure) 
        ↓ 
SVG Generator (produce SVG markup) 
        ↓ 
SVG Validator & Optimizer (check quality, fix issues) 
        ↓ 
SVG Post-Processor (add Figma-compatible metadata) 
        ↓ 
Preview Renderer (show user in browser) 
        ↓ 
User Edits / Refinements (iterate with AI) 
        ↓ 
Export (SVG file → Figma import / direct copy-paste) 
``` 
 
### 1.2 Multi-Module Architecture 
 
- **Frontend App**: React/Next.js canvas, prompt interface, gallery, settings 
- **API Gateway**: Auth, rate limiting, routing 
- **Intent Engine**: Classifies design type, extracts parameters 
- **Design Engine**: Orchestrates SVG generation per design type 
- **Template Engine**: Manages reusable templates, parameterization 
- **Design System Service**: Stores user/org design tokens, styles 
- **SVG Pipeline**: Generate → Validate → Optimize → Post-process 
- **Asset Service**: Icons, illustrations, images (base64 or URLs) 
- **Export Service**: Format conversion, packaging 
- **User Service**: Accounts, projects, billing, history 
- **Feedback Loop**: User edits tracked to improve future generations 
 
--- 
 
## 2. DESIGN TYPE CATEGORIES (Complete Taxonomy) 
 
### 2.1 UI Component Design 
 
**Buttons** 
- Variants: Primary, Secondary, Ghost, Danger, Warning, Success, Outline, Text 
- States: Default, Hover, Active, Disabled, Loading 
- Sizes: XS (24px h), SM (32px h), MD (40px h), LG (48px h), XL (56px h) 
- Properties: label text, icon-left, icon-right, icon-only, full-width 
- SVG structure: `<rect>` background + `<text>` label + `<path>` icon 
- Border radius: proportional to height (h/4 for pill, h/8 for rounded, 0 for sharp) 
 
**Input Fields** 
- Types: Text, Email, Password, Number, Search, Textarea, Select 
- States: Default, Focus, Error, Disabled, With value 
- Variants: With label, with hint text, with prefix/suffix icon, with clear button 
- SVG structure: `<rect>` border + `<text>` label + `<text>` placeholder + optional icons 
 
**Cards** 
- Types: Content card, Product card, User card, Stats card, Media card 
- Sections: Header (avatar + title + subtitle), Body (text/list), Footer (actions), Media (image placeholder) 
- SVG structure: `<rect>` background + `<rect>` image placeholder + `<text>` elements + `<rect>` buttons 
 
**Navigation** 
- Top navbar: Logo + nav links + actions 
- Sidebar: Logo + nav groups + nested items + collapse state 
- Breadcrumb: Linked text items with separators 
- Tabs: Tab bar with active indicator 
- Bottom navigation: Icon + label items (mobile) 
- SVG structure: `<rect>` backgrounds + `<text>` labels + `<path>` icons + `<rect>` active indicators 
 
**Modals / Dialogs** 
- Parts: Overlay, Container, Header (title + close), Body, Footer (actions) 
- Sizes: SM (400px), MD (560px), LG (720px), Full-screen 
- SVG structure: `<rect>` overlay (semi-transparent) + `<rect>` container + inner elements 
 
**Tables** 
- Parts: Header row, data rows, pagination, sort indicators, row actions 
- SVG structure: `<rect>` cells + `<text>` content + `<path>` sort arrows + `<line>` borders 
 
**Form Groups** 
- Types: Login form, Registration, Contact, Settings, Checkout 
- Layout: Single column, two column, multi-step 
- SVG structure: Stacked input components + `<rect>` buttons + `<text>` labels 
 
**Dropdowns / Menus** 
- Parts: Trigger, Menu container, Menu items (with icons, shortcuts, dividers), Submenu 
- SVG structure: `<rect>` trigger + `<rect>` menu + `<text>` items + `<line>` dividers + `<path>` icons 
 
**Badges / Tags / Chips** 
- Types: Status badge, Count badge, Filter chip, Tag, Notification dot 
- SVG structure: `<rect>` (rounded) + `<text>` label, optional `<circle>` dot 
 
**Tooltips / Popovers** 
- Positions: Top, Bottom, Left, Right 
- SVG structure: `<rect>` body + `<polygon>` arrow + `<text>` content 
 
**Toggle / Switch / Checkbox / Radio** 
- States: Unchecked, Checked, Indeterminate, Disabled 
- SVG structure: `<rect>` track + `<circle>` thumb for toggle; `<rect>` + `<path>` checkmark for checkbox; `<circle>` + `<circle>` fill for radio 
 
**Avatars** 
- Types: Initial, Image placeholder, Group (stacked), with status dot 
- Sizes: XS (20), SM (24), MD (32), LG (40), XL (56), XXL (80) 
- SVG structure: `<circle>` or `<rect>` + `<text>` initials or `<clipPath>` + `<image>` 
 
**Progress Indicators** 
- Types: Linear bar, Circular, Steps/Stepper, Skeleton 
- SVG structure: `<rect>` track + `<rect>` fill (clipped) for linear; `<circle>` track + `<circle>` progress (stroke-dasharray) for circular 
 
### 2.2 Page / Layout Design 
 
**Landing Page** 
- Sections: Hero (headline + subheadline + CTA + illustration), Features grid, Social proof (logos), Testimonial, Pricing table, FAQ, CTA section, Footer 
- Width: 1440px desktop, responsive variants 
- SVG structure: Large `<rect>` frames for sections, nested `<text>` elements, `<rect>` image placeholders, `<rect>` button groups 
 
**Dashboard** 
- Layout: Sidebar (240px) + Top bar (64px) + Main content area 
- Content: Stat cards row, Chart placeholders, Table, Activity feed 
- SVG structure: `<rect>` sidebar + `<rect>` topbar + grid of `<rect>` cards + `<rect>` chart areas 
 
**Settings Page** 
- Layout: Sidebar nav (200px) + Content area 
- Sections: Profile, Account, Notifications, Appearance, Security, Billing 
- SVG structure: Nested frames with form components inside 
 
**Pricing Page** 
- Layout: Centered heading + pricing card grid (3 columns) 
- Card variants: Free, Pro (highlighted), Enterprise 
- SVG structure: Heading section + 3 `<rect>` card frames with `<text>` pricing details + `<rect>` CTA buttons 
 
**Blog / Article Page** 
- Layout: Full-width or sidebar layout 
- Elements: Header image, Title, Author row, Body text blocks, Blockquote, Code block, Images, Tags 
- SVG structure: Image `<rect>` + `<text>` blocks (simulate paragraphs with multiple `<tspan>`) 
 
**Auth Pages** 
- Types: Login, Register, Forgot Password, 2FA, Email Verification 
- Layout: Split (illustration left, form right) or centered card 
- SVG structure: `<rect>` split layout + form components 
 
**Error Pages** 
- Types: 404, 500, 403, Maintenance 
- Layout: Centered illustration + message + action link 
- SVG structure: Decorative `<path>` illustration + `<text>` error code and message 
 
**Email Templates** 
- Width: 600px fixed 
- Types: Welcome, Reset Password, Invoice, Newsletter, Notification 
- SVG structure: `<rect>` email container (600px) + `<rect>` header banner + `<text>` body + `<rect>` CTA button + `<rect>` footer 
 
### 2.3 System Design / Architecture Diagrams 
 
**Service Architecture** 
- Elements: Service boxes (rectangles with rounded corners), Database cylinders, Cache boxes, Message queue symbols, Load balancer (diamond/split), API Gateway, CDN 
- Connections: Arrows with labels (protocol, data type, direction) 
- Layout: Horizontal flow (left to right) or layered (presentation → application → data) 
- SVG structure: `<rect>` services + `<path>` arrows (marker-end) + `<text>` labels + `<line>` connections 
- Arrow types: One-way solid, Two-way solid, Dashed (async), Dotted (optional) 
 
**Cloud Architecture (AWS/GCP/Azure)** 
- Elements: Cloud-shaped containers for regions/VPCs, Service icons (can use simplified SVG icon shapes), Subnet groupings, Security zone boundaries 
- Zones: Public subnet, Private subnet, NAT Gateway, Internet Gateway 
- Services to represent: EC2/Compute, S3/Storage, RDS/Database, Lambda/Serverless, API Gateway, ELB/Load Balancer, SQS/Queue, SNS/Topic, CloudFront/CDN, Route53/DNS, VPC/Network, IAM/Security, ECS/Kubernetes 
- SVG structure: `<rect>` with dashed stroke for zones + `<rect>` with icon + label for services + `<path>` arrows 
 
**Microservices Architecture** 
- Elements: Service circles/rectangles, Service mesh overlay, API gateway, Config server, Service registry, Circuit breaker symbols, Event bus 
- Patterns: Saga pattern, CQRS, Event sourcing 
- SVG structure: `<rect>` or `<circle>` per service + `<rect>` for infrastructure + `<path>` sync arrows + `<line>` dashed for async events 
 
**Data Flow Diagram** 
- Elements: External entities (rectangles), Processes (circles/rounded rects), Data stores (open-ended rectangles), Data flows (arrows with labels) 
- Levels: Context diagram (Level 0), Level 1 (decompose processes), Level 2 (further decomposition) 
- SVG structure: Different `<rect>` styles per element type + `<path>` labeled arrows 
 
**Sequence Diagram** 
- Elements: Actor (stick figure), Participant (rectangle with name), Lifeline (dashed vertical line), Activation box (narrow rectangle on lifeline), Message (horizontal arrow), Return message (dashed arrow), Self-message (loop arrow), Alt/Opt/Loop fragments (labeled rectangle with divider) 
- SVG structure: `<rect>` participants + `<line>` dashed lifelines + `<path>` messages + `<rect>` fragments + `<text>` labels 
 
**Entity Relationship Diagram** 
- Elements: Entity (rectangle), Attribute (oval), Relationship (diamond), Cardinality labels (1, N, M), Primary key underline 
- SVG structure: `<rect>` entities + `<ellipse>` attributes + `<polygon>` diamond relationships + `<text>` labels + `<line>` connections 
 
**Network Topology** 
- Elements: Router (circle with crosses), Switch (rectangle with arrows), Firewall (brick wall), Server (rectangle), Cloud (cloud path), Client (monitor shape) 
- SVG structure: Custom `<path>` shapes per device + `<line>` connections + `<text>` IP/labels 
 
**State Machine Diagram** 
- Elements: States (rounded rectangles), Start state (filled circle), End state (bullseye circle), Transitions (arrows with event/guard/action labels), Decision nodes (diamond) 
- SVG structure: `<rect rx>` states + `<circle>` start/end + `<path>` transitions + `<text>` labels 
 
**Flowchart** 
- Elements: Start/End (rounded rectangle/stadium), Process (rectangle), Decision (diamond), Data (parallelogram), Document (wavy bottom rectangle), Subprocess (rectangle with double vertical lines), Connector (circle with label) 
- SVG structure: Different `<rect>`/`<polygon>` shapes + `<path>` arrows + `<text>` labels 
 
**C4 Model Diagrams** 
- Level 1 (Context): System boundary box, external systems, actors, relationships 
- Level 2 (Container): Containers inside system boundary, technologies labeled 
- Level 3 (Component): Components inside containers, interfaces 
- SVG structure: `<rect>` boundaries + `<rect>`/`<path>` elements + technology badges (`<rect>` + `<text>`) + `<path>` relationships with labels 
 
**Kubernetes Architecture** 
- Elements: Cluster boundary, Node boxes, Pod boxes, Container mini-boxes, Service (circle), Ingress (arrow from outside), PVC/PV, ConfigMap, Secret, Deployment/StatefulSet/DaemonSet labels 
- SVG structure: Nested `<rect>` for cluster → nodes → pods → containers + labeled connections 
 
### 2.4 Data Visualization 
 
**Bar Chart** 
- Elements: Axes (x, y), Axis labels, Grid lines, Bars (rectangles), Value labels, Legend, Title 
- Types: Vertical, Horizontal, Grouped, Stacked, 100% Stacked 
- SVG structure: `<line>` axes + `<line>` grid + `<rect>` bars + `<text>` labels + `<text>` values 
 
**Line Chart** 
- Elements: Axes, Grid, Lines (polyline or path), Data points (circles), Area fill (path with opacity), Tooltip area, Legend 
- Types: Single line, Multi-line, Area chart, Stepped 
- SVG structure: `<line>` axes + `<polyline>` data + `<circle>` points + `<path>` area fill + `<text>` labels 
 
**Pie / Donut Chart** 
- Elements: Slices (path arcs), Labels, Legend, Center text (donut), Percentage labels 
- SVG structure: `<path>` slices (computed arc paths) + `<text>` labels + `<circle>` center mask for donut 
 
**Radar / Spider Chart** 
- Elements: Concentric polygons (grid), Axis lines, Axis labels, Data polygon (filled), Data points, Legend 
- SVG structure: `<polygon>` grid rings + `<line>` axes + `<polygon>` data area + `<text>` labels 
 
**Tree Map** 
- Elements: Nested rectangles with colors, Labels, Hierarchy levels 
- SVG structure: Nested `<rect>` elements + `<text>` labels 
 
**Funnel Chart** 
- Elements: Stacked trapezoids (narrowing), Labels, Values, Conversion rates 
- SVG structure: `<polygon>` trapezoids + `<text>` labels 
 
**Gantt Chart** 
- Elements: Timeline header, Task rows, Task bars (rectangles), Dependencies (arrows), Milestones (diamonds), Today line 
- SVG structure: `<rect>` header + `<rect>` row backgrounds + `<rect>` task bars + `<path>` dependency arrows + `<line>` today marker 
 
**Kanban Board** 
- Elements: Column headers, Cards (rectangles with text), WIP limits, Avatar stacks, Tag badges 
- SVG structure: `<rect>` columns + `<rect>` cards + `<text>` content + `<circle>` avatars 
 
### 2.5 Infographic Design 
 
**Timeline / Roadmap** 
- Types: Vertical, Horizontal, Zigzag, Curved 
- Elements: Timeline line, Milestone points, Content cards, Date labels, Category colors 
- SVG structure: `<line>` or `<path>` timeline + `<circle>` milestones + `<rect>` content cards + `<text>` dates 
 
**Process / Steps** 
- Types: Linear steps, Circular process, Connected cards 
- Elements: Step number circles, Step title, Description, Connector arrows 
- SVG structure: `<circle>` numbers + `<rect>` cards + `<path>` connectors + `<text>` content 
 
**Comparison Table** 
- Elements: Column headers, Feature rows, Checkmarks/crosses, Highlight column 
- SVG structure: `<rect>` table + `<text>` cells + `<path>` checkmarks + `<line>` borders 
 
**Statistics / Metrics** 
- Types: Big number + label, Icon + value + trend, Sparkline + value, Gauge 
- SVG structure: `<text>` large number + `<text>` label + `<path>` icon + `<polyline>` sparkline + `<path>` gauge arc 
 
**Map / Geographic (Simplified)** 
- Elements: Simplified region shapes, Location pins, Labels, Legend 
- SVG structure: `<path>` region outlines + `<path>` pin icons + `<text>` labels 
 
### 2.6 Icon Design 
 
**Icon Types** 
- Outlined (stroke only, 1.5-2px) 
- Filled (solid fill) 
- Duotone (primary fill + secondary fill at lower opacity) 
- Two-tone (two different colors) 
- Thin (1px stroke) 
- Bold (2.5px stroke) 
 
**Icon Grid System** 
- 24×24px canvas (most common) 
- 20×20px canvas (dense UIs) 
- 16×16px canvas (toolbars) 
- 2px padding from edges (effective drawing area: 20×20 for 24px canvas) 
- Pixel grid alignment for crisp rendering 
 
**Icon Categories for Generation** 
- Navigation: Arrow left/right/up/down, Chevron, Menu, More, Close, Expand, Collapse 
- Actions: Add, Remove, Edit, Delete, Copy, Download, Upload, Share, Search, Filter, Sort 
- Content: Document, Image, Video, Audio, Folder, File, Link, Code 
- Communication: Mail, Chat, Phone, Video call, Notification, Bell, Megaphone 
- Social: User, Users, Group, Heart, Star, Bookmark, Thumb up/down 
- Status: Check, Cross, Alert, Info, Help, Warning, Shield, Lock, Unlock 
- Media: Play, Pause, Stop, Skip, Volume, Microphone, Camera 
- Commerce: Cart, Bag, Credit card, Receipt, Tag, Gift, Coupon 
- Time: Clock, Calendar, Timer, Hourglass, History 
- Location: Map pin, Globe, Navigation, Compass, Location 
- Tech: Cloud, Database, Server, Code, Terminal, API, Settings, Cog 
- Abstract: Grid, List, Layers, Zap, Target, Puzzle, Workflow 
 
**SVG Icon Generation Rules** 
- Use `stroke-linecap="round"` and `stroke-linejoin="round"` 
- Use `fill="none"` for outlined icons 
- Snap to half-pixel grid (0.5px) for crisp 1px strokes 
- Use `vector-effect="non-scaling-stroke"` if icon will be resized 
- Prefer straight lines and 90°/45° arcs for consistency 
- Round line caps/joins for friendly feel, butt/square for technical feel 
- Keep path data minimal (fewer commands = cleaner icon) 
- Use `viewBox="0 0 24 24"` standard 
 
### 2.7 Logo Design 
 
**Types** 
- Wordmark (text only, custom lettering) 
- Lettermark (initials, monogram) 
- Brandmark (symbol/icon only) 
- Combination mark (symbol + wordmark) 
- Emblem (text inside shape) 
 
**Logo SVG Rules** 
- Use `<path>` for all shapes (no basic shapes — more control) 
- Use `<text>` with `font-family` specified for wordmarks, or convert to paths 
- Always include viewBox 
- Single color version should work (flat) 
- Ensure readability at 16px and 256px 
- Use mathematical curves (bezier) not freehand 
- Symmetry where intended 
- Consistent stroke weights 
 
### 2.8 Wireframe Design 
 
**Wireframe Style** 
- All elements in grayscale (no color) 
- Text represented as gray bars (`<rect>` with low opacity) instead of actual text 
- Images represented as `<rect>` with X or mountain icon placeholder 
- Buttons as `<rect>` with border, no fill 
- Use consistent gray palette: #FFFFFF bg, #F5F5F5 sections, #E0E0E0 borders, #999999 placeholders, #333333 structure lines 
- Line weight: 1px for borders, 2px for structural elements 
 
**Wireframe Component Set** 
- Placeholder text lines (3-4 `<rect>` bars per paragraph) 
- Placeholder heading (wider, taller bar) 
- Placeholder image (rect with diagonal lines or icon) 
- Placeholder button (rounded rect outline) 
- Placeholder nav (stacked or horizontal bars) 
- Placeholder avatar (circle) 
- Placeholder chart (rect with zigzag line) 
- Placeholder form (stacked rect outlines) 
- Placeholder card (rect with internal bars) 
 
--- 
 
## 3. AI GENERATION PIPELINE 
 
### 3.1 Stage 1: Intent Classification 
 
The AI must first determine what the user wants. Classify into: 
 
``` 
Design Category: 
  ├── UI_COMPONENT (button, input, card, modal, table, nav, etc.) 
  ├── PAGE_LAYOUT (landing, dashboard, settings, pricing, etc.) 
  ├── SYSTEM_DESIGN (architecture, sequence, ERD, flowchart, etc.) 
  ├── DATA_VIZ (bar, line, pie, radar, funnel, etc.) 
  ├── INFOGRAPHIC (timeline, roadmap, process, comparison, stats) 
  ├── ICON_SET (category + style + size) 
  ├── LOGO (type + industry + style) 
  ├── WIREFRAME (page type + fidelity level) 
  └── ILLUSTRATION (scene, style, complexity) 
 
Design Context: 
  ├── Platform: Web / Mobile / Desktop / Responsive 
  ├── Theme: Light / Dark / Both 
  ├── Style: Minimal / Corporate / Playful / Technical / Material / Custom 
  ├── Density: Compact / Default / Comfortable / Spacious 
  └── Audience: Internal / Consumer / Enterprise / Developer 
 
Extraction: 
  ├── Explicit properties (user stated: "red button", "3 columns") 
  ├── Implicit properties (derived: dashboard → needs sidebar, stats cards) 
  ├── Count/quantity (number of items, rows, columns) 
  ├── Content hints (button labels, section titles, placeholder text) 
  └── Relationships (parent-child, flow direction, grouping) 
``` 
 
### 3.2 Stage 2: Design Planning 
 
Before generating SVG, the AI creates an intermediate plan: 
 
``` 
DesignPlan: 
  canvas: 
    width: number 
    height: number 
    viewBox: "0 0 W H" 
    background: color or none 
   
  layers: [ 
    { 
      id: string 
      type: FRAME | GROUP | SHAPE | TEXT | PATH | IMAGE_PLACEHOLDER 
      name: string 
      parent: parentId | null 
      children: [childIds] 
      geometry: 
        x, y, width, height 
        // or path data for PATH type 
        // or text content for TEXT type 
      style: 
        fill: color | gradient | none 
        stroke: color | none 
        strokeWidth: number 
        strokeAlign: inside | center | outside 
        borderRadius: number | {tl, tr, br, bl} 
        opacity: number 
        blendMode: string 
      typography:  // TEXT type only 
        fontFamily: string 
        fontWeight: number 
        fontSize: number 
        lineHeight: number 
        letterSpacing: number 
        textAlign: left | center | right 
        textBaseline: top | middle | bottom 
        color: color 
      layout:  // FRAME type with children 
        direction: horizontal | vertical | none 
        gap: number 
        padding: {top, right, bottom, left} 
        align: start | center | end | stretch 
        justify: start | center | end | space-between 
        wrap: boolean 
    } 
  ] 
   
  connections: [  // for diagrams 
    { 
      from: layerId 
      to: layerId 
      type: solid_arrow | dashed_arrow | dotted_line | solid_line 
      label: string 
      labelPosition: start | middle | end 
    } 
  ] 
   
  metadata: 
    designType: string 
    designSystem: { colors, spacing, typography, radius, shadows } 
    annotations: string[]  // notes for user 
``` 
 
### 3.3 Stage 3: SVG Generation from Plan 
 
Conversion rules from DesignPlan to SVG: 
 
**Frame → `<g>` with transform** 
``` 
<g transform="translate(x, y)"> 
  <!-- children rendered inside --> 
</g> 
``` 
 
**Rectangle → `<rect>`** 
``` 
<rect x="0" y="0" width="W" height="H" rx="R" fill="..." stroke="..." /> 
``` 
 
**Rounded rectangle with per-corner radius → `<path>`** 
``` 
// Must compute arc commands for each corner 
// Top-left: arc from (rx,0) to (0,ry) 
// Top-right: arc from (W-rx,0) to (W,ry) 
// etc. 
``` 
 
**Circle → `<circle>`** 
``` 
<circle cx="CX" cy="CY" r="R" fill="..." /> 
``` 
 
**Ellipse → `<ellipse>`** 
``` 
<ellipse cx="CX" cy="CY" rx="RX" ry="RY" fill="..." /> 
``` 
 
**Line → `<line>`** 
``` 
<line x1="X1" y1="Y1" x2="X2" y2="Y2" stroke="..." stroke-width="..." /> 
``` 
 
**Arrow → `<line>` + `<polygon>` or `<path>` with marker** 
``` 
// Option A: SVG marker 
<defs> 
  <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" 
          markerWidth="6" markerHeight="6" orient="auto"> 
    <path d="M 0 0 L 10 5 L 0 10 z" fill="..." /> 
  </marker> 
</defs> 
<line ... marker-end="url(#arrow)" /> 
 
// Option B: Manual path (more compatible with Figma) 
<path d="M X1 Y1 L X2 Y2" stroke="..." /> 
<polygon points="X2,Y2-4 X2,Y2+4 X2+8,Y2" fill="..." /> 
``` 
 
**Text → `<text>` with `<tspan>`** 
``` 
<text x="X" y="Y" font-family="..." font-size="..." fill="..."> 
  Line 1 
  <tspan x="X" dy="lineHeight">Line 2</tspan> 
</text> 
``` 
 
**Multi-word text wrapping (SVG has no auto-wrap)** 
``` 
// Pre-compute line breaks 
// Split by word, measure cumulative width, break when exceeds container width 
// Use separate <tspan> per line with dy offsets 
``` 
 
**Image placeholder → `<rect>` with pattern** 
``` 
<defs> 
  <pattern id="img-placeholder" width="20" height="20" patternUnits="userSpaceOnUse"> 
    <rect width="20" height="20" fill="#F0F0F0"/> 
    <path d="M0 10h20M10 0v20" stroke="#DDD" stroke-width="0.5"/> 
  </pattern> 
</defs> 
<rect width="W" height="H" fill="url(#img-placeholder)" rx="R"/> 
<!-- Optional: centered image icon --> 
<path d="M X Y (simple mountain/camera icon)" fill="#CCC"/> 
``` 
 
**Gradient fill → `<linearGradient>` or `<radialGradient>` in `<defs>`** 
``` 
<defs> 
  <linearGradient id="grad-1" x1="0" y1="0" x2="1" y2="1"> 
    <stop offset="0%" stop-color="#color1"/> 
    <stop offset="100%" stop-color="#color2"/> 
  </linearGradient> 
</defs> 
<rect ... fill="url(#grad-1)"/> 
``` 
 
**Shadow effect → `<filter>` in `<defs>`** 
``` 
<defs> 
  <filter id="shadow-1" x="-10%" y="-10%" width="130%" height="130%"> 
    <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.1"/> 
  </filter> 
</defs> 
<rect ... filter="url(#shadow-1)"/> 
``` 
 
**Clip path for image in shape → `<clipPath>`** 
``` 
<defs> 
  <clipPath id="clip-1"> 
    <rect width="W" height="H" rx="R"/> 
  </clipPath> 
</defs> 
<image href="..." clip-path="url(#clip-1)" width="W" height="H"/> 
``` 
 
### 3.4 Stage 4: Layout Computation Engine 
 
The AI must compute exact pixel positions. Key algorithms: 
 
**Auto-layout vertical stack** 
``` 
currentY = padding.top 
for each child: 
    child.x = padding.left 
    child.y = currentY 
    currentY += child.height + gap 
container.height = currentY - gap + padding.bottom 
``` 
 
**Auto-layout horizontal stack** 
``` 
currentX = padding.left 
for each child: 
    child.x = currentX 
    child.y = padding.top 
    currentX += child.width + gap 
container.width = currentX - gap + padding.right 
``` 
 
**Center alignment** 
``` 
child.x = (container.width - child.width) / 2 
child.y = (container.height - child.height) / 2 
``` 
 
**Space-between distribution** 
``` 
totalItemWidth = sum(child.width for each child) 
totalGapSpace = container.width - totalItemWidth - padding.left - padding.right 
actualGap = totalGapSpace / (childCount - 1) 
currentX = padding.left 
for each child: 
    child.x = currentX 
    currentX += child.width + actualGap 
``` 
 
**Text measurement estimation** (without DOM) 
``` 
// Approximate character widths by font weight/size 
// Monospace: charWidth ≈ fontSize × 0.6 
// Sans-serif average: charWidth ≈ fontSize × 0.52 
// Serif average: charWidth ≈ fontSize × 0.48 
// More accurate: maintain a lookup table per font at common sizes 
// Or use: width ≈ text.length × fontSize × 0.55 (rough sans-serif) 
``` 
 
**Text line break computation** 
``` 
function wrapText(text, maxWidth, fontSize, fontFamily): 
    words = text.split(' ') 
    lines = [] 
    currentLine = '' 
    for word in words: 
        testLine = currentLine ? currentLine + ' ' + word : word 
        testWidth = estimateTextWidth(testLine, fontSize, fontFamily) 
        if testWidth > maxWidth and currentLine: 
            lines.push(currentLine) 
            currentLine = word 
        else: 
            currentLine = testLine 
    if currentLine: 
        lines.push(currentLine) 
    return lines 
``` 
 
**Aspect ratio containment (image in frame)** 
``` 
scale = min(frameWidth / imageWidth, frameHeight / imageHeight) 
displayWidth = imageWidth * scale 
displayHeight = imageHeight * scale 
offsetX = (frameWidth - displayWidth) / 2 
offsetY = (frameHeight - displayHeight) / 2 
``` 
 
### 3.5 Stage 5: SVG Validation 
 
Check every generated SVG for: 
 
**Structural validity** 
- Well-formed XML (all tags closed, proper nesting) 
- Valid xmlns attribute 
- Valid viewBox format 
- All id attributes are unique within document 
- All url(#id) references point to existing ids 
 
**Rendering correctness** 
- No negative width/height on rects 
- No zero-radius arcs (division by zero) 
- stroke-width > 0 if stroke specified 
- Gradient stops within 0-1 range 
- Opacity values within 0-1 range 
- Font sizes > 0 
- No text positioned outside its container (overflow check) 
 
**Figma compatibility** 
- No `<foreignObject>` (Figma strips these) 
- No `<use>` referencing external files 
- No CSS `@import` or external stylesheet references 
- No `backdrop-filter` (not supported in SVG import) 
- No CSS variables (`var()`) — resolve to actual values 
- All colors in standard format (#hex or rgba()) 
- No `currentColor` keyword (resolve to actual color) 
- Filter regions large enough to avoid clipping 
- No `mix-blend-mode` on elements (limited support in Figma SVG import) 
- Text elements use standard font names 
 
**Visual quality** 
- No overlapping text elements (z-order or position issue) 
- Consistent spacing (verify gap values match design system) 
- Aligned elements (same x, y, or centered within parent) 
- No orphan elements (everything connected to layout) 
- Readable text (sufficient contrast, appropriate size) 
 
**Performance** 
- No deeply nested groups (>10 levels) 
- No excessive number of gradient stops (>10 per gradient) 
- No filter chains longer than 5 primitives 
- No paths with >1000 commands 
 
### 3.6 Stage 6: SVG Post-Processing for Figma 
 
**Add Figma-friendly metadata** 
```xml 
<!-- Figma reads layer names from id or data-name --> 
<rect id="Background" ... /> 
<g id="Header" ...> 
  <text id="Logo-Text" ...>Brand</text> 
</g> 
``` 
 
**Ensure proper grouping** 
``` 
// Each logical component should be a <g> with descriptive id 
// Nested groups mirror Figma's layer tree 
// Order of <g> elements determines z-order (bottom to top) 
``` 
 
**Resolve all CSS to inline styles** 
``` 
// Figma SVG import doesn't support <style> blocks well 
// Convert: <style>.cls-1{fill:red}</style><rect class="cls-1"/> 
// To: <rect fill="red"/> 
``` 
 
**Convert CSS transforms to SVG transform attribute** 
``` 
// Convert: transform: translate(10px, 20px) rotate(45deg) 
// To: transform="translate(10, 20) rotate(45)" 
``` 
 
**Merge overlapping same-style elements where possible** 
``` 
// Two adjacent rects with same fill can become one wider rect 
// Reduces element count, cleaner Figma import 
``` 
 
**Add frame boundaries as transparent rects** 
``` 
// Figma interprets top-level <g> as groups, not frames 
// To get a Frame in Figma, use a <rect> as first child of <g> 
// The rect defines the frame's bounds 
<g id="Card-Frame"> 
  <rect width="300" height="200" fill="none"/>  <!-- frame boundary --> 
  <!-- card contents --> 
</g> 
``` 
 
--- 
 
## 4. DESIGN SYSTEM INTEGRATION 
 
### 4.1 Default Design System (Built-in) 
 
``` 
Colors: 
  Primary:     50:#EEF2FF 100:#E0E7FF 200:#C7D2FE 300:#A5B4FC 400:#818CF8 500:#6366F1 600:#4F46E5 700:#4338CA 800:#3730A3 900:#312E81 
  Neutral:     50:#F9FAFB 100:#F3F4F6 200:#E5E7EB 300:#D1D5DB 400:#9CA3AF 500:#6B7280 600:#4B5563 700:#374151 800:#1F2937 900:#111827 
  Success:     50:#F0FDF4 500:#22C55E 700:#15803D 
  Warning:     50:#FFFBEB 500:#F59E0B 700:#B45309 
  Error:       50:#FEF2F2 500:#EF4444 700:#B91C1C 
  Info:        50:#EFF6FF 500:#3B82F6 700:#1D4ED8 
 
Spacing:       4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 
Typography: 
  Font Family: Inter (fallback: system-ui, sans-serif) 
  Sizes:       10, 11, 12, 13, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72 
  Weights:     400 (regular), 500 (medium), 600 (semibold), 700 (bold) 
  Line Heights: 1.0 (tight), 1.25 (snug), 1.5 (normal), 1.75 (relaxed) 
   
Border Radius: 0 (none), 2 (sm), 4 (default), 6 (md), 8 (lg), 12 (xl), 16 (2xl), 9999 (full) 
Shadows: 
  sm:   0 1 2 0 rgba(0,0,0,0.05) 
  md:   0 4 6 -1 rgba(0,0,0,0.1) 
  lg:   0 10 15 -3 rgba(0,0,0,0.1) 
  xl:   0 20 25 -5 rgba(0,0,0,0.1) 
``` 
 
### 4.2 Custom Design System (User-defined) 
 
Allow users to input or paste their design system: 
 
``` 
User can provide: 
  - Color palette (JSON or paste from Figma variables) 
  - Typography scale (font families, sizes, weights) 
  - Spacing scale 
  - Border radius values 
  - Shadow definitions 
  - Component-specific tokens (button heights, input padding, etc.) 
  - Brand assets (logo SVG, brand colors) 
 
Storage: 
  - Per-user design systems 
  - Per-organization shared design systems 
  - Named versions (v1, v2, etc.) 
  - Import from: Figma variables JSON, Style Dictionary JSON, Tailwind config, manual input 
``` 
 
### 4.3 Design System Application Rules 
 
When generating SVG, the AI must: 
 
1. **Always reference design system tokens, never hardcode values** (unless user explicitly overrides) 
2. **Map semantic names to actual values**: "primary background" → lookup in design system → #6366F1 
3. **Respect spacing scale**: use values from scale, never 13px when scale has 12 and 16 
4. **Match typography hierarchy**: H1=36px bold, H2=24px semibold, Body=14px regular, Caption=12px regular 
5. **Apply consistent border radius**: all buttons use same radius, all cards use same radius 
6. **Use shadow levels consistently**: cards=md, modals=xl, dropdowns=lg 
 
### 4.4 Theme Support 
 
``` 
For each design, support: 
  Light theme (default) 
  Dark theme (invert neutrals, adjust colors) 
  Both (generate two SVGs or one with CSS custom properties) 
 
Dark theme conversion rules: 
  Background: #FFFFFF → #111827 
  Surface: #FFFFFF → #1F2937   
  Border: #E5E7EB → #374151 
  Text primary: #111827 → #F9FAFB 
  Text secondary: #6B7280 → #9CA3AF 
  Primary color: keep same or slightly lighten 
  Shadows: reduce opacity by 50% 
  Reduce colored backgrounds opacity by 30% 
``` 
 
--- 
 
## 5. TEMPLATE SYSTEM 
 
### 5.1 Template Structure 
 
``` 
Template: 
  id: string 
  name: string 
  category: string  // UI, system-design, data-viz, etc. 
  subcategory: string  // button, dashboard, sequence-diagram, etc. 
  description: string  // what it generates 
  tags: string[]  // searchable tags 
  thumbnail: string  // preview SVG 
   
  parameters: [ 
    { 
      name: string 
      type: STRING | NUMBER | BOOLEAN | ENUM | COLOR | FONT 
      default: any 
      options: string[]  // for ENUM type 
      min: number  // for NUMBER 
      max: number  // for NUMBER 
      description: string 
      required: boolean 
    } 
  ] 
   
  designSystemRequired: boolean 
  platform: WEB | MOBILE | DESKTOP | ANY 
   
  generator: function(params, designSystem) → DesignPlan 
  // This is the AI prompt template or function that produces the plan 
``` 
 
### 5.2 Template Examples 
 
**Button Template** 
``` 
Parameters: 
  - label: STRING (default: "Button") 
  - variant: ENUM [primary, secondary, ghost, danger, outline] 
  - size: ENUM [xs, sm, md, lg, xl] 
  - iconLeft: STRING (icon name or none) 
  - iconRight: STRING (icon name or none) 
  - fullWidth: BOOLEAN (default: false) 
  - disabled: BOOLEAN (default: false) 
  - loading: BOOLEAN (default: false) 
  - state: ENUM [default, hover, active, focus] (default: default) 
``` 
 
**Dashboard Template** 
``` 
Parameters: 
  - title: STRING (default: "Dashboard") 
  - sidebarWidth: NUMBER (default: 240) 
  - statCardCount: NUMBER (default: 4, min: 1, max: 6) 
  - statLabels: STRING[] (default: ["Revenue", "Users", "Orders", "Growth"]) 
  - chartType: ENUM [line, bar, area, none] 
  - tableRows: NUMBER (default: 5) 
  - hasActivityFeed: BOOLEAN (default: true) 
  - hasQuickActions: BOOLEAN (default: false) 
``` 
 
**Sequence Diagram Template** 
``` 
Parameters: 
  - participants: STRING[] (default: ["Client", "API Gateway", "Auth Service", "Database"]) 
  - messages: [ 
      { from: STRING, to: STRING, label: STRING, type: ENUM [sync, async, return, self] } 
    ] 
  - fragments: [ 
      { type: ENUM [alt, opt, loop, par], label: STRING, condition: STRING } 
    ] 
  - orientation: ENUM [horizontal, vertical] 
  - style: ENUM [minimal, standard, detailed] 
``` 
 
**Landing Page Template** 
``` 
Parameters: 
  - brandName: STRING 
  - headline: STRING 
  - subheadline: STRING 
  - ctaText: STRING 
  - ctaVariant: ENUM [primary, gradient, outline] 
  - heroLayout: ENUM [centered, split-left, split-right] 
  - featureCount: NUMBER (default: 3, min: 2, max: 6) 
  - featureStyle: ENUM [cards, icons-grid, alternating] 
  - hasSocialProof: BOOLEAN (default: true) 
  - hasTestimonials: BOOLEAN (default: true) 
  - hasPricing: BOOLEAN (default: false) 
  - hasFAQ: BOOLEAN (default: false) 
  - width: ENUM [1280, 1440, 1600] 
``` 
 
### 5.3 Template Discovery & Selection 
 
Users find templates through: 
- **Category browsing**: UI Components, Pages, System Design, Data Viz, Infographics, Icons, Logos, Wireframes 
- **Search**: natural language (" pricing table with 3 columns ") 
- **AI recommendation**: based on project context and history 
- **Popular/trending**: most-used templates 
- **Recent**: user's recent generations 
- **Favorites**: user-bookmarked templates 
 
### 5.4 Template Composition 
 
Allow combining multiple templates: 
- "Create a dashboard with sidebar navigation, 4 stat cards, a bar chart, and a data table" 
- AI decomposes into: Sidebar template + Stat card template × 4 + Bar chart template + Table template 
- Composes them into a single unified SVG layout 
 
--- 
 
## 6. USER INTERACTION FLOWS 
 
### 6.1 Primary Flow: Prompt to SVG 
 
``` 
1. User opens app → sees prompt input (large text area) 
2. User types: "Create a modern SaaS pricing page with 3 plans: Free, Pro ($29/mo), Enterprise (custom)" 
3. AI shows: 
   a. Detected intent: PAGE_LAYOUT → Pricing Page 
   b. Detected parameters: 3 plans, specific names and prices 
   c. Asks clarifying questions (optional, shown as chips): 
      - "Include annual pricing toggle?" [Yes / No] 
      - "Highlight which plan?" [Free / Pro / Enterprise] 
      - "Style preference?" [Minimal / Gradient / Illustrated] 
   d. User clicks options or says "just generate" 
4. AI generates SVG (2-5 seconds) 
5. SVG rendered in preview canvas 
6. User sees: 
   - SVG preview (interactive: zoom, pan) 
   - Generated layer list (like Figma layers panel) 
   - Properties panel (shows design tokens used) 
   - Action bar: [Copy SVG] [Download SVG] [Download PNG] [Edit] [Regenerate] [Variations] 
``` 
 
### 6.2 Flow: Template-Based Generation 
 
``` 
1. User clicks "Templates" in sidebar 
2. Browses to System Design → Sequence Diagram 
3. Selects template 
4. Sees parameter form: 
   - Participants: [Client] [API Gateway] [Auth Service] [Database] [+ Add] 
   - Messages: [Add message: From → To → Label → Type] 
   - Style: [Minimal] [Standard] [Detailed] 
5. User fills in parameters or clicks "Generate with example data" 
6. SVG generated and previewed 
7. Same action bar as above 
``` 
 
### 6.3 Flow: Iterative Refinement 
 
``` 
1. User has generated SVG in preview 
2. User types refinement: "Make the Pro plan highlighted with a gradient border" 
3. AI generates modified SVG (only changes affected parts) 
4. Preview updates with diff highlighted (optional) 
5. User can undo/redo through generation history 
6. Multiple refinement rounds supported 
``` 
 
### 6.4 Flow: Design System Application 
 
``` 
1. User goes to Settings → Design Systems → Create New 
2. Enters design system name: "Acme Brand" 
3. Inputs tokens via: 
   - JSON paste 
   - Manual form (color pickers, number inputs) 
   - Import from Figma (paste Figma variables JSON) 
4. Saves design system 
5. In prompt, selects "Acme Brand" from design system dropdown 
6. All generations now use Acme Brand tokens 
7. Can also apply retroactively: "Re-style this pricing page with Acme Brand" 
``` 
 
### 6.5 Flow: Batch Generation 
 
``` 
1. User wants icon set: "Generate a complete set of 20 navigation icons in outlined style, 24px" 
2. AI generates all 20 icons as individual SVGs 
3. Displayed as grid of icon previews 
4. User can: 
   - Select all → Download as ZIP (individual SVGs) 
   - Download as sprite sheet (single SVG with <symbol> elements) 
   - Download as React component file 
   - Copy individual icons 
``` 
 
### 6.6 Flow: System Design Generation 
 
``` 
1. User types: "Create a microservices architecture for an e-commerce platform with: API Gateway, User Service, Product Service, Order Service, Payment Service, Notification Service, PostgreSQL per service, Redis for caching, RabbitMQ for events, Kafka for event streaming" 
2. AI generates layered architecture diagram: 
   - Top: Client layer (Web, Mobile) 
   - Middle: API Gateway 
   - Service layer: 5 services in a row 
   - Data layer: PostgreSQL instances, Redis, RabbitMQ, Kafka 
   - Arrows showing communication 
3. User refines: "Add a service mesh between API Gateway and services" 
4. AI adds Istio/Envoy sidecar pattern 
5. User exports as SVG → imports into Figma → adds to technical documentation 
``` 
 
--- 
 
## 7. FIGMA IMPORT COMPATIBILITY (Critical) 
 
### 7.1 How Figma Imports SVG 
 
When you drag an SVG file into Figma: 
 
- Each `<g>` becomes a Group layer 
- Each `<rect>`, `<circle>`, `<ellipse>`, `<line>`, `<polygon>`, `<polyline>` becomes its corresponding shape layer 
- Each `<path>` becomes a Vector layer 
- Each `<text>` becomes a Text layer (preserves font, size, weight, color) 
- Each `<image>` becomes an Image layer (if embedded base64 or URL accessible) 
- `<clipPath>` becomes a Mask on the clipped element 
- `<mask>` becomes a Mask with alpha 
- `<linearGradient>` / `<radialGradient>` become fills on the element 
- `<filter>` effects: Figma tries to interpret (blur works, complex filters may be stripped) 
- `transform` attribute is decomposed into Figma's transform properties 
- `opacity` attribute maps to layer opacity 
- `fill` attribute maps to layer fill 
- `stroke` attributes map to layer stroke 
- `id` attribute becomes the layer name 
- Nested `<svg>` elements become Frame layers 
- `<defs>` content is parsed but not shown as layers (used as references) 
- `<use>` elements are resolved (the referenced content is inlined) 
- `<symbol>` elements are expanded when referenced by `<use>` 
 
### 7.2 SVG Rules for Optimal Figma Import 
 
**DO:** 
- Use descriptive `id` attributes on every `<g>` and shape (these become layer names) 
- Group related elements in `<g>` with semantic ids: `id="Card-Background"`, `id="Button-Primary"` 
- Use standard SVG shapes where possible (Figma keeps them editable) 
- Use `<text>` for text (Figma makes it editable) 
- Use `<clipPath>` with simple shapes for masking 
- Use simple `<filter>` with only `<feGaussianBlur>` and `<feOffset>` for shadows 
- Use `<linearGradient>` and `<radialGradient>` for gradient fills 
- Use `viewBox` on root `<svg>` for proper scaling 
- Inline all styles (no `<style>` block) 
- Use `fill` and `stroke` attributes directly on elements 
- Use `font-family`, `font-size`, `font-weight` attributes on `<text>` 
- Use `transform="translate(x,y) rotate(deg) scale(sx,sy)"` format 
 
**DON'T:** 
- Don't use `<foreignObject>` (completely ignored by Figma) 
- Don't use CSS classes or `<style>` blocks (Figma ignores them) 
- Don't use `currentColor` (resolve to actual hex color) 
- Don't use CSS `var()` custom properties (resolve to values) 
- Don't use `backdrop-filter` (ignored) 
- Don't use `mix-blend-mode` (ignored in SVG import) 
- Don't reference external files in `<use href="other.svg#..."` (won't resolve) 
- Don't use `<animate>` elements (Figma strips them) 
- Don't use `filter` with complex chains (`feTurbulence`, `feDisplacementMap`, `feColorMatrix` — may be stripped or broken) 
- Don't use `textPath` (inconsistent import, often breaks) 
- Don't use `writing-mode: vertical` (Figma doesn't support vertical text well from SVG) 
- Don't use `overflow: hidden` on groups (use `<clipPath>` instead) 
- Don't nest transforms in complex ways (decompose to single transform per element) 
- Don't use `stroke-dasharray` for complex patterns (simple dashes work) 
- Don't use `paint-order` (ignored) 
 
### 7.3 Layer Naming Convention for Figma 
 
``` 
Root <svg> → becomes Frame named by filename or "SVG Image" 
 
Recommended naming pattern: 
  <g id="Page: Pricing">           → Frame "Page: Pricing" 
    <g id="Section: Hero">         → Group "Section: Hero" 
      <rect id="BG-Gradient"/>     → Rectangle "BG-Gradient" 
      <text id="Headline"/>        → Text "Headline" 
      <g id="CTA-Button">          → Group "CTA-Button" 
        <rect id="Button-Shape"/>  → Rectangle "Button-Shape" 
        <text id="Button-Label"/>  → Text "Button-Label" 
    <g id="Section: Plans">        → Group "Section: Plans" 
      <g id="Plan: Free">          → Group "Plan: Free" 
        ... 
      <g id="Plan: Pro">           → Group "Plan: Pro" 
        ... 
 
Pattern: Category: Name or Type: Name 
Categories: Page, Section, Component, Group, Plan, Row, Cell, etc. 
Types: BG, Header, Body, Footer, Label, Value, Icon, etc. 
``` 
 
### 7.4 Text Import Optimization 
 
``` 
Figma SVG text import behavior: 
- Single <text> element → single Text layer 
- <text> with <tspan> → single Text layer with line breaks 
- Each <tspan> with different style → character-level overrides in Figma 
- font-family → Figma text font (must match installed font or Figma font) 
- font-size → Figma font size 
- font-weight → Figma font weight 
- fill → Figma text color 
- text-anchor → Figma text alignment (start=left, middle=center, end=right) 
- letter-spacing → Figma letter spacing 
- No line-height in SVG → Figma uses auto line height (can be adjusted post-import) 
 
Best practice: 
- Use common web fonts: Inter, Roboto, Open Sans, system-ui, Arial, Helvetica 
- For custom fonts, note that Figma needs the font installed 
- Include font-family with fallbacks: font-family="Inter, Roboto, system-ui, sans-serif" 
- Use pixel values for font-size: font-size="16" (not pt, em, rem) 
- Break lines with <tspan x="X" dy="LINE_HEIGHT"> for multi-line text 
``` 
 
### 7.5 Export Package Format 
 
When user downloads, provide multiple options: 
 
``` 
Option 1: Single SVG File 
- Clean, optimized SVG with descriptive layer names 
- Ready to drag into Figma 
 
Option 2: SVG + Metadata JSON 
- SVG file + companion JSON with: 
  - Design tokens used 
  - Layer hierarchy documentation 
  - Color palette 
  - Typography specs 
  - Spacing values 
  - Component annotations 
 
Option 3: Figma-Ready ZIP 
- SVG file (optimized for Figma import) 
- README.md with import instructions 
- Token JSON file 
- Component specification document 
 
Option 4: Multi-Asset Package 
- Individual SVG files per component (if batch generated) 
- Sprite sheet SVG 
- Icon font files (if icon set) 
- React/Vue components with inline SVG 
``` 
 
--- 
 
## 8. AI PROMPT ENGINEERING ARCHITECTURE 
 
### 8.1 System Prompt Structure 
 
The AI system prompt should be structured as: 
 
``` 
You are an expert design-to-SVG converter. You generate production-quality SVG code 
that imports cleanly into Figma. 
 
## Output Format 
You MUST output ONLY valid SVG code wrapped in <svg>...</svg> tags. 
No explanations, no markdown, no code fences. 
 
## Design System 
[Inject current design system tokens here] 
 
## SVG Rules 
[Inject Figma-compatible SVG rules from Section 7.2] 
 
## Layout Rules 
- All positions in pixels, integers preferred 
- Use consistent spacing from the design system 
- Compute text wrapping manually (SVG has no auto-wrap) 
- Group related elements in <g> with descriptive id attributes 
- Z-order: elements rendered bottom-to-top in document order 
 
## Current Request 
[User prompt here] 
``` 
 
### 8.2 Prompt Chaining Strategy 
 
**Chain 1: Classification** 
``` 
Input: User prompt 
Output: JSON { designType, subType, parameters[], complexity, canvasSize } 
Purpose: Route to appropriate generation strategy 
``` 
 
**Chain 2: Planning** 
``` 
Input: Classification output + design system 
Output: DesignPlan JSON (from Section 3.2) 
Purpose: Structured intermediate representation 
``` 
 
**Chain 3: SVG Generation** 
``` 
Input: DesignPlan + design system + SVG rules 
Output: SVG code 
Purpose: Actual SVG production 
``` 
 
**Chain 4: Validation** 
``` 
Input: Generated SVG 
Output: ValidationReport { valid: boolean, errors: [], warnings: [], fixes: [] } 
Purpose: Quality assurance 
``` 
 
**Chain 5: Fix (if needed)** 
``` 
Input: SVG + ValidationReport 
Output: Fixed SVG 
Purpose: Auto-repair common issues 
``` 
 
### 8.3 Few-Shot Examples for AI 
 
For each design type, maintain 3-5 high-quality examples: 
 
**Example: Button (Primary, Medium)** 
```xml 
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="120" height="40"> 
  <defs> 
    <linearGradient id="btn-grad" x1="0" y1="0" x2="1" y2="0"> 
      <stop offset="0%" stop-color="#6366F1"/> 
      <stop offset="100%" stop-color="#8B5CF6"/> 
    </linearGradient> 
  </defs> 
  <g id="Button-Primary-MD"> 
    <rect id="Button-Shape" width="120" height="40" rx="8" fill="url(#btn-grad)"/> 
    <text id="Button-Label" x="60" y="25" font-family="Inter, system-ui, sans-serif"  
          font-size="14" font-weight="600" fill="#FFFFFF" text-anchor="middle">Get Started</text> 
  </g> 
</svg> 
``` 
 
**Example: Sequence Diagram (Simplified)** 
```xml 
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"> 
  <defs> 
    <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5"  
            markerWidth="6" markerHeight="6" orient="auto-start-reverse"> 
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#374151"/> 
    </marker> 
  </defs> 
  <!-- Participants --> 
  <g id="Participant-Client"> 
    <rect x="20" y="10" width="80" height="36" rx="6" fill="#EEF2FF" stroke="#6366F1" stroke-width="1.5"/> 
    <text x="60" y="33" font-family="Inter, system-ui" font-size="13" font-weight="600"  
          fill="#4338CA" text-anchor="middle">Client</text> 
    <line x1="60" y1="46" x2="60" y2="380" stroke="#D1D5DB" stroke-width="1" stroke-dasharray="4 3"/> 
  </g> 
  <!-- More participants... --> 
  <!-- Messages --> 
  <line x1="60" y1="80" x2="200" y2="80" stroke="#374151" stroke-width="1.5" marker-end="url(#arrowhead)"/> 
  <text x="130" y="73" font-family="Inter, system-ui" font-size="11" fill="#6B7280" text-anchor="middle">POST /login</text> 
  <!-- More messages... --> 
</svg> 
``` 
 
### 8.4 Refinement Prompt Pattern 
 
``` 
Context: 
- You previously generated [SVG] for [design description] 
- The user wants to modify it 
 
Modification request: "[user refinement prompt]" 
 
Rules: 
- Keep all unchanged elements exactly as they are 
- Only modify elements affected by the request 
- Maintain the same coordinate system and viewBox 
- Preserve all id naming conventions 
- Recompute positions if layout changes affect spacing 
``` 
 
### 8.5 Error Recovery Prompts 
 
``` 
The following SVG has errors: 
[Validation errors list] 
 
Fix each error: 
1. [Error description] → [Fix instruction] 
2. [Error description] → [Fix instruction] 
 
Output the corrected SVG. Keep everything else identical. 
``` 
 
--- 
 
## 9. SAAS PRODUCT FEATURES 
 
### 9.1 Core Features 
 
**Prompt Studio** 
- Large text input with character count 
- Prompt templates (quick-fill prompts for common designs) 
- Prompt history (sidebar list, click to reload) 
- Prompt enhancement (AI rewrites prompt for better results) 
- Parameter extraction (AI identifies configurable params from prompt, shows as editable fields) 
 
**Canvas Preview** 
- SVG rendering in browser 
- Zoom (scroll wheel), pan (drag), fit to screen 
- Ruler guides (optional toggle) 
- Grid overlay (optional toggle) 
- Dark/light canvas background toggle 
- Element highlight on hover (show element id/name) 
- Selection (click to select, show properties) 
 
**Properties Panel** 
- Shows design tokens used in generated SVG 
- Editable token values → triggers regeneration with new values 
- Color palette display 
- Typography summary 
- Spacing summary 
- Copy individual tokens 
 
**Layer Panel** 
- Tree view of SVG element hierarchy 
- Click to highlight element on canvas 
- Toggle visibility (for preview comparison) 
- Shows element type icon and name 
 
**Export Panel** 
- Format: SVG, PNG, PDF 
- Scale: 1x, 2x, 3x, 4x (for PNG) 
- Background: transparent, white, custom color 
- Figma-optimized toggle (apply post-processing) 
- Naming convention input 
- Download or copy to clipboard 
 
**History Panel** 
- Timeline of all generations in current session 
- Thumbnail previews 
- Click to restore previous version 
- Diff view (highlight changes between versions) 
- Branch from any point (fork history) 
 
### 9.2 Project Management 
 
**Projects** 
- Group related designs into projects 
- Project-level design system assignment 
- Project dashboard with all designs 
- Share project with team members 
- Project templates (pre-configured for common project types) 
 
**Collections** 
- Save favorite generations 
- Organize by tag/category 
- Quick access panel 
 
**Folders** 
- Hierarchical folder structure 
- Drag-and-drop organization 
- Folder-level sharing 
 
### 9.3 Collaboration Features 
 
**Sharing** 
- Share individual design via link (view-only) 
- Share with edit permission 
- Embed in external tools (notion, confluence) via iframe 
- Public gallery (opt-in) 
 
**Comments** 
- Comment on specific designs 
- @mention team members 
- Thread replies 
- Resolve comments 
 
**Version Control** 
- Named versions (like Figma's save to history) 
- Compare versions side-by-side 
- Restore any version 
- Branch and merge (advanced) 
 
### 9.4 Integration Features 
 
**Figma Plugin** 
- Plugin that sends Figma selection to your SaaS 
- Plugin that receives generated SVG and inserts into Figma canvas 
- Plugin that reads Figma design system variables 
 
**API Access** 
- REST API for programmatic generation 
- Webhook for async generation 
- API key management 
- Rate limiting and usage tracking 
- SDK: JavaScript/TypeScript, Python 
 
**CLI Tool** 
- `designgen "Create a login form" --design-system acme --format svg --output ./` 
- Batch generation from JSON config 
- CI/CD integration (generate design assets in pipeline) 
 
**Third-party Integrations** 
- Slack bot: generate designs from Slack messages 
- Notion block: embed generated designs 
- GitHub Action: generate diagrams from code architecture comments 
- Linear/Jira: generate system diagrams from issue descriptions 
 
### 9.5 Advanced Features 
 
**Design-to-Design Translation** 
- Upload existing SVG → AI analyzes → Generate modified version 
- "Make this design dark mode" 
- "Convert this wireframe to high-fidelity" 
- "Restyle this with our brand design system" 
 
**Design Variations** 
- Generate N variations of same prompt 
- Variation axes: color scheme, layout density, style (minimal/corporate/playful), spacing 
- Side-by-side comparison view 
- Select best variation → iterate further 
 
**Design Assembly** 
- Combine multiple generated components into a page 
- Drag-and-drop interface 
- AI fills gaps (spacing, alignment) 
- Export assembled page as single SVG 
 
**Smart Suggestions** 
- After generating a button: "You might also need: Input field, Form, Modal" 
- After generating a dashboard: "Add: Chart, Table, Activity feed" 
- Context-aware based on what's already in the project 
 
**Design Lint** 
- Analyze any SVG for design quality issues: 
  - Inconsistent spacing 
  - Misaligned elements 
  - Poor contrast ratios 
  - Non-standard typography scale 
  - Missing accessibility labels 
- Provide fix suggestions 
 
**Design Token Extractor** 
- Upload any SVG → Extract colors, fonts, spacing, radius 
- Generate design system JSON from existing design 
- Compare against your design system → show mismatches 
 
--- 
 

 
## 11. TECHNICAL STACK RECOMMENDATIONS 
 
### 11.1 Frontend 
- **Framework**: Next.js
- **Canvas/Preview**: Raw SVG DOM rendering (not Canvas API) for fidelity 
- **State Management**: Zustand (lightweight, works with SVG state) 
- **UI Components**: Shadcn/ui + Tailwind CSS 
- **Code Editor** (for prompt): Monaco Editor (with syntax highlighting for parameter editing) 
- **Pan/Zoom**: d3-zoom or custom transform handling 
- **Drag-and-Drop**: dnd-kit (for design assembly feature) 


 

--- 
### 12.3 Human Feedback Loop 
 
- Thumbs up/down on each generation 
- "What's wrong?" feedback form 
- Store feedback → train classifier on what makes good vs bad output 
- Use feedback to rank few-shot examples (better examples get higher priority) 
- Monthly review of low-score generations → improve prompts 
 
--- 
 
## 14. ROADMAP PRIORITY 
 
### Phase 1: MVP (Weeks 1-8) 
- Prompt input + SVG generation (UI components only) 
- Canvas preview with zoom/pan 
- SVG download 
- Basic design system (built-in only) 
- 10 component templates 
- User accounts + billing 
- Figma-compatible SVG output 
 
### Phase 2: Expansion (Weeks 9-16) 
- Page layout generation (landing, dashboard, auth) 
- System design diagrams (flowchart, sequence, architecture) 
- Data visualization (bar, line, pie charts) 
- Custom design systems 
- Iterative refinement ("make it darker", "add a shadow") 
- PNG export 
- Generation history 
 
### Phase 3: Professional (Weeks 17-24) 
- Infographic generation 
- Icon set generation (batch) 
- Wireframe generation 
- Logo generation 
- Design assembly (combine components) 
- Figma plugin 
- REST API 
- Team collaboration 
 
### Phase 4: Scale (Weeks 25-36) 
- Template marketplace 
- Design-to-design translation 
- Design lint / quality scoring 
- CI/CD integrations 
- Slack/Notion integrations 
- Advanced system design (C4, Kubernetes, cloud-specific) 
- Fine-tuned models 
- Enterprise features (SSO, on-premise) 
 
--- 
