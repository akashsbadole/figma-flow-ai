import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.VITE_DATABASE_URL,
});

const templates = [
  // Navbars
  {
    name: 'Minimal Navbar',
    category: 'Navigation',
    description: 'Clean top navigation with logo and links.',
    svg_code: '<svg width="1440" height="80" viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg"><g id="Minimal-Navbar"><rect width="1440" height="80" fill="white" stroke="#F1F5F9" /><text x="40" y="48" fill="#1E293B" font-family="Inter, sans-serif" font-size="24" font-weight="800">LOGO</text><g id="Links" transform="translate(400, 46)"><text x="0" y="0" fill="#64748B" font-family="Inter, sans-serif" font-size="14" font-weight="500">Home</text><text x="80" y="0" fill="#64748B" font-family="Inter, sans-serif" font-size="14" font-weight="500">Features</text><text x="160" y="0" fill="#64748B" font-family="Inter, sans-serif" font-size="14" font-weight="500">Pricing</text><text x="240" y="0" fill="#64748B" font-family="Inter, sans-serif" font-size="14" font-weight="500">About</text></g><rect x="1300" y="20" width="100" height="40" rx="8" fill="#6366F1" /><text x="1350" y="45" fill="white" font-family="Inter, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Sign Up</text></g></svg>',
    metadata: { type: 'PAGE_LAYOUT', tags: ['navbar', 'navigation', 'minimal'] }
  },
  {
    name: 'Modern Sidebar',
    category: 'Navigation',
    description: 'Vertical sidebar navigation for dashboards.',
    svg_code: '<svg width="240" height="800" viewBox="0 0 240 800" xmlns="http://www.w3.org/2000/svg"><g id="Modern-Sidebar"><rect width="240" height="800" fill="#1E293B" /><text x="30" y="50" fill="white" font-family="Inter, sans-serif" font-size="20" font-weight="700">DashApp</text><g id="Nav-Items" transform="translate(20, 100)"><rect width="200" height="40" rx="8" fill="#334155" /><text x="15" y="25" fill="white" font-family="Inter, sans-serif" font-size="14" font-weight="500">Overview</text><text x="15" y="75" fill="#94A3B8" font-family="Inter, sans-serif" font-size="14" font-weight="500">Analytics</text><text x="15" y="125" fill="#94A3B8" font-family="Inter, sans-serif" font-size="14" font-weight="500">Projects</text><text x="15" y="175" fill="#94A3B8" font-family="Inter, sans-serif" font-size="14" font-weight="500">Team</text><text x="15" y="225" fill="#94A3B8" font-family="Inter, sans-serif" font-size="14" font-weight="500">Settings</text></g></g></svg>',
    metadata: { type: 'PAGE_LAYOUT', tags: ['sidebar', 'navigation', 'dashboard'] }
  },
  // Footers
  {
    name: 'Simple Footer',
    category: 'Navigation',
    description: 'Clean footer with copyright and social icons.',
    svg_code: '<svg width="1440" height="100" viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg"><g id="Simple-Footer"><rect width="1440" height="100" fill="#F8FAFC" /><text x="40" y="55" fill="#64748B" font-family="Inter, sans-serif" font-size="14">© 2024 FigmaFlow AI. All rights reserved.</text><g id="Socials" transform="translate(1300, 40)"><circle cx="0" cy="15" r="15" fill="#E2E8F0" /><circle cx="40" cy="15" r="15" fill="#E2E8F0" /><circle cx="80" cy="15" r="15" fill="#E2E8F0" /></g></g></svg>',
    metadata: { type: 'PAGE_LAYOUT', tags: ['footer', 'navigation'] }
  },
  // Pricing
  {
    name: 'Tiered Pricing Table',
    category: 'Landing Pages',
    description: 'Three-tier pricing layout with highlighted pro plan.',
    svg_code: '<svg width="1200" height="600" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg"><g id="Pricing-Table"><rect width="1200" height="600" fill="#F9FAFB" /><text x="600" y="80" fill="#111827" font-family="Inter, sans-serif" font-size="36" font-weight="800" text-anchor="middle">Simple, Transparent Pricing</text><g transform="translate(100, 150)"><rect width="300" height="400" rx="16" fill="white" stroke="#E2E8F0" /><text x="150" y="50" fill="#111827" font-family="Inter, sans-serif" font-size="20" font-weight="700" text-anchor="middle">Free</text><text x="150" y="100" fill="#111827" font-family="Inter, sans-serif" font-size="48" font-weight="800" text-anchor="middle">$0</text><text x="150" y="130" fill="#64748B" font-family="Inter, sans-serif" font-size="14" text-anchor="middle">per month</text><rect x="40" y="320" width="220" height="44" rx="8" fill="white" stroke="#6366F1" /><text x="150" y="347" fill="#6366F1" font-family="Inter, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Get Started</text></g><g transform="translate(450, 130)"><rect width="300" height="440" rx="16" fill="white" stroke="#6366F1" stroke-width="2" /><rect x="100" y="-12" width="100" height="24" rx="12" fill="#6366F1" /><text x="150" y="5" fill="white" font-family="Inter, sans-serif" font-size="10" font-weight="700" text-anchor="middle">MOST POPULAR</text><text x="150" y="50" fill="#111827" font-family="Inter, sans-serif" font-size="20" font-weight="700" text-anchor="middle">Pro</text><text x="150" y="100" fill="#111827" font-family="Inter, sans-serif" font-size="48" font-weight="800" text-anchor="middle">$29</text><rect x="40" y="360" width="220" height="44" rx="8" fill="#6366F1" /><text x="150" y="387" fill="white" font-family="Inter, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Start Free Trial</text></g><g transform="translate(800, 150)"><rect width="300" height="400" rx="16" fill="white" stroke="#E2E8F0" /><text x="150" y="50" fill="#111827" font-family="Inter, sans-serif" font-size="20" font-weight="700" text-anchor="middle">Enterprise</text><text x="150" y="100" fill="#111827" font-family="Inter, sans-serif" font-size="48" font-weight="800" text-anchor="middle">Custom</text><rect x="40" y="320" width="220" height="44" rx="8" fill="#1E293B" /><text x="150" y="347" fill="white" font-family="Inter, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Contact Us</text></g></g></svg>',
    metadata: { type: 'PAGE_LAYOUT', tags: ['pricing', 'landing-page'] }
  },
  // Forms
  {
    name: 'Advanced Contact Form',
    category: 'Forms',
    description: 'A detailed contact form with multiple field types.',
    svg_code: '<svg width="600" height="700" viewBox="0 0 600 700" xmlns="http://www.w3.org/2000/svg"><g id="Contact-Form"><rect width="600" height="700" rx="16" fill="white" stroke="#E2E8F0" /><text x="40" y="60" fill="#111827" font-family="Inter, sans-serif" font-size="24" font-weight="700">Contact Us</text><text x="40" y="90" fill="#64748B" font-family="Inter, sans-serif" font-size="14">We typically respond within 24 hours.</text><g transform="translate(40, 140)"><text x="0" y="-10" fill="#374151" font-family="Inter, sans-serif" font-size="12" font-weight="600">Full Name</text><rect width="520" height="44" rx="8" fill="white" stroke="#D1D5DB" /></g><g transform="translate(40, 230)"><text x="0" y="-10" fill="#374151" font-family="Inter, sans-serif" font-size="12" font-weight="600">Email Address</text><rect width="520" height="44" rx="8" fill="white" stroke="#D1D5DB" /></g><g transform="translate(40, 320)"><text x="0" y="-10" fill="#374151" font-family="Inter, sans-serif" font-size="12" font-weight="600">Subject</text><rect width="520" height="44" rx="8" fill="white" stroke="#D1D5DB" /></g><g transform="translate(40, 410)"><text x="0" y="-10" fill="#374151" font-family="Inter, sans-serif" font-size="12" font-weight="600">Message</text><rect width="520" height="150" rx="8" fill="white" stroke="#D1D5DB" /></g><rect x="40" y="600" width="520" height="48" rx="8" fill="#6366F1" /><text x="300" y="630" fill="white" font-family="Inter, sans-serif" font-size="16" font-weight="600" text-anchor="middle">Send Message</text></g></svg>',
    metadata: { type: 'UI_COMPONENT', subtype: 'form', tags: ['contact', 'form'] }
  },
  // Dashboards
  {
    name: 'E-commerce Stats Grid',
    category: 'Dashboards',
    description: 'Grid of stat cards for e-commerce metrics.',
    svg_code: '<svg width="1200" height="300" viewBox="0 0 1200 300" xmlns="http://www.w3.org/2000/svg"><g id="Stats-Grid"><rect width="1200" height="300" fill="#F8FAFC" /><g transform="translate(40, 40)"><rect width="260" height="160" rx="12" fill="white" stroke="#E2E8F0" /><text x="20" y="40" fill="#64748B" font-family="Inter" font-size="14">Total Revenue</text><text x="20" y="80" fill="#111827" font-family="Inter" font-size="32" font-weight="700">$128,430</text><text x="20" y="110" fill="#10B981" font-family="Inter" font-size="12" font-weight="600">↑ 12.5% from last month</text></g><g transform="translate(330, 40)"><rect width="260" height="160" rx="12" fill="white" stroke="#E2E8F0" /><text x="20" y="40" fill="#64748B" font-family="Inter" font-size="14">New Customers</text><text x="20" y="80" fill="#111827" font-family="Inter" font-size="32" font-weight="700">2,420</text><text x="20" y="110" fill="#10B981" font-family="Inter" font-size="12" font-weight="600">↑ 18.2% from last month</text></g><g transform="translate(620, 40)"><rect width="260" height="160" rx="12" fill="white" stroke="#E2E8F0" /><text x="20" y="40" fill="#64748B" font-family="Inter" font-size="14">Avg. Order Value</text><text x="20" y="80" fill="#111827" font-family="Inter" font-size="32" font-weight="700">$53.07</text><text x="20" y="110" fill="#EF4444" font-family="Inter" font-size="12" font-weight="600">↓ 2.4% from last month</text></g><g transform="translate(910, 40)"><rect width="260" height="160" rx="12" fill="white" stroke="#E2E8F0" /><text x="20" y="40" fill="#64748B" font-family="Inter" font-size="14">Conversion Rate</text><text x="20" y="80" fill="#111827" font-family="Inter" font-size="32" font-weight="700">3.24%</text><text x="20" y="110" fill="#10B981" font-family="Inter" font-size="12" font-weight="600">↑ 0.5% from last month</text></g></g></svg>',
    metadata: { type: 'PAGE_LAYOUT', tags: ['dashboard', 'stats', 'grid'] }
  },
  // System Design
  {
    name: 'Saga Pattern Flow',
    category: 'System Design',
    description: 'Distributed transactions using the Saga pattern.',
    svg_code: '<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg"><g id="Saga-Flow"><rect width="800" height="400" fill="#F8FAFC" /><g transform="translate(50, 100)"><rect width="120" height="60" rx="8" fill="#DBEAFE" stroke="#3B82F6" /><text x="60" y="35" fill="#1E40AF" font-family="Inter" font-size="12" font-weight="600" text-anchor="middle">Order Service</text><path d="M 120 30 L 230 30" stroke="#94A3B8" stroke-width="2" marker-end="url(#arrow)" /><text x="175" y="20" fill="#64748B" font-family="Inter" font-size="10" text-anchor="middle">Create Order</text></g><g transform="translate(250, 100)"><rect width="120" height="60" rx="8" fill="#DBEAFE" stroke="#3B82F6" /><text x="60" y="35" fill="#1E40AF" font-family="Inter" font-size="12" font-weight="600" text-anchor="middle">Payment Service</text><path d="M 120 30 L 230 30" stroke="#94A3B8" stroke-width="2" marker-end="url(#arrow)" /><text x="175" y="20" fill="#64748B" font-family="Inter" font-size="10" text-anchor="middle">Authorize</text></g><g transform="translate(450, 100)"><rect width="120" height="60" rx="8" fill="#DBEAFE" stroke="#3B82F6" /><text x="60" y="35" fill="#1E40AF" font-family="Inter" font-size="12" font-weight="600" text-anchor="middle">Stock Service</text><path d="M 120 30 L 230 30" stroke="#94A3B8" stroke-width="2" marker-end="url(#arrow)" /><text x="175" y="20" fill="#64748B" font-family="Inter" font-size="10" text-anchor="middle">Reserve Stock</text></g><g transform="translate(650, 100)"><rect width="120" height="60" rx="8" fill="#D1FAE5" stroke="#10B981" /><text x="60" y="35" fill="#065F46" font-family="Inter" font-size="12" font-weight="600" text-anchor="middle">Delivery Service</text></g><path d="M 510 160 L 510 250 L 310 250 L 310 160" fill="none" stroke="#EF4444" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#red-arrow)" /><text x="410" y="270" fill="#B91C1C" font-family="Inter" font-size="10" text-anchor="middle">Compensating Transaction (Refund)</text></g><defs><marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8"/></marker><marker id="red-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444"/></marker></defs></svg>',
    metadata: { type: 'SYSTEM_DESIGN', tags: ['saga', 'microservices', 'distributed-systems'] }
  },
  // Data Viz
  {
    name: 'Multi-line Performance Chart',
    category: 'Data Viz',
    description: 'Complex line chart with three data series and a grid.',
    svg_code: '<svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg"><g id="Multi-line-Chart"><rect width="800" height="500" fill="white" /><g transform="translate(60, 60)"><line x1="0" y1="0" x2="0" y2="380" stroke="#E2E8F0" /><line x1="0" y1="380" x2="680" y2="380" stroke="#E2E8F0" /><g opacity="0.1"><line x1="0" y1="95" x2="680" y2="95" stroke="black" /><line x1="0" y1="190" x2="680" y2="190" stroke="black" /><line x1="0" y1="285" x2="680" y2="285" stroke="black" /></g><path d="M 0 300 L 100 250 L 200 280 L 300 150 L 400 180 L 500 100 L 680 50" fill="none" stroke="#6366F1" stroke-width="3" /><path d="M 0 350 L 100 320 L 200 330 L 300 280 L 400 300 L 500 250 L 680 200" fill="none" stroke="#10B981" stroke-width="3" /><path d="M 0 320 L 100 300 L 200 310 L 300 220 L 400 240 L 500 180 L 680 150" fill="none" stroke="#F59E0B" stroke-width="3" /></g></g></svg>',
    metadata: { type: 'DATA_VIZ', tags: ['line-chart', 'performance', 'analytics'] }
  },
  // Cards
  {
    name: 'Feature Bento Grid',
    category: 'Landing Pages',
    description: 'Modern Bento-style grid for highlighting product features.',
    svg_code: '<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg"><g id="Bento-Grid"><rect width="1200" height="800" fill="#F8FAFC" /><g transform="translate(50, 50)"><rect width="700" height="340" rx="24" fill="white" stroke="#E2E8F0" /><text x="40" y="60" fill="#111827" font-family="Inter" font-size="24" font-weight="700">AI-Powered Insights</text><text x="40" y="90" fill="#64748B" font-family="Inter" font-size="16" max-width="300">Generate deep insights from your data automatically.</text></g><g transform="translate(770, 50)"><rect width="380" height="340" rx="24" fill="#6366F1" /><text x="40" y="60" fill="white" font-family="Inter" font-size="24" font-weight="700">Fast Export</text><text x="40" y="90" fill="#C7D2FE" font-family="Inter" font-size="16">Figma-ready vectors in a click.</text></g><g transform="translate(50, 410)"><rect width="380" height="340" rx="24" fill="#1E293B" /><text x="40" y="60" fill="white" font-family="Inter" font-size="24" font-weight="700">Secure by Design</text><text x="40" y="90" fill="#94A3B8" font-family="Inter" font-size="16">Enterprise-grade security.</text></g><g transform="translate(450, 410)"><rect width="700" height="340" rx="24" fill="white" stroke="#E2E8F0" /><text x="40" y="60" fill="#111827" font-family="Inter" font-size="24" font-weight="700">Team Collaboration</text><text x="40" y="90" fill="#64748B" font-family="Inter" font-size="16">Work together in real-time.</text></g></g></svg>',
    metadata: { type: 'PAGE_LAYOUT', tags: ['bento-grid', 'features', 'landing-page'] }
  },
  // More UI Components
  {
    name: 'Status Feed / Activity Log',
    category: 'Dashboards',
    description: 'A vertical timeline of recent activities and status updates.',
    svg_code: '<svg width="400" height="600" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg"><g id="Activity-Log"><rect width="400" height="600" rx="16" fill="white" stroke="#E2E8F0" /><text x="24" y="40" fill="#111827" font-family="Inter" font-size="18" font-weight="700">Recent Activity</text><line x1="44" y1="80" x2="44" y2="540" stroke="#E2E8F0" stroke-width="2" stroke-dasharray="4 4" /><g transform="translate(36, 80)"><circle cx="8" cy="8" r="8" fill="#6366F1" /><text x="32" y="14" fill="#111827" font-family="Inter" font-size="14" font-weight="600">Design generated</text><text x="32" y="34" fill="#64748B" font-family="Inter" font-size="12">2 minutes ago</text></g><g transform="translate(36, 160)"><circle cx="8" cy="8" r="8" fill="#10B981" /><text x="32" y="14" fill="#111827" font-family="Inter" font-size="14" font-weight="600">Project shared</text><text x="32" y="34" fill="#64748B" font-family="Inter" font-size="12">1 hour ago</text></g><g transform="translate(36, 240)"><circle cx="8" cy="8" r="8" fill="#F59E0B" /><text x="32" y="14" fill="#111827" font-family="Inter" font-size="14" font-weight="600">Feedback received</text><text x="32" y="34" fill="#64748B" font-family="Inter" font-size="12">3 hours ago</text></g></g></svg>',
    metadata: { type: 'UI_COMPONENT', tags: ['activity-log', 'timeline', 'dashboard'] }
  }
];

async function seed() {
  try {
    console.log(`Seeding ${templates.length} additional SVG templates...`);
    for (const template of templates) {
      await pool.query(
        `INSERT INTO public.templates (name, category, description, svg_code, metadata)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (name) DO UPDATE SET svg_code = $4, metadata = $5`,
        [template.name, template.category, template.description, template.svg_code, template.metadata]
      );
    }
    console.log('Extra templates seeded successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
