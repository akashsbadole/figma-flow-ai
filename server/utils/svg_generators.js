/**
 * SVG Component Library for SaaS Landing Pages
 * Follows "Full Application" Component Map:
 * - Navigation (Floating Blur)
 * - Hero Section (Gradient text, Glow borders)
 * - Feature Grid (Bento Box Style)
 * - Pricing Section (Modern Toggle/3 Tier)
 * - About Us / Services
 * - Footer
 */

export const colors = {
  primary: '#6366F1',
  secondary: '#1E293B',
  accent: '#10B981',
  bg: '#0F172A',
  card: '#1E293B',
  border: 'rgba(255, 255, 255, 0.1)',
  text: '#F8FAFC',
  textMuted: '#94A3B8'
};

export function genNav(projectName = "SaaS") {
  return `
  <g id="Navigation" transform="translate(0, 24)">
    <rect x="100" y="0" width="1000" height="72" rx="36" fill="white" fill-opacity="0.05" stroke="${colors.border}" stroke-width="1" />
    <text x="140" y="44" fill="white" font-family="Inter" font-size="20" font-weight="800">${projectName.toUpperCase()}</text>
    <g transform="translate(450, 44)">
      <text x="0" y="0" fill="${colors.textMuted}" font-family="Inter" font-size="14" font-weight="500">Features</text>
      <text x="100" y="0" fill="${colors.textMuted}" font-family="Inter" font-size="14" font-weight="500">Solutions</text>
      <text x="200" y="0" fill="${colors.textMuted}" font-family="Inter" font-size="14" font-weight="500">Pricing</text>
    </g>
    <rect x="940" y="16" width="140" height="40" rx="20" fill="${colors.primary}" />
    <text x="1010" y="41" fill="white" font-family="Inter" font-size="14" font-weight="600" text-anchor="middle">Start Free Trial</text>
  </g>`;
}

export function genHero(title, subtitle) {
  return `
  <g id="Hero" transform="translate(0, 180)">
    <defs>
      <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#818CF8;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#C084FC;stop-opacity:1" />
      </linearGradient>
    </defs>
    <text x="600" y="0" fill="url(#textGradient)" font-family="Inter" font-size="64" font-weight="900" text-anchor="middle">${title}</text>
    <text x="600" y="70" fill="${colors.textMuted}" font-family="Inter" font-size="20" text-anchor="middle">${subtitle}</text>

    <g transform="translate(100, 150)">
      <rect width="1000" height="500" rx="24" fill="${colors.secondary}" stroke="${colors.primary}" stroke-width="2" />
      <rect x="0" y="0" width="1000" height="40" rx="24" fill="white" fill-opacity="0.05" />
      <circle cx="25" cy="20" r="5" fill="#FF5F56" />
      <circle cx="45" cy="20" r="5" fill="#FFBD2E" />
      <circle cx="65" cy="20" r="5" fill="#27C93F" />
      <text x="500" y="320" fill="${colors.textMuted}" font-family="Inter" font-size="24" text-anchor="middle" opacity="0.3">Dashboard Preview</text>
    </g>
  </g>`;
}

export function genBento(features = []) {
  // features: [{title, desc, size: 'large' | 'small'}]
  return `
  <g id="Features" transform="translate(100, 950)">
    <text x="500" y="-40" fill="white" font-family="Inter" font-size="32" font-weight="800" text-anchor="middle">Powerful Features</text>

    <g id="BentoGrid">
      <rect width="660" height="340" rx="24" fill="${colors.card}" stroke="${colors.border}" />
      <text x="40" y="60" fill="white" font-family="Inter" font-size="24" font-weight="700">${features[0]?.title || 'AI Insights'}</text>
      <text x="40" y="90" fill="${colors.textMuted}" font-family="Inter" font-size="16">${features[0]?.desc || 'Deep learning analytics'}</text>

      <rect x="680" y="0" width="320" height="340" rx="24" fill="${colors.primary}" />
      <text x="720" y="60" fill="white" font-family="Inter" font-size="24" font-weight="700">${features[1]?.title || 'Cloud Sync'}</text>
      <text x="720" y="90" fill="white" fill-opacity="0.7" font-family="Inter" font-size="16">${features[1]?.desc || 'Real-time backup'}</text>

      <rect x="0" y="360" width="320" height="340" rx="24" fill="${colors.secondary}" stroke="${colors.border}" />
      <text x="40" y="420" fill="white" font-family="Inter" font-size="24" font-weight="700">${features[2]?.title || 'Secure'}</text>

      <rect x="340" y="360" width="660" height="340" rx="24" fill="${colors.card}" stroke="${colors.border}" />
      <text x="380" y="420" fill="white" font-family="Inter" font-size="24" font-weight="700">${features[3]?.title || 'Collaboration'}</text>
    </g>
  </g>`;
}

