/**
 * SVG Component Library for Premium SaaS Landing Pages
 * Follows "Full Application" Component Map with Modern Design Trends:
 * - Depth & Gradients (feGaussianBlur, feOffset)
 * - Glassmorphism (Semi-transparent fills)
 * - Sophisticated Typography (Font weights, Spacing)
 * - Complex UI Mockups (Detailed Dashboards)
 */

export const colors = {
  primary: '#6366F1',   // Indigo
  secondary: '#8B5CF6', // Violet
  accent: '#10B981',    // Emerald
  bg: '#0F172A',        // Slate 900
  card: 'rgba(30, 41, 59, 0.7)', // Slate 800 with transparency
  border: 'rgba(255, 255, 255, 0.1)',
  text: '#F8FAFC',
  textMuted: '#94A3B8'
};

export function genNav(projectName = "SaaS") {
  return `
  <g id="Navigation" transform="translate(0, 24)">
    <defs>
      <filter id="navBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
      </filter>
    </defs>
    <!-- Glassmorphism Background -->
    <rect x="100" y="0" width="1000" height="80" rx="40" fill="white" fill-opacity="0.03" stroke="${colors.border}" stroke-width="1" />
    <text x="140" y="48" fill="white" font-family="Inter" font-size="22" font-weight="900" letter-spacing="-1">${projectName.toUpperCase()}</text>

    <g transform="translate(450, 48)">
      <text x="0" y="0" fill="${colors.textMuted}" font-family="Inter" font-size="14" font-weight="600">Features</text>
      <text x="100" y="0" fill="${colors.textMuted}" font-family="Inter" font-size="14" font-weight="600">Solutions</text>
      <text x="200" y="0" fill="${colors.textMuted}" font-family="Inter" font-size="14" font-weight="600">Pricing</text>
    </g>

    <g transform="translate(920, 16)">
      <rect width="160" height="48" rx="24" fill="${colors.primary}" />
      <text x="80" y="30" fill="white" font-family="Inter" font-size="14" font-weight="700" text-anchor="middle">Start Free Trial</text>
    </g>
  </g>`;
}

export function genHero(title, subtitle) {
  return `
  <g id="Hero" transform="translate(0, 200)">
    <defs>
      <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#818CF8;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#C084FC;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#FB7185;stop-opacity:1" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="30" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Background Decoration -->
    <circle cx="1000" cy="0" r="200" fill="${colors.primary}" fill-opacity="0.1" filter="url(#glow)" />
    <circle cx="200" cy="400" r="150" fill="${colors.secondary}" fill-opacity="0.1" filter="url(#glow)" />

    <text x="600" y="0" fill="url(#heroGradient)" font-family="Inter" font-size="72" font-weight="900" text-anchor="middle" letter-spacing="-2">${title}</text>
    <text x="600" y="80" fill="${colors.textMuted}" font-family="Inter" font-size="22" text-anchor="middle" font-weight="400" opacity="0.8">${subtitle}</text>

    <g transform="translate(100, 180)">
      <!-- Main Dashboard Mockup -->
      <rect width="1000" height="560" rx="32" fill="#1E293B" stroke="${colors.primary}" stroke-width="1" stroke-opacity="0.3" />

      <!-- Sidebar -->
      <rect x="0" y="0" width="240" height="560" rx="32" fill="white" fill-opacity="0.02" />
      <g transform="translate(30, 40)">
        <rect width="180" height="12" rx="6" fill="white" fill-opacity="0.1" />
        <rect y="40" width="120" height="12" rx="6" fill="white" fill-opacity="0.05" />
        <rect y="80" width="140" height="12" rx="6" fill="white" fill-opacity="0.05" />
      </g>

      <!-- Content Area -->
      <g transform="translate(280, 40)">
        <text x="0" y="20" fill="white" font-family="Inter" font-size="24" font-weight="700">Analytics Overview</text>

        <!-- Stat Cards -->
        <g transform="translate(0, 60)">
          <rect width="210" height="120" rx="20" fill="white" fill-opacity="0.03" stroke="${colors.border}" />
          <text x="20" y="40" fill="${colors.textMuted}" font-family="Inter" font-size="12">Active Users</text>
          <text x="20" y="85" fill="white" font-family="Inter" font-size="32" font-weight="800">12.4k</text>

          <rect x="230" y="0" width="210" height="120" rx="20" fill="white" fill-opacity="0.03" stroke="${colors.border}" />
          <text x="250" y="40" fill="${colors.textMuted}" font-family="Inter" font-size="12">Revenue</text>
          <text x="250" y="85" fill="${colors.accent}" font-family="Inter" font-size="32" font-weight="800">$48.2k</text>
        </g>

        <!-- Main Chart -->
        <g transform="translate(0, 210)">
          <rect width="680" height="280" rx="24" fill="white" fill-opacity="0.02" stroke="${colors.border}" />
          <path d="M 40 220 Q 150 180 250 120 T 450 60 T 640 40" fill="none" stroke="${colors.primary}" stroke-width="4" stroke-linecap="round" />
          <path d="M 40 220 Q 150 180 250 120 T 450 60 T 640 40 L 640 280 L 40 280 Z" fill="url(#heroGradient)" fill-opacity="0.1" />
        </g>
      </g>

      <!-- Browser Controls -->
      <circle cx="30" cy="24" r="6" fill="#FF5F56" />
      <circle cx="54" cy="24" r="6" fill="#FFBD2E" />
      <circle cx="78" cy="24" r="6" fill="#27C93F" />
    </g>
  </g>`;
}

