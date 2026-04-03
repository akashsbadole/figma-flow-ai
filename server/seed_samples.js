import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.VITE_DATABASE_URL,
});

const samples = [
  // --- EXISTING SAMPLES ---
  {
    name: 'Advanced Microservices Architecture',
    category: 'System Design',
    description: 'A detailed microservices system design with Load Balancer, API Gateway, and multiple services.',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=400&h=300',
    svg_code: `<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#F8FAFC" />
  <g id="System-Design">
    <rect x="50" y="150" width="120" height="60" rx="8" fill="#6366F1" />
    <text x="110" y="185" fill="white" font-family="Inter, sans-serif" font-size="12" font-weight="600" text-anchor="middle">Load Balancer</text>
    <path d="M 170 180 L 230 130" stroke="#94A3B8" stroke-width="2" marker-end="url(#arrow)" fill="none" />
    <path d="M 170 180 L 230 230" stroke="#94A3B8" stroke-width="2" marker-end="url(#arrow)" fill="none" />
    <rect x="240" y="80" width="120" height="60" rx="8" fill="#F0FDF4" stroke="#22C55E" />
    <text x="300" y="115" fill="#15803D" font-family="Inter, sans-serif" font-size="12" font-weight="600" text-anchor="middle">API Gateway A</text>
    <rect x="240" y="220" width="120" height="60" rx="8" fill="#F0FDF4" stroke="#22C55E" />
    <text x="300" y="255" fill="#15803D" font-family="Inter, sans-serif" font-size="12" font-weight="600" text-anchor="middle">API Gateway B</text>
    <rect x="450" y="50" width="100" height="50" rx="4" fill="white" stroke="#E2E8F0" />
    <text x="500" y="80" fill="#64748B" font-family="Inter, sans-serif" font-size="10" text-anchor="middle">User Service</text>
    <rect x="450" y="120" width="100" height="50" rx="4" fill="white" stroke="#E2E8F0" />
    <text x="500" y="150" fill="#64748B" font-family="Inter, sans-serif" font-size="10" text-anchor="middle">Order Service</text>
    <rect x="450" y="190" width="100" height="50" rx="4" fill="white" stroke="#E2E8F0" />
    <text x="500" y="220" fill="#64748B" font-family="Inter, sans-serif" font-size="10" text-anchor="middle">Payment Service</text>
    <path d="M 650 150 C 650 140 750 140 750 150 L 750 250 C 750 260 650 260 650 250 Z" fill="#EFF6FF" stroke="#3B82F6" />
    <ellipse cx="700" cy="150" rx="50" ry="10" fill="#DBEAFE" stroke="#3B82F6" />
    <text x="700" y="205" fill="#1D4ED8" font-family="Inter, sans-serif" font-size="12" font-weight="600" text-anchor="middle">PostgreSQL</text>
  </g>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8"/>
    </marker>
  </defs>
</svg>`,
    metadata: { type: 'SYSTEM_DESIGN', tags: ['architecture', 'microservices'] }
  },
  {
    name: 'SaaS Dashboard Layout',
    category: 'Template Generations',
    description: 'A modern SaaS dashboard with sidebar navigation and metrics grid.',
    image_url: 'https://images.unsplash.com/photo-1551288049-bbbda5366391?auto=format&fit=crop&q=80&w=400&h=300',
    svg_code: `<svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="800" fill="#F1F5F9" />
  <rect width="240" height="800" fill="white" />
  <rect x="0" y="0" width="240" height="64" fill="#1E293B" />
  <text x="30" y="40" fill="white" font-family="Inter, sans-serif" font-size="20" font-weight="700">FigmaFlow</text>
  <g id="Nav-Items" transform="translate(20, 100)">
    <rect width="200" height="40" rx="6" fill="#F8FAFC" />
    <text x="15" y="25" fill="#6366F1" font-family="Inter, sans-serif" font-size="14" font-weight="600">Dashboard</text>
    <text x="15" y="75" fill="#64748B" font-family="Inter, sans-serif" font-size="14">Projects</text>
    <text x="15" y="115" fill="#64748B" font-family="Inter, sans-serif" font-size="14">Designs</text>
    <text x="15" y="155" fill="#64748B" font-family="Inter, sans-serif" font-size="14">Settings</text>
  </g>
  <rect x="240" y="0" width="1040" height="64" fill="white" />
  <text x="270" y="40" fill="#1E293B" font-family="Inter, sans-serif" font-size="18" font-weight="600">Overview</text>
  <g id="Stats-Grid" transform="translate(270, 94)">
    <rect width="230" height="120" rx="12" fill="white" stroke="#E2E8F0" />
    <text x="20" y="40" fill="#64748B" font-family="Inter, sans-serif" font-size="14">Total Generations</text>
    <text x="20" y="80" fill="#1E293B" font-family="Inter, sans-serif" font-size="32" font-weight="700">1,284</text>
    <rect x="250" y="0" width="230" height="120" rx="12" fill="white" stroke="#E2E8F0" />
    <text x="270" y="40" fill="#64748B" font-family="Inter, sans-serif" font-size="14">Active Projects</text>
    <text x="270" y="80" fill="#1E293B" font-family="Inter, sans-serif" font-size="32" font-weight="700">42</text>
    <rect x="500" y="0" width="230" height="120" rx="12" fill="white" stroke="#E2E8F0" />
    <text x="520" y="40" fill="#64748B" font-family="Inter, sans-serif" font-size="14">Team Members</text>
    <text x="520" y="80" fill="#1E293B" font-family="Inter, sans-serif" font-size="32" font-weight="700">12</text>
  </g>
  <rect x="270" y="240" width="980" height="520" rx="16" fill="white" stroke="#E2E8F0" />
  <text x="300" y="280" fill="#1E293B" font-family="Inter, sans-serif" font-size="16" font-weight="600">Usage Over Time</text>
</svg>`,
    metadata: { type: 'PAGE_LAYOUT', tags: ['dashboard', 'saas'] }
  },
  {
    name: 'Modern Hero Section',
    category: 'Template Generations',
    description: 'High-converting landing page hero section.',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400&h=300',
    svg_code: `<svg width="1440" height="600" viewBox="0 0 1440 600" xmlns="http://www.w3.org/2000/svg">
  <rect width="1440" height="600" fill="#0F172A" />
  <g id="Hero-Section">
    <text x="720" y="200" fill="white" font-family="Inter, sans-serif" font-size="60" font-weight="800" text-anchor="middle">Design at the Speed of Thought</text>
    <text x="720" y="260" fill="#94A3B8" font-family="Inter, sans-serif" font-size="20" text-anchor="middle">Convert your ideas into Figma-ready designs in seconds using AI.</text>
    <rect x="600" y="320" width="240" height="56" rx="28" fill="#6366F1" />
    <text x="720" y="355" fill="white" font-family="Inter, sans-serif" font-size="18" font-weight="600" text-anchor="middle">Get Started for Free</text>
    <circle cx="200" cy="400" r="100" fill="#6366F1" fill-opacity="0.2" />
    <rect x="1100" y="100" width="200" height="200" rx="40" fill="#3B82F6" fill-opacity="0.1" transform="rotate(15 1200 200)" />
  </g>
</svg>`,
    metadata: { type: 'PAGE_LAYOUT', tags: ['landing-page', 'hero'] }
  },

  // --- NEW SAMPLES ---

  // Data Viz
  {
    name: 'Analytics Line Chart',
    category: 'Data Viz',
    description: 'A multi-series analytics line chart with interactive looking axes and legend.',
    image_url: 'https://images.unsplash.com/photo-1551288049-bbbda5366391?auto=format&fit=crop&q=80&w=400&h=300',
    svg_code: `<svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" fill="white" />
  <g id="Line-Chart" transform="translate(50, 50)">
    <!-- Grid Lines -->
    <line x1="0" y1="0" x2="500" y2="0" stroke="#F1F5F9" />
    <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" />
    <line x1="0" y1="200" x2="500" y2="200" stroke="#F1F5F9" />
    <line x1="0" y1="300" x2="500" y2="300" stroke="#CBD5E1" stroke-width="2" />

    <!-- Y-Axis Labels -->
    <text x="-10" y="5" fill="#94A3B8" font-family="Inter" font-size="10" text-anchor="end">100%</text>
    <text x="-10" y="105" fill="#94A3B8" font-family="Inter" font-size="10" text-anchor="end">50%</text>
    <text x="-10" y="305" fill="#94A3B8" font-family="Inter" font-size="10" text-anchor="end">0%</text>

    <!-- Data Lines -->
    <path d="M 0 200 L 100 150 L 200 180 L 300 80 L 400 120 L 500 50" fill="none" stroke="#6366F1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 0 250 L 100 220 L 200 240 L 300 200 L 400 180 L 500 150" fill="none" stroke="#22C55E" stroke-width="3" stroke-dasharray="6 4" />

    <!-- Points -->
    <circle cx="300" cy="80" r="4" fill="#6366F1" stroke="white" stroke-width="2" />
    <circle cx="500" cy="50" r="4" fill="#6366F1" stroke="white" stroke-width="2" />

    <!-- Legend -->
    <g transform="translate(0, 330)">
      <rect width="12" height="12" rx="2" fill="#6366F1" />
      <text x="18" y="10" fill="#475569" font-family="Inter" font-size="12">Current Period</text>
      <rect x="120" width="12" height="12" rx="2" fill="#22C55E" />
      <text x="138" y="10" fill="#475569" font-family="Inter" font-size="12">Previous Period</text>
    </g>
  </g>
</svg>`,
    metadata: { type: 'DATA_VIZ', tags: ['chart', 'analytics'] }
  },

  // Infographic
  {
    name: 'Product Roadmap Timeline',
    category: 'Infographic',
    description: 'A professional horizontal roadmap timeline with milestones and icons.',
    image_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400&h=300',
    svg_code: `<svg width="800" height="300" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="300" fill="#F8FAFC" />
  <g id="Roadmap" transform="translate(50, 150)">
    <!-- Main Line -->
    <line x1="0" y1="0" x2="700" y2="0" stroke="#E2E8F0" stroke-width="4" stroke-linecap="round" />

    <!-- Milestones -->
    <g id="Q1" transform="translate(50, 0)">
      <circle r="8" fill="#6366F1" />
      <text y="-25" fill="#1E293B" font-family="Inter" font-size="14" font-weight="700" text-anchor="middle">Phase 1</text>
      <text y="25" fill="#64748B" font-family="Inter" font-size="12" text-anchor="middle">Research & Discovery</text>
    </g>

    <g id="Q2" transform="translate(250, 0)">
      <circle r="8" fill="#6366F1" />
      <text y="-25" fill="#1E293B" font-family="Inter" font-size="14" font-weight="700" text-anchor="middle">Phase 2</text>
      <text y="25" fill="#64748B" font-family="Inter" font-size="12" text-anchor="middle">Design System v1</text>
    </g>

    <g id="Q3" transform="translate(450, 0)">
      <circle r="8" fill="#94A3B8" />
      <text y="-25" fill="#1E293B" font-family="Inter" font-size="14" font-weight="700" text-anchor="middle">Phase 3</text>
      <text y="25" fill="#64748B" font-family="Inter" font-size="12" text-anchor="middle">Alpha Launch</text>
    </g>

    <g id="Q4" transform="translate(650, 0)">
      <circle r="8" fill="#94A3B8" />
      <text y="-25" fill="#1E293B" font-family="Inter" font-size="14" font-weight="700" text-anchor="middle">Phase 4</text>
      <text y="25" fill="#64748B" font-family="Inter" font-size="12" text-anchor="middle">Public Beta</text>
    </g>
  </g>
</svg>`,
    metadata: { type: 'INFOGRAPHIC', tags: ['roadmap', 'timeline'] }
  },

  // Icon Set
  {
    name: 'Essential UI Icons',
    category: 'Icon Set',
    description: 'A 24x24 grid based essential icon set for web and mobile interfaces.',
    image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=400&h=300',
    svg_code: `<svg width="400" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="200" fill="white" />
  <g id="Icons" fill="none" stroke="#1E293B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <!-- Search Icon -->
    <g id="Search" transform="translate(50, 50)">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </g>
    <!-- Home Icon -->
    <g id="Home" transform="translate(150, 50)">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </g>
    <!-- Settings Icon -->
    <g id="Settings" transform="translate(250, 50)">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </g>
    <!-- User Icon -->
    <g id="User" transform="translate(350, 50)">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </g>
  </g>
  <text x="200" y="150" fill="#64748B" font-family="Inter" font-size="12" text-anchor="middle">SVG Stroke Icons - Optimized for Figma</text>
</svg>`,
    metadata: { type: 'ICON_SET', tags: ['icons', 'ui'] }
  },

  // Logo
  {
    name: 'Tech Monogram Logo',
    category: 'Logo',
    description: 'Modern geometric monogram logo for a technology brand.',
    image_url: 'https://images.unsplash.com/photo-1599305090598-fe179d501c27?auto=format&fit=crop&q=80&w=400&h=300',
    svg_code: `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#1E293B" />
  <g id="Logo" transform="translate(100, 100)">
    <!-- Outer Shield -->
    <path d="M100 0 L186 50 V150 L100 200 L14 150 V50 Z" fill="#6366F1" />
    <!-- Inner Geometric M -->
    <path d="M60 80 L100 120 L140 80 V150 H120 V110 L100 130 L80 110 V150 H60 Z" fill="white" />
    <!-- Monogram Text -->
    <text x="100" y="260" fill="white" font-family="Inter" font-size="32" font-weight="800" text-anchor="middle" letter-spacing="4">META-GEN</text>
    <text x="100" y="290" fill="#94A3B8" font-family="Inter" font-size="14" text-anchor="middle">TECHNOLOGIES</text>
  </g>
</svg>`,
    metadata: { type: 'LOGO', tags: ['monogram', 'brand'] }
  },

  // Wireframe
  {
    name: 'Low-Fidelity Wireframe',
    category: 'Wireframe',
    description: 'Grayscale wireframe layout for a blog post or article page.',
    image_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=400&h=300',
    svg_code: `<svg width="800" height="1000" viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="1000" fill="#F9FAFB" />
  <g id="Wireframe">
    <!-- Navbar Wireframe -->
    <rect width="800" height="60" fill="#E5E7EB" />
    <rect x="40" y="15" width="120" height="30" fill="#D1D5DB" />
    <rect x="500" y="20" width="60" height="20" fill="#D1D5DB" />
    <rect x="580" y="20" width="60" height="20" fill="#D1D5DB" />
    <rect x="660" y="20" width="100" height="20" fill="#D1D5DB" />

    <!-- Hero Section Wireframe -->
    <rect x="40" y="100" width="720" height="300" fill="#F3F4F6" stroke="#D1D5DB" />
    <rect x="80" y="150" width="400" height="40" fill="#E5E7EB" />
    <rect x="80" y="205" width="400" height="20" fill="#E5E7EB" />
    <rect x="80" y="235" width="300" height="20" fill="#E5E7EB" />
    <rect x="80" y="280" width="120" height="40" rx="4" fill="#D1D5DB" />

    <!-- Content Section -->
    <g transform="translate(40, 450)">
      <rect width="460" height="400" fill="white" stroke="#E5E7EB" />
      <rect x="20" y="30" width="420" height="25" fill="#F3F4F6" />
      <rect x="20" y="70" width="420" height="15" fill="#F3F4F6" />
      <rect x="20" y="95" width="420" height="15" fill="#F3F4F6" />
      <rect x="20" y="120" width="300" height="15" fill="#F3F4F6" />

      <rect x="20" y="160" width="420" height="180" fill="#F9FAFB" stroke="#F3F4F6" />
    </g>

    <!-- Sidebar -->
    <g transform="translate(520, 450)">
      <rect width="240" height="120" fill="white" stroke="#E5E7EB" />
      <rect x="15" y="15" width="210" height="20" fill="#F3F4F6" />
      <rect x="15" y="45" width="210" height="60" fill="#F3F4F6" />

      <rect y="140" width="240" height="260" fill="white" stroke="#E5E7EB" />
    </g>
  </g>
</svg>`,
    metadata: { type: 'WIREFRAME', tags: ['lo-fi', 'layout'] }
  },

  // UI Components Kit
  {
    name: 'Core UI Kit',
    category: 'UI Components',
    description: 'A comprehensive collection of core UI components including buttons, alerts, and inputs.',
    image_url: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=400&h=300',
    svg_code: `<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="white" />
  <g id="UI-Kit" transform="translate(40, 40)">
    <!-- Buttons Section -->
    <text y="0" fill="#111827" font-family="Inter" font-size="18" font-weight="700">Buttons</text>
    <g transform="translate(0, 20)">
      <rect width="120" height="40" rx="8" fill="#6366F1" />
      <text x="60" y="25" fill="white" font-family="Inter" font-size="14" font-weight="600" text-anchor="middle">Primary</text>

      <rect x="140" width="120" height="40" rx="8" fill="white" stroke="#D1D5DB" />
      <text x="200" y="25" fill="#374151" font-family="Inter" font-size="14" font-weight="600" text-anchor="middle">Secondary</text>

      <rect x="280" width="120" height="40" rx="8" fill="#FEE2E2" />
      <text x="340" y="25" fill="#B91C1C" font-family="Inter" font-size="14" font-weight="600" text-anchor="middle">Danger</text>
    </g>

    <!-- Inputs Section -->
    <text y="100" fill="#111827" font-family="Inter" font-size="18" font-weight="700">Inputs</text>
    <g transform="translate(0, 120)">
      <text y="-5" fill="#374151" font-family="Inter" font-size="12" font-weight="500">Email Address</text>
      <rect width="300" height="44" rx="8" fill="white" stroke="#6366F1" stroke-width="2" />
      <text x="12" y="27" fill="#111827" font-family="Inter" font-size="14">john@example.com</text>

      <text y="75" fill="#374151" font-family="Inter" font-size="12" font-weight="500">Search</text>
      <rect y="80" width="300" height="44" rx="22" fill="#F3F4F6" />
      <text x="20" y="107" fill="#9CA3AF" font-family="Inter" font-size="14">Type to search...</text>
    </g>

    <!-- Alerts Section -->
    <text y="280" fill="#111827" font-family="Inter" font-size="18" font-weight="700">Alerts</text>
    <g transform="translate(0, 300)">
      <rect width="500" height="56" rx="8" fill="#ECFDF5" stroke="#10B981" />
      <text x="16" y="33" fill="#065F46" font-family="Inter" font-size="14" font-weight="600">Success!</text>
      <text x="80" y="33" fill="#065F46" font-family="Inter" font-size="14">Your profile has been updated successfully.</text>

      <rect y="70" width="500" height="56" rx="8" fill="#EFF6FF" stroke="#3B82F6" />
      <text x="16" y="103" fill="#1E40AF" font-family="Inter" font-size="14" font-weight="600">Info</text>
      <text x="60" y="103" fill="#1E40AF" font-family="Inter" font-size="14">A new version of the app is available.</text>
    </g>
  </g>
</svg>`,
    metadata: { type: 'UI_COMPONENT', tags: ['uikit', 'components'] }
  }
];

async function seed() {
  try {
    console.log('Seeding expanded sample templates...');
    for (const sample of samples) {
      await pool.query(
        `INSERT INTO public.templates (name, category, description, image_url, svg_code, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (name) DO UPDATE SET
            category = $2,
            description = $3,
            image_url = $4,
            svg_code = $5,
            metadata = $6`,
        [sample.name, sample.category, sample.description, sample.image_url, sample.svg_code, sample.metadata]
      );
    }
    console.log(`Seeded ${samples.length} sample templates across multiple categories.`);
  } catch (error) {
    console.error('Seeding expanded samples failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