export function genPricing() {
  return `
  <g id="Pricing" transform="translate(100, 1800)">
    <text x="500" y="0" fill="white" font-family="Inter" font-size="40" font-weight="800" text-anchor="middle">Ready to scale?</text>
    <g transform="translate(0, 80)">
      <rect width="320" height="480" rx="24" fill="${colors.card}" stroke="${colors.border}" />
      <text x="40" y="60" fill="white" font-family="Inter" font-size="20" font-weight="700">Starter</text>
      <text x="40" y="110" fill="white" font-family="Inter" font-size="48" font-weight="800">$0</text>
      <text x="40" y="140" fill="${colors.textMuted}" font-family="Inter" font-size="14">Free forever</text>

      <g transform="translate(340, -40)">
        <rect width="320" height="560" rx="24" fill="${colors.card}" stroke="${colors.primary}" stroke-width="2" />
        <rect x="110" y="20" width="100" height="24" rx="12" fill="${colors.primary}" />
        <text x="160" y="36" fill="white" font-family="Inter" font-size="10" font-weight="700" text-anchor="middle">POPULAR</text>
        <text x="40" y="80" fill="white" font-family="Inter" font-size="20" font-weight="700">Pro</text>
        <text x="40" y="130" fill="white" font-family="Inter" font-size="48" font-weight="800">$49</text>
        <rect x="40" y="460" width="240" height="48" rx="24" fill="${colors.primary}" />
        <text x="160" y="490" fill="white" font-family="Inter" font-size="16" font-weight="600" text-anchor="middle">Get Started</text>
      </g>

      <g transform="translate(680, 0)">
        <rect width="320" height="480" rx="24" fill="${colors.card}" stroke="${colors.border}" />
        <text x="40" y="60" fill="white" font-family="Inter" font-size="20" font-weight="700">Enterprise</text>
        <text x="40" y="110" fill="white" font-family="Inter" font-size="48" font-weight="800">Custom</text>
      </g>
    </g>
  </g>`;
}

export function genFooter(projectName = "SaaS") {
  return `
  <g id="Footer" transform="translate(0, 2600)">
    <rect width="1200" height="300" fill="${colors.secondary}" />
    <text x="100" y="100" fill="white" font-family="Inter" font-size="24" font-weight="800">${projectName.toUpperCase()}</text>
    <text x="100" y="140" fill="${colors.textMuted}" font-family="Inter" font-size="14">Built for the future of SaaS.</text>

    <g transform="translate(800, 100)">
      <text x="0" y="0" fill="white" font-family="Inter" font-size="16" font-weight="700">Product</text>
      <text x="0" y="30" fill="${colors.textMuted}" font-family="Inter" font-size="14">Features</text>
      <text x="0" y="60" fill="${colors.textMuted}" font-family="Inter" font-size="14">Integrations</text>
    </g>

    <line x1="100" y1="220" x2="1100" y2="220" stroke="${colors.border}" />
    <text x="600" y="260" fill="${colors.textMuted}" font-family="Inter" font-size="12" text-anchor="middle">© 2024 ${projectName}. All rights reserved.</text>
  </g>`;
}

export function genAboutUs() {
  return `
  <g id="AboutUs" transform="translate(100, 2450)">
    <text x="0" y="0" fill="white" font-family="Inter" font-size="32" font-weight="800">About Us</text>
    <text x="0" y="40" fill="${colors.textMuted}" font-family="Inter" font-size="16" width="600">
      We are a team of designers and engineers dedicated to simplifying complex workflows.
    </text>
  </g>`;
}

export function genServices() {
  return `
  <g id="Services" transform="translate(100, 1600)">
    <text x="500" y="0" fill="white" font-family="Inter" font-size="32" font-weight="800" text-anchor="middle">Our Services</text>
    <g transform="translate(0, 50)">
      <rect width="300" height="150" rx="16" fill="${colors.card}" stroke="${colors.border}" />
      <text x="20" y="40" fill="white" font-family="Inter" font-size="18" font-weight="700">Consulting</text>
      <rect x="340" y="0" width="300" height="150" rx="16" fill="${colors.card}" stroke="${colors.border}" />
      <text x="360" y="40" fill="white" font-family="Inter" font-size="18" font-weight="700">Implementation</text>
      <rect x="680" y="0" width="300" height="150" rx="16" fill="${colors.card}" stroke="${colors.border}" />
      <text x="700" y="40" fill="white" font-family="Inter" font-size="18" font-weight="700">Support</text>
    </g>
  </g>`;
}