export function genSystemDiagram(nicheName = "SaaS", components = []) {
  return `
  <g id="SystemArchitecture" transform="translate(100, 3200)">
    <text x="500" y="0" fill="white" font-family="Inter" font-size="36" font-weight="900" text-anchor="middle" letter-spacing="-1">Core Infrastructure</text>
    <g transform="translate(0, 100)">
      <!-- Client -->
      <g>
        <rect x="0" y="80" width="140" height="80" rx="16" fill="${colors.primary}" />
        <text x="70" y="125" fill="white" font-family="Inter" font-size="14" font-weight="700" text-anchor="middle">Client App</text>
        <rect x="20" y="80" width="100" height="4" rx="2" fill="white" fill-opacity="0.3" />
      </g>

      <!-- Arrows with Glow -->
      <path d="M 140 120 L 240 120" stroke="${colors.primary}" stroke-width="3" marker-end="url(#arrow-head)" opacity="0.6" />

      <!-- API Gateway -->
      <g transform="translate(250, 40)">
        <rect width="180" height="160" rx="24" fill="white" fill-opacity="0.05" stroke="${colors.border}" />
        <text x="90" y="40" fill="white" font-family="Inter" font-size="16" font-weight="800" text-anchor="middle">API Gateway</text>
        <rect x="30" y="70" width="120" height="12" rx="6" fill="white" fill-opacity="0.1" />
        <rect x="30" y="100" width="120" height="12" rx="6" fill="white" fill-opacity="0.1" />
        <rect x="30" y="130" width="80" height="12" rx="6" fill="${colors.accent}" />
      </g>

      <!-- Microservices -->
      <g transform="translate(480, 0)">
        <g transform="translate(0, 0)">
          <rect width="160" height="70" rx="12" fill="${colors.bg}" stroke="${colors.primary}" stroke-width="1" />
          <text x="80" y="40" fill="white" font-family="Inter" font-size="13" font-weight="600" text-anchor="middle">${components[0] || 'Auth Engine'}</text>
        </g>
        <g transform="translate(0, 90)">
          <rect width="160" height="70" rx="12" fill="${colors.bg}" stroke="${colors.secondary}" stroke-width="1" />
          <text x="80" y="40" fill="white" font-family="Inter" font-size="13" font-weight="600" text-anchor="middle">${components[1] || 'Core Logic'}</text>
        </g>
        <g transform="translate(0, 180)">
          <rect width="160" height="70" rx="12" fill="${colors.bg}" stroke="${colors.accent}" stroke-width="1" />
          <text x="80" y="40" fill="white" font-family="Inter" font-size="13" font-weight="600" text-anchor="middle">${components[2] || 'Data Stream'}</text>
        </g>
      </g>

      <!-- Database -->
      <g transform="translate(720, 70)">
        <path d="M 0 15 C 0 0 120 0 120 15 L 120 90 C 120 105 0 105 0 90 Z" fill="${colors.bg}" stroke="${colors.accent}" stroke-width="2" />
        <ellipse cx="60" cy="15" rx="60" ry="15" fill="#1E293B" stroke="${colors.accent}" />
        <text x="60" y="65" fill="white" font-family="Inter" font-size="14" font-weight="800" text-anchor="middle">POSTGRES</text>
      </g>
    </g>
    <defs>
      <marker id="arrow-head" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${colors.primary}" />
      </marker>
    </defs>
  </g>`;
}

