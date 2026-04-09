import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.VITE_DATABASE_URL,
});

// SVG validation function
function validateSVG(svgContent) {
  const issues = [];

  // Check if it starts with SVG tag
  if (!svgContent.trim().startsWith('<svg')) {
    issues.push('Does not start with <svg tag');
    return { valid: false, issues };
  }

  // Check for xmlns
  if (!svgContent.includes('xmlns="http://www.w3.org/2000/svg"')) {
    issues.push('Missing xmlns attribute');
  }

  // Check for viewBox
  if (!svgContent.includes('viewBox=')) {
    issues.push('Missing viewBox attribute');
  }

  // Check for closing tag
  if (!svgContent.trim().endsWith('</svg>')) {
    issues.push('Does not end with </svg>');
  }

  // Check for potentially problematic content
  if (svgContent.includes('<script') || svgContent.includes('javascript:')) {
    issues.push('Contains scripts (not allowed in sandboxed iframe)');
  }

  // Check for external HTTP references (excluding xmlns)
  const externalRefs = svgContent.match(/https?:\/\/(?!www\.w3\.org\/2000\/svg)/g);
  if (externalRefs && externalRefs.length > 0) {
    issues.push(`Contains external HTTP references: ${externalRefs.slice(0, 3).join(', ')}`);
  }

  // Check for foreignObject (can cause rendering issues)
  if (svgContent.includes('<foreignObject')) {
    issues.push('Contains foreignObject elements');
  }

  return { valid: issues.length === 0, issues };
}

async function validateAllSVGs() {
  try {
    console.log('Validating all SVG templates...');
    const result = await pool.query(
      'SELECT id, name, category, svg_code FROM public.templates WHERE svg_code IS NOT NULL AND svg_code != \'\' ORDER BY created_at DESC'
    );

    console.log(`Found ${result.rows.length} SVG templates to validate\n`);

    let validCount = 0;
    let invalidCount = 0;
    const invalidTemplates = [];

    for (const row of result.rows) {
      const validation = validateSVG(row.svg_code);

      if (validation.valid) {
        validCount++;
      } else {
        invalidCount++;
        invalidTemplates.push({
          id: row.id,
          name: row.name,
          category: row.category,
          issues: validation.issues
        });
      }
    }

    console.log('VALIDATION RESULTS:');
    console.log(`✅ Valid templates: ${validCount}`);
    console.log(`❌ Invalid templates: ${invalidCount}`);

    if (invalidTemplates.length > 0) {
      console.log('\nINVALID TEMPLATES:');
      invalidTemplates.forEach((template, i) => {
        console.log(`\n${i + 1}. ${template.name} (${template.category})`);
        console.log(`   ID: ${template.id}`);
        console.log(`   Issues: ${template.issues.join(', ')}`);
      });
    }

    return { validCount, invalidCount, invalidTemplates };

  } catch (error) {
    console.error('Error validating SVGs:', error);
  } finally {
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  validateAllSVGs().catch(console.error);
}

export { validateSVG, validateAllSVGs };