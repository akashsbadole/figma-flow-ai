import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.VITE_DATABASE_URL,
});

const templates = [
  // UI Components
  {
    name: 'Modern Primary Button',
    category: 'UI Components',
    description: 'Figma-ready primary button with shadow and rounded corners.',
    image_url: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=200&h=150',
    svg_code: '<svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg"><g id="Primary-Button"><rect width="120" height="40" rx="8" fill="#6366F1" /><text x="60" y="25" fill="white" font-family="Inter, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Button</text></g></svg>',
    metadata: { type: 'UI_COMPONENT', variant: 'primary' }
  },
  {
    name: 'Auth Card',
    category: 'UI Components',
    description: 'Clean login card with input fields and a button.',
    image_url: 'https://images.unsplash.com/photo-1554147090-e1221a04a025?auto=format&fit=crop&q=80&w=200&h=150',
    svg_code: '<svg width="300" height="400" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg"><g id="Auth-Card"><rect width="300" height="400" rx="12" fill="white" stroke="#E5E7EB" /><text x="20" y="40" fill="#111827" font-family="Inter, sans-serif" font-size="24" font-weight="700">Sign In</text><rect x="20" y="80" width="260" height="40" rx="6" fill="white" stroke="#D1D5DB" /><text x="32" y="105" fill="#9CA3AF" font-family="Inter, sans-serif" font-size="14">Email</text><rect x="20" y="140" width="260" height="40" rx="6" fill="white" stroke="#D1D5DB" /><text x="32" y="165" fill="#9CA3AF" font-family="Inter, sans-serif" font-size="14">Password</text><rect x="20" y="210" width="260" height="44" rx="6" fill="#6366F1" /><text x="150" y="237" fill="white" font-family="Inter, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Continue</text></g></svg>',
    metadata: { type: 'UI_COMPONENT', subtype: 'form' }
  },
  // System Design
  {
    name: 'Microservices Flow',
    category: 'System Design',
    description: 'Architecture diagram showing API Gateway to Microservices.',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=200&h=150',
    svg_code: '<svg width="600" height="200" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg"><g id="Architecture-Diagram"><rect x="20" y="70" width="120" height="60" rx="4" fill="#EEF2FF" stroke="#6366F1" /><text x="80" y="105" fill="#4338CA" font-family="Inter, sans-serif" font-size="12" font-weight="600" text-anchor="middle">API Gateway</text><path d="M 140 100 L 220 100" stroke="#94A3B8" stroke-width="2" marker-end="url(#arrow)" /><rect x="230" y="40" width="120" height="50" rx="4" fill="#F0FDF4" stroke="#22C55E" /><text x="290" y="70" fill="#15803D" font-family="Inter, sans-serif" font-size="11" text-anchor="middle">Auth Service</text><rect x="230" y="110" width="120" height="50" rx="4" fill="#F0FDF4" stroke="#22C55E" /><text x="290" y="140" fill="#15803D" font-family="Inter, sans-serif" font-size="11" text-anchor="middle">User Service</text></g><defs><marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8"/></marker></defs></svg>',
    metadata: { type: 'SYSTEM_DESIGN' }
  },
  // Data Viz
  {
    name: 'Simple Bar Chart',
    category: 'Data Viz',
    description: 'Clean data visualization for metrics.',
    image_url: 'https://images.unsplash.com/photo-1551288049-bbbda5366391?auto=format&fit=crop&q=80&w=200&h=150',
    svg_code: '<svg width="400" height="250" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg"><g id="Bar-Chart"><line x1="40" y1="200" x2="360" y2="200" stroke="#CBD5E1" /><line x1="40" y1="200" x2="40" y2="40" stroke="#CBD5E1" /><rect x="60" y="80" width="40" height="120" fill="#6366F1" rx="4" /><rect x="120" y="120" width="40" height="80" fill="#6366F1" rx="4" /><rect x="180" y="60" width="40" height="140" fill="#6366F1" rx="4" /><rect x="240" y="150" width="40" height="50" fill="#6366F1" rx="4" /><rect x="300" y="100" width="40" height="100" fill="#6366F1" rx="4" /></g></svg>',
    metadata: { type: 'DATA_VIZ' }
  }
];

async function seed() {
  try {
    console.log('Seeding templates...');
    for (const template of templates) {
      await pool.query(
        `INSERT INTO public.templates (name, category, description, image_url, svg_code, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (name) DO UPDATE SET svg_code = $5, metadata = $6`,
        [template.name, template.category, template.description, template.image_url, template.svg_code, template.metadata]
      );
    }
    console.log('Templates seeded successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