export function genTestimonials() {
  return `
  <g id="Testimonials" transform="translate(100, 3800)">
    <text x="500" y="0" fill="white" font-family="Inter" font-size="36" font-weight="900" text-anchor="middle">Trusted by Industry Leaders</text>
    <g transform="translate(0, 80)">
      <rect width="480" height="220" rx="32" fill="white" fill-opacity="0.03" stroke="${colors.border}" />
      <circle cx="60" cy="60" r="24" fill="${colors.primary}" fill-opacity="0.2" />
      <text x="100" y="65" fill="white" font-family="Inter" font-size="18" font-weight="700">Sarah Chen</text>
      <text x="100" y="85" fill="${colors.textMuted}" font-family="Inter" font-size="14">CTO at TechScale</text>
      <text x="40" y="140" fill="white" font-family="Inter" font-size="18" font-style="italic" opacity="0.9">"This platform revolutionized our entire development workflow. Highly recommended."</text>

      <rect x="520" y="0" width="480" height="220" rx="32" fill="white" fill-opacity="0.03" stroke="${colors.border}" />
      <circle cx="580" cy="60" r="24" fill="${colors.secondary}" fill-opacity="0.2" />
      <text x="620" y="65" fill="white" font-family="Inter" font-size="18" font-weight="700">Marcus Wright</text>
      <text x="40" y="140" transform="translate(520, 0)" fill="white" font-family="Inter" font-size="18" font-style="italic" opacity="0.9">"The best-in-class performance we were looking for. 10/10."</text>
    </g>
  </g>`;
}

export function genFAQ() {
  return `
  <g id="FAQ" transform="translate(100, 4200)">
    <text x="0" y="0" fill="white" font-family="Inter" font-size="36" font-weight="900">FAQ</text>
    <g transform="translate(0, 80)">
      <rect width="1000" height="80" rx="16" fill="white" fill-opacity="0.03" stroke="${colors.border}" />
      <text x="30" y="45" fill="white" font-family="Inter" font-size="18" font-weight="700">How secure is my data?</text>
      <text x="960" y="45" fill="${colors.primary}" font-family="Inter" font-size="24" font-weight="700" text-anchor="middle">+</text>

      <g transform="translate(0, 100)">
        <rect width="1000" height="80" rx="16" fill="white" fill-opacity="0.03" stroke="${colors.border}" />
        <text x="30" y="45" fill="white" font-family="Inter" font-size="18" font-weight="700">Can I export to Figma?</text>
        <text x="960" y="45" fill="${colors.primary}" font-family="Inter" font-size="24" font-weight="700" text-anchor="middle">+</text>
      </g>
    </g>
  </g>`;
}

export function genCTA() {
  return `
  <g id="CTA" transform="translate(100, 4500)">
    <defs>
      <linearGradient id="ctaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#6366F1;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="1000" height="300" rx="40" fill="url(#ctaGradient)" />
    <text x="500" y="100" fill="white" font-family="Inter" font-size="42" font-weight="900" text-anchor="middle" letter-spacing="-2">Ready to scale your business?</text>
    <text x="500" y="140" fill="white" font-family="Inter" font-size="18" text-anchor="middle" opacity="0.8">Join 500+ teams building the future with us.</text>

    <g transform="translate(400, 180)">
      <rect width="200" height="60" rx="30" fill="white" />
      <text x="100" y="36" fill="${colors.primary}" font-family="Inter" font-size="16" font-weight="800" text-anchor="middle">Get Started Now</text>
    </g>
  </g>`;
}

