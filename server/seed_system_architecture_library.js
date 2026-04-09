import pg from 'pg';
import dotenv from 'dotenv';
import * as svg from './utils/svg_generators.js';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.VITE_DATABASE_URL,
});

const niches = [
  { name: 'AI Training', category: 'Infrastructure', components: ['GPU Cluster', 'Dataset Loader', 'Model Weights'] },
  { name: 'Neobank', category: 'Fintech', components: ['Ledger Service', 'KYC Engine', 'Card Issuer'] },
  { name: 'Telemedicine', category: 'Healthcare', components: ['WebRTC Signaling', 'Patient DB', 'Prescription Auth'] },
  { name: 'ATS', category: 'Operations', components: ['Resume Parser', 'Job Board Sync', 'Email Service'] },
  { name: 'AdTech', category: 'Marketing', components: ['RTB Engine', 'Pixel Tracker', 'Analytics Aggregator'] },
];

const categories = ['Infrastructure', 'Fintech', 'Healthcare', 'Operations', 'Marketing', 'Real Estate', 'Logistics', 'Niche'];
for (let i = niches.length; i < 55; i++) {
  const cat = categories[i % categories.length];
  niches.push({
    name: `${cat} Solution ${i}`,
    category: cat,
    components: [`${cat} Service A`, `${cat} Engine`, `${cat} Storage`]
  });
}

async function seed() {
  try {
    console.log(`Seeding ${niches.length} system architecture diagrams...`);
    for (const niche of niches) {
      const svgCode = `
      <svg width="1200" height="600" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="600" fill="#0F172A" />
        ${svg.genSystemDiagram(niche.name, niche.components)}
      </svg>`.replace('transform="translate(100, 2900)"', 'transform="translate(100, 50)"').trim();

      await pool.query(
        `INSERT INTO public.templates (name, category, description, svg_code, metadata)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (name) DO UPDATE SET
            category = $2,
            description = $3,
            svg_code = $4,
            metadata = $5`,
        [
          `${niche.name} Architecture`,
          niche.category,
          `High-fidelity system architecture diagram for ${niche.name}.`,
          svgCode,
          { type: 'SYSTEM_DESIGN', niche: niche.name, fidelity: 'high' }
        ]
      );
    }
    console.log('Architecture library seeded successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
