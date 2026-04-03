import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.VITE_DATABASE_URL,
});

const samples = [
  {
    name: 'Advanced Microservices Architecture',
    category: 'System Design',
    description: 'A detailed microservices system design with Load Balancer, API Gateway, and multiple services.',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=400&h=300',
    svg_code: `<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#F8FAFC" />
  <g id="System-Design">
    <!-- Load Balancer -->
    <rect x="50" y="150" width="120" height="60" rx="8" fill="#6366F1" />
    <text x="110" y="185" fill="white" font-family="Inter, sans-serif" font-size="12" font-weight="600" text-anchor="middle">Load Balancer</text>

    <!-- Arrows from LB -->
    <path d="M 170 180 L 230 130" stroke="#94A3B8" stroke-width="2" marker-end="url(#arrow)" fill="none" />
    <path d="M 170 180 L 230 230" stroke="#94A3B8" stroke-width="2" marker-end="url(#arrow)" fill="none" />

    <!-- API Gateways -->
    <rect x="240" y="80" width="120" height="60" rx="8" fill="#F0FDF4" stroke="#22C55E" />
    <text x="300" y="115" fill="#15803D" font-family="Inter, sans-serif" font-size="12" font-weight="600" text-anchor="middle">API Gateway A</text>

    <rect x="240" y="220" width="120" height="60" rx="8" fill="#F0FDF4" stroke="#22C55E" />
    <text x="300" y="255" fill="#15803D" font-family="Inter, sans-serif" font-size="12" font-weight="600" text-anchor="middle">API Gateway B</text>

    <!-- Services -->
    <rect x="450" y="50" width="100" height="50" rx="4" fill="white" stroke="#E2E8F0" />
    <text x="500" y="80" fill="#64748B" font-family="Inter, sans-serif" font-size="10" text-anchor="middle">User Service</text>

    <rect x="450" y="120" width="100" height="50" rx="4" fill="white" stroke="#E2E8F0" />
    <text x="500" y="150" fill="#64748B" font-family="Inter, sans-serif" font-size="10" text-anchor="middle">Order Service</text>

    <rect x="450" y="190" width="100" height="50" rx="4" fill="white" stroke="#E2E8F0" />
    <text x="500" y="220" fill="#64748B" font-family="Inter, sans-serif" font-size="10" text-anchor="middle">Payment Service</text>

    <!-- Database -->
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
    description: 'A modern, responsive SaaS dashboard with sidebar navigation and metrics grid.',
    image_url: 'https://images.unsplash.com/photo-1551288049-bbbda5366391?auto=format&fit=crop&q=80&w=400&h=300',
    svg_code: `<svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="800" fill="#F1F5F9" />
  <!-- Sidebar -->
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

  <!-- Header -->
  <rect x="240" y="0" width="1040" height="64" fill="white" />
  <text x="270" y="40" fill="#1E293B" font-family="Inter, sans-serif" font-size="18" font-weight="600">Overview</text>

  <!-- Content Grid -->
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

  <!-- Main Chart Area -->
  <rect x="270" y="240" width="980" height="520" rx="16" fill="white" stroke="#E2E8F0" />
  <text x="300" y="280" fill="#1E293B" font-family="Inter, sans-serif" font-size="16" font-weight="600">Usage Over Time</text>
</svg>`,
    metadata: { type: 'PAGE_LAYOUT', tags: ['dashboard', 'saas', 'admin'] }
  },
  {
    name: 'Modern Hero Section',
    category: 'Template Generations',
    description: 'High-converting landing page hero section with headline, subtext, and CTAs.',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400&h=300',
    svg_code: `<svg width="1440" height="600" viewBox="0 0 1440 600" xmlns="http://www.w3.org/2000/svg">
  <rect width="1440" height="600" fill="#0F172A" />
  <g id="Hero-Section">
    <text x="720" y="200" fill="white" font-family="Inter, sans-serif" font-size="60" font-weight="800" text-anchor="middle">Design at the Speed of Thought</text>
    <text x="720" y="260" fill="#94A3B8" font-family="Inter, sans-serif" font-size="20" text-anchor="middle">Convert your ideas into Figma-ready designs in seconds using AI.</text>

    <!-- CTAs -->
    <rect x="600" y="320" width="240" height="56" rx="28" fill="#6366F1" />
    <text x="720" y="355" fill="white" font-family="Inter, sans-serif" font-size="18" font-weight="600" text-anchor="middle">Get Started for Free</text>

    <!-- Abstract Shapes -->
    <circle cx="200" cy="400" r="100" fill="#6366F1" fill-opacity="0.2" />
    <rect x="1100" y="100" width="200" height="200" rx="40" fill="#3B82F6" fill-opacity="0.1" transform="rotate(15 1200 200)" />
  </g>
</svg>`,
    metadata: { type: 'PAGE_LAYOUT', tags: ['landing-page', 'hero', 'cta'] }
  }
];

async function seed() {
  try {
    console.log('Seeding sample templates...');
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
    console.log('Sample templates seeded successfully.');
  } catch (error) {
    console.error('Seeding samples failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