export function genBento(features = []) {
  return `
  <g id="Features" transform="translate(100, 1000)">
    <text x="500" y="-40" fill="white" font-family="Inter" font-size="36" font-weight="900" text-anchor="middle" letter-spacing="-1">Powerful Features</text>

    <g id="BentoGrid">
      <rect width="660" height="380" rx="32" fill="white" fill-opacity="0.03" stroke="${colors.border}" />
      <g transform="translate(40, 50)">
        <rect width="48" height="48" rx="12" fill="${colors.primary}" fill-opacity="0.2" />
        <text x="0" y="90" fill="white" font-family="Inter" font-size="28" font-weight="800">${features[0]?.title || 'AI Insights'}</text>
        <text x="0" y="125" fill="${colors.textMuted}" font-family="Inter" font-size="18" width="500">${features[0]?.desc || 'Harness the power of machine learning.'}</text>
      </g>

      <rect x="680" y="0" width="320" height="380" rx="32" fill="${colors.primary}" />
      <g transform="translate(720, 50)">
        <text x="0" y="40" fill="white" font-family="Inter" font-size="28" font-weight="800">${features[1]?.title || 'Cloud Sync'}</text>
        <text x="0" y="80" fill="white" fill-opacity="0.7" font-family="Inter" font-size="16">${features[1]?.desc || 'Instant global backup.'}</text>
      </g>

      <rect x="0" y="400" width="320" height="380" rx="32" fill="white" fill-opacity="0.02" stroke="${colors.border}" />
      <g transform="translate(40, 450)">
        <text x="0" y="40" fill="white" font-family="Inter" font-size="24" font-weight="800">Secure</text>
      </g>

      <rect x="340" y="400" width="660" height="380" rx="32" fill="white" fill-opacity="0.03" stroke="${colors.border}" />
      <g transform="translate(380, 450)">
        <text x="0" y="40" fill="white" font-family="Inter" font-size="28" font-weight="800">Collaboration</text>
        <rect y="70" width="400" height="8" rx="4" fill="white" fill-opacity="0.05" />
      </g>
    </g>
  </g>`;
}

export function genPricing() {
  return `
  <g id="Pricing" transform="translate(100, 2000)">
    <text x="500" y="0" fill="white" font-family="Inter" font-size="48" font-weight="900" text-anchor="middle" letter-spacing="-2">Transparent Pricing</text>
    <g transform="translate(0, 100)">
      <!-- Starter -->
      <g>
        <rect width="320" height="520" rx="32" fill="white" fill-opacity="0.02" stroke="${colors.border}" />
        <text x="40" y="60" fill="${colors.textMuted}" font-family="Inter" font-size="16" font-weight="700">STARTER</text>
        <text x="40" y="120" fill="white" font-family="Inter" font-size="56" font-weight="900">$0</text>
        <text x="40" y="150" fill="${colors.textMuted}" font-family="Inter" font-size="14">Free forever for individuals</text>
        <rect x="40" y="430" width="240" height="56" rx="28" fill="white" fill-opacity="0.05" stroke="${colors.border}" />
        <text x="160" y="465" fill="white" font-family="Inter" font-size="16" font-weight="700" text-anchor="middle">Join Free</text>
      </g>

      <!-- Pro (Highlighted) -->
      <g transform="translate(340, -40)">
        <rect width="340" height="600" rx="32" fill="#1E293B" stroke="${colors.primary}" stroke-width="2" />
        <rect x="110" y="24" width="120" height="30" rx="15" fill="${colors.primary}" />
        <text x="170" y="44" fill="white" font-family="Inter" font-size="12" font-weight="900" text-anchor="middle">MOST POPULAR</text>
        <text x="40" y="100" fill="white" font-family="Inter" font-size="18" font-weight="800">PRO PLAN</text>
        <text x="40" y="160" fill="white" font-family="Inter" font-size="64" font-weight="900">$49</text>
        <text x="150" y="160" fill="${colors.textMuted}" font-family="Inter" font-size="18">/mo</text>

        <g transform="translate(40, 220)">
          <circle cx="10" cy="10" r="8" fill="${colors.accent}" fill-opacity="0.2" />
          <text x="30" y="15" fill="white" font-family="Inter" font-size="14">Unlimited Projects</text>
          <g transform="translate(0, 40)">
            <circle cx="10" cy="10" r="8" fill="${colors.accent}" fill-opacity="0.2" />
            <text x="30" y="15" fill="white" font-family="Inter" font-size="14">Advanced Analytics</text>
          </g>
        </g>

        <rect x="40" y="500" width="260" height="64" rx="32" fill="${colors.primary}" />
        <text x="170" y="540" fill="white" font-family="Inter" font-size="18" font-weight="800" text-anchor="middle">Get Started</text>
      </g>

      <!-- Enterprise -->
      <g transform="translate(700, 0)">
        <rect width="320" height="520" rx="32" fill="white" fill-opacity="0.02" stroke="${colors.border}" />
        <text x="40" y="60" fill="${colors.textMuted}" font-family="Inter" font-size="16" font-weight="700">ENTERPRISE</text>
        <text x="40" y="120" fill="white" font-family="Inter" font-size="48" font-weight="900">Custom</text>
        <text x="40" y="150" fill="${colors.textMuted}" font-family="Inter" font-size="14">For large scale operations</text>
      </g>
    </g>
  </g>`;
}

