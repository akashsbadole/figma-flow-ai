import pg from 'pg';
import dotenv from 'dotenv';
import * as svg from './utils/svg_generators.js';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.VITE_DATABASE_URL,
});

const niches = [
  { name: 'NeuralTrain', category: 'Infrastructure', title: 'AI Training at Scale', sub: 'The infrastructure for next-gen models.' },
  { name: 'PayFlow', category: 'Fintech', title: 'Seamless B2B Payments', sub: 'Automate your entire accounts payable.' },
  { name: 'HealthSync', category: 'Healthcare', title: 'Unified Patient Data', sub: 'Real-time synchronization for clinics.' },
  { name: 'TalentTrack', category: 'Operations', title: 'The Modern ATS', sub: 'Hire faster with AI-powered screening.' },
  { name: 'AdVantage', category: 'Marketing', title: 'Multi-Channel Ad Ops', sub: 'One dashboard for all your ad spend.' },
  { name: 'PropManager', category: 'Real Estate', title: 'Property Management Pro', sub: 'Rent collection and maintenance simplified.' },
  { name: 'LogiLink', category: 'Logistics', title: 'Global Fleet Tracking', sub: 'Real-time visibility for your entire supply chain.' },
  { name: 'DineOps', category: 'Niche', title: 'Next-Gen Restaurant POS', sub: 'Table management and menue builder.' },
  // ... can expand to 50+ programmatically
];

// Generate more niches to reach 50+
const categories = ['Infrastructure', 'Fintech', 'Healthcare', 'Operations', 'Marketing', 'Real Estate', 'Logistics', 'Niche'];
for (let i = niches.length; i < 55; i++) {
  const cat = categories[i % categories.length];
  niches.push({
    name: `${cat}SaaS_${i}`,
    category: cat,
    title: `Advanced ${cat} Solution`,
    sub: `Revolutionizing the ${cat.toLowerCase()} industry with AI.`
  });
}

async function seed() {
  try {
    console.log(`Seeding ${niches.length} full-page SaaS designs...`);
    for (const niche of niches) {
      const svgCode = `
      <svg width="1200" height="4800" viewBox="0 0 1200 4800" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="4800" fill="#0F172A" />
        ${svg.genNav(niche.name)}
        ${svg.genHero(niche.title, niche.sub)}
        ${svg.genBento()}
        ${svg.genServices()}
        ${svg.genPricing()}
        ${svg.genSystemDiagram(niche.name)}
        ${svg.genTestimonials()}
        ${svg.genFAQ()}
        ${svg.genCTA()}
        ${svg.genAboutUs().replace('2450', '4450')}
        ${svg.genFooter(niche.name).replace('2600', '4600')}
      </svg>`.trim();

      await pool.query(
        `INSERT INTO public.templates (name, category, description, svg_code, metadata)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (name) DO UPDATE SET
            category = $2,
            description = $3,
            svg_code = $4,
            metadata = $5`,
        [
          `${niche.name} Full Site`,
          niche.category,
          `Complete high-fidelity landing page for ${niche.name}. Includes Nav, Hero, Bento Grid, Pricing, and Footer.`,
          svgCode,
          { type: 'FULL_PAGE', niche: niche.name, fidelity: 'high' }
        ]
      );
    }
    console.log('Design Library seeded successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
