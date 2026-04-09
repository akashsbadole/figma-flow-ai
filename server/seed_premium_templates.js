import pg from 'pg';
import dotenv from 'dotenv';
import * as svg from './utils/svg_generators.js';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.VITE_DATABASE_URL,
});

const niches = [
  { name: 'QuantumStack', category: 'Infrastructure', title: 'Next-Gen Quantum Computing', sub: 'The OS for the quantum era.' },
  { name: 'BioStream', category: 'Healthcare', title: 'Real-time Genomic Analysis', sub: 'Understand DNA at the speed of thought.' },
  { name: 'ZenithPay', category: 'Fintech', title: 'Global Liquidity Layer', sub: 'The backbone of borderless commerce.' },
  { name: 'ApexOps', category: 'Operations', title: 'Autonomous Supply Chain', sub: 'Self-healing logistics powered by AI.' },
  { name: 'VelocityAds', category: 'Marketing', title: 'Hyper-Personalized Ads', sub: 'Zero-waste marketing for modern brands.' },
];

async function seed() {
  try {
    console.log(`Seeding ${niches.length} Premium high-fidelity designs...`);
    for (const niche of niches) {
      const svgCode = `
      <svg width="1200" height="5200" viewBox="0 0 1200 5200" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="5200" fill="#0F172A" />
        ${svg.genNav(niche.name)}
        ${svg.genHero(niche.title, niche.sub)}
        ${svg.genBento()}
        ${svg.genServices()}
        ${svg.genPricing()}
        ${svg.genSystemDiagram(niche.name)}
        ${svg.genTestimonials()}
        ${svg.genFAQ()}
        ${svg.genCTA()}
        ${svg.genAboutUs()}
        ${svg.genFooter(niche.name)}
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
          `${niche.name} Premium Experience`,
          niche.category,
          `High-end, Dribbble-quality landing page for ${niche.name}. Figma-optimized SVG.`,
          svgCode,
          { type: 'FULL_PAGE', niche: niche.name, fidelity: 'premium', version: '2.0' }
        ]
      );
    }
    console.log('Premium Template Library seeded successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