export function genFooter(projectName = "SaaS") {
  return `
  <g id="Footer" transform="translate(0, 4800)">
    <rect width="1200" height="400" fill="#020617" />
    <g transform="translate(100, 80)">
      <text x="0" y="0" fill="white" font-family="Inter" font-size="28" font-weight="900" letter-spacing="-1">${projectName.toUpperCase()}</text>
      <text x="0" y="40" fill="${colors.textMuted}" font-family="Inter" font-size="16" width="300">Building the digital infrastructure of tomorrow.</text>

      <g transform="translate(500, 0)">
        <text x="0" y="0" fill="white" font-family="Inter" font-size="16" font-weight="800">PRODUCT</text>
        <text x="0" y="40" fill="${colors.textMuted}" font-family="Inter" font-size="14">Features</text>
        <text x="0" y="70" fill="${colors.textMuted}" font-family="Inter" font-size="14">API</text>
        <text x="0" y="100" fill="${colors.textMuted}" font-family="Inter" font-size="14">Solutions</text>
      </g>

      <g transform="translate(750, 0)">
        <text x="0" y="0" fill="white" font-family="Inter" font-size="16" font-weight="800">COMPANY</text>
        <text x="0" y="40" fill="${colors.textMuted}" font-family="Inter" font-size="14">About</text>
        <text x="0" y="70" fill="${colors.textMuted}" font-family="Inter" font-size="14">Careers</text>
      </g>
    </g>
    <line x1="100" y1="320" x2="1100" y2="320" stroke="${colors.border}" stroke-width="1" />
    <text x="600" y="360" fill="${colors.textMuted}" font-family="Inter" font-size="14" text-anchor="middle">© 2024 ${projectName}. Engineered for excellence.</text>
  </g>`;
}

export function genAboutUs() {
  return `
  <g id="AboutUs" transform="translate(100, 2800)">
    <text x="0" y="0" fill="white" font-family="Inter" font-size="36" font-weight="900">About Our Vision</text>
    <text x="0" y="50" fill="${colors.textMuted}" font-family="Inter" font-size="18" width="600" opacity="0.9">
      We are a global team of elite designers and engineers committed to pushing the boundaries of what is possible in the SaaS ecosystem. Our mission is to simplify the complex.
    </text>
  </g>`;
}

export function genServices() {
  return `
  <g id="Services" transform="translate(100, 1800)">
    <text x="500" y="0" fill="white" font-family="Inter" font-size="36" font-weight="900" text-anchor="middle">Strategic Solutions</text>
    <g transform="translate(0, 80)">
      <rect width="320" height="180" rx="24" fill="white" fill-opacity="0.03" stroke="${colors.border}" />
      <text x="30" y="50" fill="white" font-family="Inter" font-size="20" font-weight="700">Digital Strategy</text>
      <rect x="30" y="80" width="200" height="8" rx="4" fill="${colors.primary}" opacity="0.4" />

      <rect x="340" y="0" width="320" height="180" rx="24" fill="white" fill-opacity="0.03" stroke="${colors.border}" />
      <text x="370" y="50" fill="white" font-family="Inter" font-size="20" font-weight="700">AI Integration</text>
      <rect x="370" y="80" width="200" height="8" rx="4" fill="${colors.secondary}" opacity="0.4" />

      <rect x="680" y="0" width="320" height="180" rx="24" fill="white" fill-opacity="0.03" stroke="${colors.border}" />
      <text x="710" y="50" fill="white" font-family="Inter" font-size="20" font-weight="700">Scalable Ops</text>
      <rect x="710" y="80" width="200" height="8" rx="4" fill="${colors.accent}" opacity="0.4" />
    </g>
  </g>`;
}
