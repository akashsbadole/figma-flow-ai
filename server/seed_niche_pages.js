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
];

const categories = ['Infrastructure', 'Fintech', 'Healthcare', 'Operations', 'Marketing', 'Real Estate', 'Logistics', 'Niche'];
for (let i = niches.length; i < 52; i++) {
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
    console.log(`Seeding multi-page designs for ${niches.length} niches...`);
    for (const niche of niches) {
      // 1. Pricing Page
      const pricingPage = `
      <svg width="1200" height="1500" viewBox="0 0 1200 1500" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="1500" fill="#0F172A" />
        ${svg.genNav(niche.name)}
        <g transform="translate(0, -1700)">${svg.genPricing()}</g>
        <g transform="translate(0, -1800)">${svg.genFooter(niche.name)}</g>
      </svg>`.trim();

      // 2. About Page
      const aboutPage = `
      <svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="1200" fill="#0F172A" />
        ${svg.genNav(niche.name)}
        <g transform="translate(0, -2250)">${svg.genAboutUs()}</g>
        <g transform="translate(0, -2000)">${svg.genTestimonials()}</g>
        <g transform="translate(0, -2300)">${svg.genFooter(niche.name)}</g>
      </svg>`.trim();

      // Helper to add pages
      const pages = [
        { name: 'Pricing Page', code: pricingPage },
        { name: 'About Page', code: aboutPage }
      ];

      for (const page of pages) {
        await pool.query(
          `INSERT INTO public.templates (name, category, description, svg_code, metadata)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (name) DO UPDATE SET
              category = $2,
              description = $3,
              svg_code = $4,
              metadata = $5`,
          [
            `${niche.name} ${page.name}`,
            niche.category,
            `${page.name} for ${niche.name}. Figma-compatible SVG template.`,
            page.code,
            { type: 'PAGE', niche: niche.name, pageType: page.name }
          ]
        );
      }
    }
    console.log('Multi-page design library seeded successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
