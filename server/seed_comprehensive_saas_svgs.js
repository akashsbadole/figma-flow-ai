import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.VITE_DATABASE_URL,
});

const templates = [
  // --- INFRASTRUCTURE & DEVELOPER TOOLS (1-10) ---
  {
    name: 'AI Model Training Dashboard',
    category: 'Infrastructure',
    description: 'Visualizing epochs, loss curves, and dataset distribution.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#0F172A" />
      <g id="Header" transform="translate(40, 40)">
        <text x="0" y="0" fill="white" font-family="Inter" font-size="24" font-weight="700">Model Training: ResNet-50-v2</text>
        <rect x="0" y="20" width="80" height="24" rx="12" fill="#10B981" fill-opacity="0.2" />
        <text x="40" y="36" fill="#10B981" font-family="Inter" font-size="12" font-weight="600" text-anchor="middle">RUNNING</text>
      </g>
      <g id="Charts" transform="translate(40, 120)">
        <rect width="540" height="300" rx="16" fill="#1E293B" stroke="#334155" />
        <text x="24" y="40" fill="white" font-family="Inter" font-size="16" font-weight="600">Loss Curve</text>
        <path d="M 60 240 Q 150 180 250 100 T 500 60" fill="none" stroke="#6366F1" stroke-width="3" />
        <path d="M 60 240 Q 150 200 250 150 T 500 120" fill="none" stroke="#F43F5E" stroke-width="2" stroke-dasharray="4 4" />

        <rect x="580" y="0" width="540" height="300" rx="16" fill="#1E293B" stroke="#334155" />
        <text x="604" y="40" fill="white" font-family="Inter" font-size="16" font-weight="600">Accuracy (Top-1)</text>
        <path d="M 640 240 Q 750 150 850 100 T 1080 80" fill="none" stroke="#10B981" stroke-width="3" />
      </g>
      <g id="Stats" transform="translate(40, 460)">
        <rect width="260" height="120" rx="12" fill="#1E293B" />
        <text x="20" y="40" fill="#94A3B8" font-family="Inter" font-size="14">Current Epoch</text>
        <text x="20" y="85" fill="white" font-family="Inter" font-size="32" font-weight="700">84 / 150</text>

        <rect x="290" y="0" width="260" height="120" rx="12" fill="#1E293B" />
        <text x="310" y="40" fill="#94A3B8" font-family="Inter" font-size="14">Learning Rate</text>
        <text x="310" y="85" fill="white" font-family="Inter" font-size="32" font-weight="700">0.00042</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['ai', 'ml', 'training', 'infrastructure'] }
  },
  {
    name: 'API Management Portal',
    category: 'Infrastructure',
    description: 'Endpoint testing, rate-limiting toggles, and documentation views.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F8FAFC" />
      <rect width="260" height="800" fill="white" stroke="#E2E8F0" />
      <g id="Sidebar" transform="translate(24, 40)">
        <text x="0" y="0" fill="#0F172A" font-family="Inter" font-size="20" font-weight="800">API HUB</text>
        <g transform="translate(0, 60)">
          <rect width="212" height="40" rx="8" fill="#F1F5F9" />
          <text x="12" y="25" fill="#6366F1" font-family="Inter" font-size="14" font-weight="600">v1 / users</text>
          <text x="12" y="75" fill="#64748B" font-family="Inter" font-size="14">v1 / orders</text>
          <text x="12" y="125" fill="#64748B" font-family="Inter" font-size="14">v1 / auth</text>
        </g>
      </g>
      <g id="Content" transform="translate(300, 40)">
        <text x="0" y="0" fill="#0F172A" font-family="Inter" font-size="24" font-weight="700">GET /v1/users</text>
        <rect x="0" y="40" width="860" height="300" rx="12" fill="white" stroke="#E2E8F0" />
        <text x="24" y="80" fill="#1E293B" font-family="Inter" font-size="16" font-weight="600">Rate Limiting</text>
        <rect x="24" y="100" width="50" height="28" rx="14" fill="#6366F1" />
        <circle cx="38" cy="114" r="10" fill="white" />
        <text x="85" y="119" fill="#64748B" font-family="Inter" font-size="14">Active (5000 req/hr)</text>
        <rect x="24" y="160" width="812" height="150" rx="8" fill="#0F172A" />
        <text x="44" y="200" fill="#10B981" font-family="Courier New" font-size="14">{ "status": "success", "data": [...] }</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['api', 'developer-tools', 'management'] }
  },
  {
    name: 'Cloud Infrastructure Monitor',
    category: 'Infrastructure',
    description: 'Server health, regional latency maps, and spin up controls.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F1F5F9" />
      <g id="Regions" transform="translate(40, 40)">
        <text x="0" y="0" fill="#0F172A" font-family="Inter" font-size="24" font-weight="700">Global Infrastructure</text>
        <g transform="translate(0, 40)">
          <rect width="350" height="200" rx="16" fill="white" stroke="#E2E8F0" />
          <text x="24" y="40" fill="#1E293B" font-family="Inter" font-size="18" font-weight="600">US-EAST-1</text>
          <circle cx="310" cy="35" r="8" fill="#10B981" />
          <text x="24" y="80" fill="#64748B" font-family="Inter" font-size="14">Latency: 12ms</text>
          <rect x="24" y="120" width="302" height="12" rx="6" fill="#F1F5F9" />
          <rect x="24" y="120" width="210" height="12" rx="6" fill="#6366F1" />
          <text x="24" y="150" fill="#64748B" font-family="Inter" font-size="12">CPU Usage: 74%</text>
        </g>
        <g transform="translate(390, 40)">
          <rect width="350" height="200" rx="16" fill="white" stroke="#E2E8F0" />
          <text x="24" y="40" fill="#1E293B" font-family="Inter" font-size="18" font-weight="600">EU-WEST-1</text>
          <circle cx="310" cy="35" r="8" fill="#F59E0B" />
          <text x="24" y="80" fill="#64748B" font-family="Inter" font-size="14">Latency: 84ms</text>
        </g>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['cloud', 'aws', 'infrastructure', 'monitoring'] }
  },
  {
    name: 'Database Management GUI',
    category: 'Infrastructure',
    description: 'SQL query editors, schema visualizers, and data tables.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="white" />
      <rect width="1200" height="64" fill="#1E293B" />
      <text x="24" y="40" fill="white" font-family="Inter" font-size="18" font-weight="600">NeonDB Explorer</text>
      <rect x="0" y="64" width="240" height="736" fill="#F8FAFC" stroke="#E2E8F0" />
      <g id="Editor" transform="translate(260, 84)">
        <rect width="920" height="200" rx="8" fill="#0F172A" />
        <text x="20" y="40" fill="#6366F1" font-family="Monaco, monospace" font-size="14">SELECT * FROM users</text>
        <text x="20" y="65" fill="#6366F1" font-family="Monaco, monospace" font-size="14">WHERE created_at > '2024-01-01'</text>
        <text x="20" y="90" fill="#6366F1" font-family="Monaco, monospace" font-size="14">ORDER BY email ASC;</text>
        <rect x="800" y="140" width="100" height="40" rx="20" fill="#6366F1" />
        <text x="850" y="165" fill="white" font-family="Inter" font-size="14" font-weight="600" text-anchor="middle">RUN</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['database', 'sql', 'developer-tools'] }
  },
  {
    name: 'Log Analytics Dashboard',
    category: 'Infrastructure',
    description: 'Real-time stream of system errors and warnings.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#111827" />
      <g transform="translate(40, 40)">
        <text x="0" y="0" fill="white" font-family="Inter" font-size="24" font-weight="700">System Logs</text>
        <rect x="0" y="40" width="1120" height="680" rx="8" fill="#000" stroke="#334155" />
        <g transform="translate(20, 80)">
          <text x="0" y="0" fill="#94A3B8" font-family="Monaco" font-size="12">[2024-05-20 10:12:44]</text>
          <text x="160" y="0" fill="#10B981" font-family="Monaco" font-size="12">INFO</text>
          <text x="220" y="0" fill="white" font-family="Monaco" font-size="12">Auth service started on port 3001</text>

          <text x="0" y="30" fill="#94A3B8" font-family="Monaco" font-size="12">[2024-05-20 10:12:46]</text>
          <text x="160" y="30" fill="#EF4444" font-family="Monaco" font-size="12">ERROR</text>
          <text x="220" y="30" fill="white" font-family="Monaco" font-size="12">Failed to connect to redis-primary (Timeout)</text>
        </g>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['logs', 'monitoring', 'infrastructure'] }
  },
  {
    name: 'Edge Computing Hub',
    category: 'Infrastructure',
    description: 'Managing deployments across global CDN nodes.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F8FAFC" />
      <circle cx="600" cy="400" r="300" fill="none" stroke="#E2E8F0" stroke-width="1" />
      <circle cx="600" cy="400" r="200" fill="none" stroke="#E2E8F0" stroke-width="1" />
      <circle cx="600" cy="400" r="100" fill="none" stroke="#E2E8F0" stroke-width="1" />
      <g id="Nodes">
        <circle cx="600" cy="100" r="12" fill="#6366F1" />
        <circle cx="900" cy="400" r="12" fill="#6366F1" />
        <circle cx="300" cy="400" r="12" fill="#6366F1" />
        <circle cx="600" cy="700" r="12" fill="#10B981" />
      </g>
      <rect x="40" y="40" width="300" height="150" rx="16" fill="white" stroke="#E2E8F0" />
      <text x="64" y="80" fill="#1E293B" font-family="Inter" font-size="18" font-weight="700">Active Edge Nodes</text>
      <text x="64" y="120" fill="#6366F1" font-family="Inter" font-size="36" font-weight="800">4,129</text>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['edge', 'cdn', 'infrastructure'] }
  },
  {
    name: 'Cybersecurity Threat Hunter',
    category: 'Infrastructure',
    description: 'Real-time attack maps and vulnerability scores.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#020617" />
      <path d="M 200 600 Q 600 200 1000 600" fill="none" stroke="#EF4444" stroke-width="2" opacity="0.5" />
      <path d="M 100 400 L 1100 400" stroke="#1E293B" stroke-width="1" />
      <g transform="translate(50, 50)">
        <rect width="200" height="100" rx="12" fill="#0F172A" stroke="#B91C1C" />
        <text x="20" y="40" fill="#FCA5A5" font-family="Inter" font-size="12">Threat Level</text>
        <text x="20" y="80" fill="#EF4444" font-family="Inter" font-size="32" font-weight="800">CRITICAL</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['security', 'cybersecurity', 'threats'] }
  },
  {
    name: 'DevOps Pipeline Tracker',
    category: 'Infrastructure',
    description: 'CI/CD status from Commit to Production.',
    svg_code: `<svg width="1200" height="400" viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="400" fill="#F8FAFC" />
      <g transform="translate(100, 200)">
        <circle cx="0" cy="0" r="40" fill="#10B981" />
        <text x="0" y="5" fill="white" font-family="Inter" font-size="12" text-anchor="middle">COMMIT</text>
        <line x1="40" y1="0" x2="210" y2="0" stroke="#10B981" stroke-width="4" />

        <circle cx="250" cy="0" r="40" fill="#10B981" />
        <text x="250" y="5" fill="white" font-family="Inter" font-size="12" text-anchor="middle">BUILD</text>
        <line x1="290" y1="0" x2="460" y2="0" stroke="#10B981" stroke-width="4" />

        <circle cx="500" cy="0" r="40" fill="#6366F1" />
        <text x="500" y="5" fill="white" font-family="Inter" font-size="12" text-anchor="middle">TEST</text>
        <line x1="540" y1="0" x2="710" y2="0" stroke="#CBD5E1" stroke-width="4" stroke-dasharray="8 4" />

        <circle cx="750" cy="0" r="40" fill="#CBD5E1" />
        <text x="750" y="5" fill="#64748B" font-family="Inter" font-size="12" text-anchor="middle">DEPLOY</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['devops', 'cicd', 'pipeline'] }
  },
  {
    name: 'No-Code Automation Builder',
    category: 'Infrastructure',
    description: 'A drag-and-drop node interface for workflow logic.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="url(#grid)" />
      <g transform="translate(200, 300)">
        <rect width="200" height="120" rx="12" fill="white" stroke="#6366F1" stroke-width="2" />
        <text x="20" y="40" fill="#1E293B" font-family="Inter" font-size="14" font-weight="700">Webhook Trigger</text>
        <circle cx="200" cy="60" r="6" fill="#6366F1" />
      </g>
      <path d="M 400 360 L 550 360" stroke="#6366F1" stroke-width="2" fill="none" />
      <g transform="translate(550, 300)">
        <rect width="200" height="120" rx="12" fill="white" stroke="#E2E8F0" stroke-width="1" />
        <text x="20" y="40" fill="#1E293B" font-family="Inter" font-size="14" font-weight="700">Filter Data</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['no-code', 'automation', 'workflow'] }
  },
  {
    name: 'Site Reliability Tool',
    category: 'Infrastructure',
    description: 'Uptime monitoring and incident response checklists.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F8FAFC" />
      <rect x="40" y="40" width="1120" height="80" rx="12" fill="#FEF2F2" stroke="#FCA5A5" />
      <text x="80" y="88" fill="#991B1B" font-family="Inter" font-size="18" font-weight="700">INCIDENT: Database Connectivity Issues (Severity 1)</text>
      <g transform="translate(40, 160)">
        <rect width="540" height="400" rx="16" fill="white" stroke="#E2E8F0" />
        <text x="24" y="40" fill="#1E293B" font-family="Inter" font-size="16" font-weight="700">Response Checklist</text>
        <rect x="24" y="80" width="20" height="20" rx="4" fill="#6366F1" />
        <text x="56" y="95" fill="#1E293B" font-family="Inter" font-size="14">Verify cluster status</text>
        <rect x="24" y="120" width="20" height="20" rx="4" stroke="#D1D5DB" fill="white" />
        <text x="56" y="135" fill="#1E293B" font-family="Inter" font-size="14">Check regional replication lag</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['sre', 'uptime', 'incident'] }
  },

  // --- FINTECH & BUSINESS INTELLIGENCE (11-20) ---
  {
    name: 'Crypto Portfolio Manager',
    category: 'Fintech',
    description: 'Live price tickers, wallet balances, and gas fee trackers.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#0B0E11" />
      <g transform="translate(40, 40)">
        <text x="0" y="0" fill="#F0B90B" font-family="Inter" font-size="24" font-weight="800">CryptoHub</text>
        <g transform="translate(0, 60)">
          <rect width="300" height="150" rx="16" fill="#1E2329" />
          <text x="24" y="40" fill="#848E9C" font-family="Inter" font-size="14">Total Balance</text>
          <text x="24" y="90" fill="white" font-family="Inter" font-size="36" font-weight="700">$42,509.12</text>
        </g>
        <g transform="translate(340, 60)">
          <rect width="780" height="660" rx="16" fill="#1E2329" />
          <text x="24" y="40" fill="white" font-family="Inter" font-size="18" font-weight="600">Market Trends</text>
          <path d="M 40 300 L 100 250 L 200 280 L 300 150 L 400 180 L 700 80" fill="none" stroke="#00C087" stroke-width="3" />
        </g>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['crypto', 'fintech', 'portfolio'] }
  },
  {
    name: 'B2B Invoicing Platform',
    category: 'Fintech',
    description: 'Bulk invoice generation and payment status tracking.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F8FAFC" />
      <g transform="translate(40, 40)">
        <text x="0" y="0" fill="#1E293B" font-family="Inter" font-size="24" font-weight="700">Invoices</text>
        <rect x="0" y="40" width="1120" height="680" rx="12" fill="white" stroke="#E2E8F0" />
        <g transform="translate(24, 80)">
          <text x="0" y="0" fill="#64748B" font-family="Inter" font-size="14" font-weight="600">ID</text>
          <text x="100" y="0" fill="#64748B" font-family="Inter" font-size="14" font-weight="600">Client</text>
          <text x="400" y="0" fill="#64748B" font-family="Inter" font-size="14" font-weight="600">Amount</text>
          <text x="600" y="0" fill="#64748B" font-family="Inter" font-size="14" font-weight="600">Status</text>

          <line x1="0" y1="20" x2="1080" y2="20" stroke="#F1F5F9" />
          <text x="0" y="50" fill="#1E293B" font-family="Inter" font-size="14">INV-001</text>
          <text x="100" y="50" fill="#1E293B" font-family="Inter" font-size="14">Acme Corp</text>
          <text x="400" y="50" fill="#1E293B" font-family="Inter" font-size="14">$4,200.00</text>
          <rect x="600" y="32" width="80" height="24" rx="12" fill="#DCFCE7" />
          <text x="640" y="48" fill="#166534" font-family="Inter" font-size="12" font-weight="600" text-anchor="middle">PAID</text>
        </g>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['invoicing', 'fintech', 'b2b'] }
  },
  {
    name: 'Venture Capital CRM',
    category: 'Fintech',
    description: 'Deal flow stages, cap table management, and LP reporting.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F1F5F9" />
      <g transform="translate(40, 40)">
        <text x="0" y="0" fill="#1E293B" font-family="Inter" font-size="24" font-weight="700">Deal Flow</text>
        <g transform="translate(0, 40)">
          <rect width="260" height="680" rx="12" fill="#E2E8F0" />
          <text x="20" y="35" fill="#475569" font-family="Inter" font-size="14" font-weight="700">INBOUND (12)</text>
          <rect x="10" y="50" width="240" height="100" rx="8" fill="white" />
          <text x="25" y="80" fill="#1E293B" font-family="Inter" font-size="14" font-weight="700">SpaceX 2.0</text>
          <text x="25" y="105" fill="#64748B" font-family="Inter" font-size="12">Series B • $50M</text>
        </g>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['vc', 'fintech', 'crm'] }
  },
  {
    name: 'Personal Wealth Advisor',
    category: 'Fintech',
    description: 'Budgeting goals, net worth charts, and tax estimators.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="white" />
      <g transform="translate(40, 40)">
        <text x="0" y="0" fill="#1E293B" font-family="Inter" font-size="24" font-weight="700">Good Morning, Alex</text>
        <g transform="translate(0, 40)">
          <rect width="1120" height="200" rx="24" fill="#6366F1" />
          <text x="40" y="60" fill="white" font-family="Inter" font-size="16" opacity="0.8">Net Worth</text>
          <text x="40" y="120" fill="white" font-family="Inter" font-size="48" font-weight="800">$1,240,500</text>
        </g>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['wealth', 'fintech', 'personal-finance'] }
  },
  {
    name: 'Neobank Admin Panel',
    category: 'Fintech',
    description: 'Transaction auditing, KYC verification, and card management.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F8FAFC" />
      <rect width="240" height="800" fill="#1E293B" />
      <g transform="translate(280, 40)">
        <text x="0" y="0" fill="#1E293B" font-family="Inter" font-size="24" font-weight="700">KYC Approvals</text>
        <g transform="translate(0, 40)">
          <rect width="880" height="120" rx="12" fill="white" stroke="#E2E8F0" />
          <circle cx="50" cy="60" r="30" fill="#F1F5F9" />
          <text x="100" y="55" fill="#1E293B" font-family="Inter" font-size="16" font-weight="600">Sarah Jenkins</text>
          <text x="100" y="80" fill="#64748B" font-family="Inter" font-size="14">Passport ID: 48***21</text>
          <rect x="750" y="45" width="100" height="36" rx="18" fill="#10B981" />
          <text x="800" y="68" fill="white" font-family="Inter" font-size="14" font-weight="600" text-anchor="middle">APPROVE</text>
        </g>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['neobank', 'fintech', 'kyc'] }
  },
  {
    name: 'Carbon Footprint Tracker',
    category: 'Fintech',
    description: 'Corporate ESG reporting and offset marketplace.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F0FDF4" />
      <g transform="translate(40, 40)">
        <text x="0" y="0" fill="#14532D" font-family="Inter" font-size="24" font-weight="700">Carbon Dashboard</text>
        <g transform="translate(0, 60)">
          <rect width="350" height="250" rx="20" fill="white" />
          <text x="175" y="100" fill="#059669" font-family="Inter" font-size="48" font-weight="800" text-anchor="middle">12.4t</text>
          <text x="175" y="140" fill="#64748B" font-family="Inter" font-size="14" text-anchor="middle">CO2 Emitted (This Month)</text>
          <rect x="50" y="180" width="250" height="10" rx="5" fill="#F1F5F9" />
          <rect x="50" y="180" width="180" height="10" rx="5" fill="#059669" />
        </g>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['esg', 'fintech', 'sustainability'] }
  },
  {
    name: 'Equity Management SaaS',
    category: 'Fintech',
    description: 'Employee stock option vesting schedules.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="white" />
      <g transform="translate(60, 60)">
        <text x="0" y="0" fill="#1E293B" font-family="Inter" font-size="24" font-weight="700">My Equity</text>
        <g transform="translate(0, 40)">
          <text x="0" y="20" fill="#64748B" font-family="Inter" font-size="14">Vesting Progress</text>
          <rect x="0" y="40" width="1080" height="40" rx="8" fill="#F1F5F9" />
          <rect x="0" y="40" width="432" height="40" rx="8" fill="#6366F1" />
          <text x="10" y="65" fill="white" font-family="Inter" font-size="14" font-weight="600">40% Vested</text>
        </g>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['equity', 'fintech', 'hr'] }
  },
  {
    name: 'E-commerce Revenue Analytics',
    category: 'Fintech',
    description: 'LTV and CAC metrics visualization.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F8FAFC" />
      <g transform="translate(40, 40)">
        <rect width="250" height="150" rx="16" fill="white" stroke="#E2E8F0" />
        <text x="24" y="40" fill="#64748B" font-family="Inter" font-size="14">LTV (Avg)</text>
        <text x="24" y="90" fill="#1E293B" font-family="Inter" font-size="32" font-weight="700">$1,420</text>

        <rect x="280" y="0" width="250" height="150" rx="16" fill="white" stroke="#E2E8F0" />
        <text x="304" y="40" fill="#64748B" font-family="Inter" font-size="14">CAC</text>
        <text x="304" y="90" fill="#1E293B" font-family="Inter" font-size="32" font-weight="700">$184</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['analytics', 'fintech', 'ecommerce'] }
  },
  {
    name: 'Payroll Processing Hub',
    category: 'Fintech',
    description: 'Salary breakdowns and tax withholdings.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F1F5F9" />
      <g transform="translate(40, 40)">
        <text x="0" y="0" fill="#1E293B" font-family="Inter" font-size="24" font-weight="700">Payroll: May 2024</text>
        <rect x="0" y="40" width="1120" height="120" rx="16" fill="white" />
        <text x="40" y="90" fill="#1E293B" font-family="Inter" font-size="32" font-weight="700">Total Payout: $1,204,500</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['payroll', 'fintech', 'hr'] }
  },
  {
    name: 'Procurement Manager',
    category: 'Fintech',
    description: 'Vendor bidding and supply chain tracking.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="white" />
      <g transform="translate(40, 40)">
        <text x="0" y="0" fill="#1E293B" font-family="Inter" font-size="24" font-weight="700">Active Bids</text>
        <rect x="0" y="40" width="1120" height="200" rx="12" fill="#F8FAFC" />
        <text x="24" y="80" fill="#1E293B" font-family="Inter" font-size="16" font-weight="600">Steel Supply 2024</text>
        <text x="24" y="110" fill="#64748B" font-family="Inter" font-size="14">3 Vendors Bidding • Closes in 2 days</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['procurement', 'fintech', 'supply-chain'] }
  },

  // --- HEALTHCARE & WELLNESS (21-27) ---
  {
    name: 'Telemedicine Patient Portal',
    category: 'Healthcare',
    description: 'Video call interface and chat.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#0F172A" />
      <rect x="40" y="40" width="800" height="600" rx="24" fill="#1E293B" />
      <circle cx="440" cy="340" r="80" fill="#334155" />
      <text x="440" y="460" fill="white" font-family="Inter" font-size="20" font-weight="600" text-anchor="middle">Dr. Emily Smith</text>
      <rect x="860" y="40" width="300" height="720" rx="24" fill="white" />
      <text x="884" y="80" fill="#1E293B" font-family="Inter" font-size="18" font-weight="700">Chat</text>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['telemedicine', 'healthcare', 'video'] }
  },
  {
    name: 'Hospital Resource Planner',
    category: 'Healthcare',
    description: 'Bed availability and staff shifts.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F8FAFC" />
      <g transform="translate(40, 40)">
        <text x="0" y="0" fill="#1E293B" font-family="Inter" font-size="24" font-weight="700">Ward Capacity</text>
        <g transform="translate(0, 40)">
          <rect width="200" height="150" rx="16" fill="white" stroke="#E2E8F0" />
          <text x="24" y="40" fill="#64748B" font-family="Inter" font-size="14">ICU Beds</text>
          <text x="24" y="90" fill="#EF4444" font-family="Inter" font-size="48" font-weight="800">2/20</text>
          <text x="24" y="120" fill="#991B1B" font-family="Inter" font-size="12">Critical Status</text>
        </g>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['hospital', 'healthcare', 'planning'] }
  },
  {
    name: 'Fitness Coach Dashboard',
    category: 'Healthcare',
    description: 'Client workout plans and nutrition logs.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#111827" />
      <rect x="40" y="40" width="300" height="200" rx="24" fill="#374151" />
      <text x="64" y="80" fill="white" font-family="Inter" font-size="18" font-weight="700">Active Clients</text>
      <text x="64" y="140" fill="#10B981" font-family="Inter" font-size="48" font-weight="800">24</text>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['fitness', 'wellness', 'coaching'] }
  },
  {
    name: 'Mental Health App Admin',
    category: 'Healthcare',
    description: 'Mood tracking trends and appointments.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#EEF2FF" />
      <circle cx="600" cy="400" r="300" fill="white" opacity="0.5" />
      <text x="600" y="100" fill="#4338CA" font-family="Inter" font-size="24" font-weight="700" text-anchor="middle">Patient Well-being Index</text>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['mental-health', 'healthcare', 'wellness'] }
  },
  {
    name: 'Pharmacy Inventory SaaS',
    category: 'Healthcare',
    description: 'Expiry date alerts and reordering.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="white" />
      <g transform="translate(40, 40)">
        <rect width="1120" height="80" rx="12" fill="#FFFBEB" stroke="#F59E0B" />
        <text x="80" y="48" fill="#92400E" font-family="Inter" font-size="16" font-weight="700">ALERTS: 12 Items Expiring within 30 days</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['pharmacy', 'healthcare', 'inventory'] }
  },
  {
    name: 'Clinical Trial Manager',
    category: 'Healthcare',
    description: 'Participant enrollment and data analysis.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F8FAFC" />
      <g transform="translate(600, 400)">
        <circle r="150" fill="none" stroke="#E2E8F0" stroke-width="40" />
        <path d="M 0 -150 A 150 150 0 0 1 150 0" fill="none" stroke="#6366F1" stroke-width="40" />
        <text x="0" y="10" fill="#1E293B" font-family="Inter" font-size="32" font-weight="800" text-anchor="middle">25% Enrolled</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['clinical-trial', 'healthcare', 'research'] }
  },
  {
    name: 'Radiology AI Viewer',
    category: 'Healthcare',
    description: 'DICOM image viewer with AI heatmaps.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="black" />
      <rect x="200" y="100" width="800" height="600" fill="#111" />
      <circle cx="600" cy="400" r="100" fill="#EF4444" fill-opacity="0.3" filter="blur(20px)" />
      <text x="40" y="40" fill="white" font-family="Inter" font-size="14">Patient: #4201 - Chest X-Ray</text>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['radiology', 'ai', 'healthcare'] }
  },

  // --- OPERATIONS & HR (28-34) ---
  {
    name: 'Applicant Tracking System',
    category: 'Operations',
    description: 'Kanban board for hiring stages.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F1F5F9" />
      <g transform="translate(40, 40)">
        <rect width="300" height="720" rx="12" fill="#E2E8F0" />
        <text x="20" y="30" fill="#475569" font-family="Inter" font-size="14" font-weight="700">SCREENING</text>
        <rect x="10" y="50" width="280" height="120" rx="8" fill="white" />
        <text x="24" y="80" fill="#1E293B" font-family="Inter" font-size="16" font-weight="600">John Doe</text>
        <text x="24" y="105" fill="#64748B" font-family="Inter" font-size="12">Senior Frontend Engineer</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['ats', 'hr', 'hiring'] }
  },
  {
    name: 'Employee Onboarding Hub',
    category: 'Operations',
    description: 'Checklist for new hires.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="white" />
      <g transform="translate(40, 40)">
        <text x="0" y="0" fill="#1E293B" font-family="Inter" font-size="24" font-weight="800">Welcome to the Team!</text>
        <rect x="0" y="40" width="1120" height="10" rx="5" fill="#F1F5F9" />
        <rect x="0" y="40" width="400" height="10" rx="5" fill="#10B981" />
        <text x="0" y="80" fill="#64748B" font-family="Inter" font-size="14">3 of 8 tasks completed</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['onboarding', 'hr', 'employee'] }
  },
  {
    name: 'Project Resource Planner',
    category: 'Operations',
    description: 'Team bandwidth charts.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F8FAFC" />
      <g transform="translate(40, 40)">
        <text x="0" y="0" fill="#1E293B" font-family="Inter" font-size="20" font-weight="700">Team Bandwidth</text>
        <rect x="0" y="40" width="1120" height="300" rx="16" fill="white" stroke="#E2E8F0" />
        <g transform="translate(40, 80)">
          <text x="0" y="20" fill="#1E293B" font-family="Inter" font-size="14">Design Team</text>
          <rect x="150" y="5" width="800" height="24" rx="12" fill="#EEF2FF" />
          <rect x="150" y="5" width="700" height="24" rx="12" fill="#6366F1" />
        </g>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['resource-planning', 'operations', 'team'] }
  },
  {
    name: 'Facility Management SaaS',
    category: 'Operations',
    description: 'Office floor maps and desk booking.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="white" />
      <g transform="translate(100, 100)">
        <rect width="1000" height="600" fill="none" stroke="#CBD5E1" stroke-width="2" />
        <rect x="50" y="50" width="100" height="100" rx="4" fill="#DCFCE7" stroke="#22C55E" />
        <text x="100" y="105" fill="#166534" font-family="Inter" font-size="12" text-anchor="middle">Desk A1</text>
        <rect x="200" y="50" width="100" height="100" rx="4" fill="#FEE2E2" stroke="#EF4444" />
        <text x="250" y="105" fill="#991B1B" font-family="Inter" font-size="12" text-anchor="middle">Desk A2</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['facility', 'operations', 'real-estate'] }
  },
  {
    name: 'Legal Tech Contract Manager',
    category: 'Operations',
    description: 'Version control and e-signatures.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F8FAFC" />
      <rect x="40" y="40" width="600" height="720" rx="12" fill="white" stroke="#E2E8F0" />
      <text x="80" y="100" fill="#1E293B" font-family="Inter" font-size="24" font-weight="700">MSA_v2_Final.pdf</text>
      <line x1="80" y1="150" x2="520" y2="150" stroke="#F1F5F9" stroke-width="2" />
      <rect x="80" y="650" width="200" height="60" rx="8" fill="#F1F5F9" />
      <text x="100" y="685" fill="#64748B" font-family="Cursive" font-size="20">Alex Sign</text>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['legal', 'operations', 'contracts'] }
  },
  {
    name: 'Customer Success Dashboard',
    category: 'Operations',
    description: 'Health scores and renewal alerts.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F8FAFC" />
      <g transform="translate(40, 40)">
        <rect width="300" height="200" rx="16" fill="white" stroke="#E2E8F0" />
        <text x="150" y="60" fill="#64748B" font-family="Inter" font-size="14" text-anchor="middle">Customer Health Score</text>
        <text x="150" y="130" fill="#10B981" font-family="Inter" font-size="64" font-weight="800" text-anchor="middle">92</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['customer-success', 'operations', 'crm'] }
  },
  {
    name: 'Learning Management System',
    category: 'Operations',
    description: 'Course creation and student progress.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="white" />
      <rect width="240" height="800" fill="#4F46E5" />
      <g transform="translate(280, 40)">
        <text x="0" y="0" fill="#1E293B" font-family="Inter" font-size="24" font-weight="700">Course: React Mastery</text>
        <rect x="0" y="40" width="880" height="200" rx="16" fill="#F1F5F9" />
        <text x="24" y="80" fill="#1E293B" font-family="Inter" font-size="18" font-weight="600">Module 1: Introduction</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['lms', 'education', 'hr'] }
  },

  // --- MARKETING & CREATIVE (35-41) ---
  {
    name: 'Social Media Scheduler',
    category: 'Marketing',
    description: 'Calendar view for post scheduling.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F8FAFC" />
      <g transform="translate(40, 40)">
        <text x="0" y="0" fill="#1E293B" font-family="Inter" font-size="24" font-weight="700">May 2024</text>
        <rect x="0" y="40" width="1120" height="680" rx="12" fill="white" stroke="#E2E8F0" />
        <line x1="160" y1="40" x2="160" y2="720" stroke="#F1F5F9" />
        <rect x="170" y="100" width="140" height="80" rx="8" fill="#6366F1" />
        <text x="180" y="130" fill="white" font-family="Inter" font-size="12" font-weight="600">Instagram Post</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['social-media', 'marketing', 'calendar'] }
  },
  {
    name: 'Influencer Marketing Hub',
    category: 'Marketing',
    description: 'Campaign ROI and creator discovery.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="white" />
      <g transform="translate(40, 40)">
        <rect width="300" height="400" rx="24" fill="#F1F5F9" />
        <circle cx="150" cy="100" r="50" fill="#CBD5E1" />
        <text x="150" y="180" fill="#1E293B" font-family="Inter" font-size="18" font-weight="700" text-anchor="middle">Casey Creative</text>
        <text x="150" y="210" fill="#6366F1" font-family="Inter" font-size="14" font-weight="600" text-anchor="middle">2.4M Followers</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['influencer', 'marketing', 'creators'] }
  },
  {
    name: 'Email Marketing Builder',
    category: 'Marketing',
    description: 'Drag-and-drop newsletter editor.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F1F5F9" />
      <rect x="300" y="40" width="600" height="720" fill="white" shadow="0 4px 6px rgba(0,0,0,0.1)" />
      <rect x="340" y="80" width="520" height="200" fill="#E2E8F0" />
      <text x="600" y="320" fill="#1E293B" font-family="Inter" font-size="24" font-weight="800" text-anchor="middle">Your Weekly Update</text>
      <rect x="0" y="0" width="260" height="800" fill="white" stroke="#E2E8F0" />
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['email', 'marketing', 'newsletter'] }
  },
  {
    name: 'SEO Audit Dashboard',
    category: 'Marketing',
    description: 'Keyword rankings and site health.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F8FAFC" />
      <g transform="translate(40, 40)">
        <rect width="1120" height="150" rx="16" fill="white" stroke="#E2E8F0" />
        <text x="40" y="60" fill="#64748B" font-family="Inter" font-size="14">Overall SEO Health</text>
        <text x="40" y="110" fill="#10B981" font-family="Inter" font-size="48" font-weight="800">84/100</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['seo', 'marketing', 'analytics'] }
  },
  {
    name: 'Digital Asset Management',
    category: 'Marketing',
    description: 'Versioning for brand assets.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="white" />
      <g transform="translate(40, 40)">
        <rect width="250" height="250" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />
        <rect x="50" y="50" width="150" height="150" fill="#6366F1" rx="8" />
        <text x="125" y="225" fill="#1E293B" font-family="Inter" font-size="14" font-weight="600" text-anchor="middle">Logo_Final_v2.svg</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['dam', 'marketing', 'assets'] }
  },
  {
    name: 'Ad Campaign Manager',
    category: 'Marketing',
    description: 'Multi-platform spend tracking.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F1F5F9" />
      <g transform="translate(40, 40)">
        <rect width="540" height="300" rx="16" fill="white" stroke="#E2E8F0" />
        <text x="24" y="40" fill="#1E293B" font-family="Inter" font-size="16" font-weight="700">Google Ads Spend</text>
        <text x="24" y="100" fill="#1E293B" font-family="Inter" font-size="36" font-weight="800">$12,402</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['ads', 'marketing', 'ppc'] }
  },
  {
    name: 'User Feedback Tool',
    category: 'Marketing',
    description: 'Feature request voting board.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="white" />
      <g transform="translate(40, 40)">
        <rect width="1120" height="100" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />
        <rect x="20" y="25" width="50" height="50" rx="8" fill="#EEF2FF" />
        <text x="45" y="50" fill="#6366F1" font-family="Inter" font-size="18" font-weight="800" text-anchor="middle">↑</text>
        <text x="90" y="50" fill="#1E293B" font-family="Inter" font-size="18" font-weight="700">Dark Mode Support</text>
        <text x="90" y="75" fill="#64748B" font-family="Inter" font-size="14">428 Votes</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['feedback', 'marketing', 'roadmap'] }
  },

  // --- REAL ESTATE & LOGISTICS (42-46) ---
  {
    name: 'Property Management SaaS',
    category: 'Real Estate',
    description: 'Rent collection and maintenance requests.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F8FAFC" />
      <g transform="translate(40, 40)">
        <text x="0" y="0" fill="#1E293B" font-family="Inter" font-size="24" font-weight="700">Portfolio Overview</text>
        <g transform="translate(0, 40)">
          <rect width="350" height="200" rx="16" fill="white" stroke="#E2E8F0" />
          <text x="24" y="40" fill="#64748B" font-family="Inter" font-size="14">Monthly Rent Collected</text>
          <text x="24" y="90" fill="#10B981" font-family="Inter" font-size="36" font-weight="800">$84,200</text>
        </g>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['property', 'real-estate', 'rent'] }
  },
  {
    name: 'Warehouse Management System',
    category: 'Logistics',
    description: 'SKU tracking and pallet locations.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#1E293B" />
      <g transform="translate(100, 100)">
        <rect width="1000" height="600" fill="none" stroke="#475569" stroke-width="2" />
        <rect x="50" y="50" width="200" height="500" fill="#334155" rx="4" />
        <rect x="60" y="60" width="180" height="40" fill="#6366F1" rx="2" />
        <text x="150" y="85" fill="white" font-family="Inter" font-size="12" text-anchor="middle">Aisle 1 - Section A</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['warehouse', 'logistics', 'inventory'] }
  },
  {
    name: 'Fleet Tracking Hub',
    category: 'Logistics',
    description: 'Real-time GPS tracking for delivery trucks.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#E2E8F0" />
      <path d="M 0 400 Q 600 0 1200 400 T 0 800" fill="none" stroke="white" stroke-width="40" />
      <circle cx="600" cy="400" r="16" fill="#EF4444" />
      <text x="620" y="405" fill="#1E293B" font-family="Inter" font-size="14" font-weight="700">Truck #842 (On Route)</text>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['fleet', 'logistics', 'gps'] }
  },
  {
    name: 'Short-term Rental Manager',
    category: 'Real Estate',
    description: 'Syncing calendars across Airbnb/Booking.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="white" />
      <g transform="translate(40, 40)">
        <text x="0" y="0" fill="#1E293B" font-family="Inter" font-size="24" font-weight="700">Booking Calendar</text>
        <rect x="0" y="40" width="1120" height="100" rx="12" fill="#FEF2F2" />
        <text x="24" y="95" fill="#EF4444" font-family="Inter" font-size="16" font-weight="700">Airbnb: New Booking for 'Sunset Villa'</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['airbnb', 'real-estate', 'rental'] }
  },
  {
    name: 'Construction Project Hub',
    category: 'Real Estate',
    description: 'Blueprints and contractor schedules.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F8FAFC" />
      <g transform="translate(40, 40)">
        <text x="0" y="0" fill="#1E293B" font-family="Inter" font-size="24" font-weight="700">Site: Oakwood Tower</text>
        <rect x="0" y="40" width="1120" height="400" rx="16" fill="#E2E8F0" />
        <path d="M 100 100 L 1000 100 L 1000 350 L 100 350 Z" fill="white" stroke="#64748B" />
        <text x="550" y="235" fill="#94A3B8" font-family="Inter" font-size="18" text-anchor="middle">Blueprint Preview</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['construction', 'real-estate', 'project-management'] }
  },

  // --- NICHE & SPECIALIZED (47-50) ---
  {
    name: 'Restaurant POS SaaS',
    category: 'Niche',
    description: 'Table layout and menu management.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F1F5F9" />
      <g transform="translate(40, 40)">
        <rect width="150" height="150" rx="75" fill="#10B981" />
        <text x="75" y="85" fill="white" font-family="Inter" font-size="18" font-weight="800" text-anchor="middle">T1</text>
        <rect x="200" y="0" width="150" height="150" rx="75" fill="#CBD5E1" />
        <text x="275" y="85" fill="#475569" font-family="Inter" font-size="18" font-weight="800" text-anchor="middle">T2</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['restaurant', 'pos', 'hospitality'] }
  },
  {
    name: 'Event Management Suite',
    category: 'Niche',
    description: 'Ticketing and attendee lists.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F8FAFC" />
      <rect x="400" y="200" width="400" height="200" rx="24" fill="white" stroke="#E2E8F0" />
      <text x="600" y="280" fill="#1E293B" font-family="Inter" font-size="24" font-weight="800" text-anchor="middle">TechConf 2024</text>
      <text x="600" y="320" fill="#6366F1" font-family="Inter" font-size="16" font-weight="600" text-anchor="middle">1,204 Tickets Sold</text>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['events', 'ticketing', 'management'] }
  },
  {
    name: 'Non-Profit Donor CRM',
    category: 'Niche',
    description: 'Fundraising goals and automated receipts.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#FDF2F8" />
      <g transform="translate(400, 300)">
        <circle r="100" fill="none" stroke="#DBEAFE" stroke-width="20" />
        <path d="M 0 -100 A 100 100 0 0 1 100 0" fill="none" stroke="#EC4899" stroke-width="20" />
        <text x="0" y="10" fill="#1E293B" font-family="Inter" font-size="24" font-weight="800" text-anchor="middle">$12K Raised</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['non-profit', 'crm', 'fundraising'] }
  },
  {
    name: 'Salon Booking App',
    category: 'Niche',
    description: 'Stylist availability and loyalty points.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="white" />
      <g transform="translate(40, 40)">
        <rect width="300" height="100" rx="16" fill="#F8FAFC" stroke="#E2E8F0" />
        <text x="24" y="45" fill="#1E293B" font-family="Inter" font-size="16" font-weight="700">Stylist: Marco V.</text>
        <text x="24" y="75" fill="#10B981" font-family="Inter" font-size="14">AVAILABLE NOW</text>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['salon', 'booking', 'services'] }
  },
  {
    name: 'E-learning Course Player',
    category: 'Niche',
    description: 'Video interface, sidebar for lessons, and notes tab.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#0F172A" />
      <rect x="0" y="0" width="1200" height="60" fill="#1E293B" />
      <text x="24" y="38" fill="white" font-family="Inter" font-size="18" font-weight="600">Course: Advanced SVG Design</text>
      <rect x="40" y="100" width="800" height="450" fill="black" rx="12" />
      <circle cx="440" cy="325" r="40" fill="white" opacity="0.2" />
      <path d="M 430 310 L 460 325 L 430 340 Z" fill="white" />
      <rect x="880" y="100" width="280" height="660" rx="12" fill="#1E293B" />
      <text x="900" y="140" fill="white" font-family="Inter" font-size="16" font-weight="700">Lesson List</text>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['elearning', 'video', 'education'] }
  },
  {
    name: 'Podcast Host Platform',
    category: 'Niche',
    description: 'Episode uploading and analytics dashboard.',
    svg_code: `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#F8FAFC" />
      <g transform="translate(40, 40)">
        <text x="0" y="0" fill="#1E293B" font-family="Inter" font-size="24" font-weight="800">My Podcast: Tech Talks</text>
        <rect x="0" y="40" width="300" height="300" rx="24" fill="#6366F1" />
        <text x="150" y="190" fill="white" font-family="Inter" font-size="48" font-weight="800" text-anchor="middle">TT</text>
        <g transform="translate(340, 40)">
          <rect width="740" height="120" rx="16" fill="white" stroke="#E2E8F0" />
          <text x="24" y="40" fill="#64748B" font-family="Inter" font-size="14">Total Downloads</text>
          <text x="24" y="90" fill="#1E293B" font-family="Inter" font-size="32" font-weight="700">1.2M</text>
        </g>
      </g>
    </svg>`,
    metadata: { type: 'DASHBOARD', tags: ['podcast', 'audio', 'analytics'] }
  }
];

async function seed() {
  try {
    console.log(`Seeding ${templates.length} comprehensive SaaS SVG templates...`);
    for (const template of templates) {
      await pool.query(
        `INSERT INTO public.templates (name, category, description, svg_code, metadata)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (name) DO UPDATE SET
            category = $2,
            description = $3,
            svg_code = $4,
            metadata = $5`,
        [template.name, template.category, template.description, template.svg_code, template.metadata]
      );
    }
    console.log('Comprehensive templates seeded successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
