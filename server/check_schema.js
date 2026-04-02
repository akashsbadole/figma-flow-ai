import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.VITE_DATABASE_URL,
});

async function checkSchema() {
  console.log('--- Database Schema Verification ---');

  try {
    // 1. Ensure clerk_id_mapping table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.clerk_id_mapping (
        clerk_id VARCHAR(255) PRIMARY KEY,
        supabase_id UUID NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ clerk_id_mapping table verified');

    // 2. Ensure users table exists (for role checking)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ users table verified');

    // 3. Ensure profiles table exists with is_enabled
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
        display_name VARCHAR(255),
        avatar_url TEXT,
        is_enabled BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Add is_enabled if it doesn't exist
    try {
      await pool.query('ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT TRUE');
      await pool.query('ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE');
    } catch (e) {
      console.warn('Note: Profile columns might already exist.');
    }
    console.log('✓ profiles table and columns verified');

    // 4. Ensure projects table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ projects table verified');

    // 5. Ensure designs table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.designs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
        prompt TEXT NOT NULL,
        html_code TEXT,
        css_code TEXT,
        svg_code TEXT,
        image_url TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ designs table verified');

    // 6. Ensure design_systems table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.design_systems (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        colors JSONB,
        typography JSONB,
        spacing JSONB,
        components JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ design_systems table verified');

    // 7. Ensure generation_history table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.generation_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        type VARCHAR(50) NOT NULL,
        prompt TEXT NOT NULL,
        result JSONB,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ generation_history table verified');

    // 8. Ensure user_subscriptions table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.user_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        plan VARCHAR(50) DEFAULT 'free',
        status VARCHAR(50) DEFAULT 'active',
        generations_limit INTEGER DEFAULT 5,
        generations_used INTEGER DEFAULT 0,
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ user_subscriptions table verified');

    // 9. Ensure user_roles table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, role)
      );
    `);
    console.log('✓ user_roles table verified');

    // 10. Ensure templates table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        tags TEXT[],
        html_code TEXT,
        css_code TEXT,
        svg_code TEXT,
        image_url TEXT,
        metadata JSONB,
        preview_url TEXT,
        is_premium BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Ensure all columns exist (for existing tables)
    const columnsToAdd = [
      { name: 'svg_code', type: 'TEXT' },
      { name: 'image_url', type: 'TEXT' },
      { name: 'metadata', type: 'JSONB' }
    ];

    for (const col of columnsToAdd) {
      await pool.query(`ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
    }

    // Remove NOT NULL from html_code and css_code if it exists
    try {
      await pool.query('ALTER TABLE public.templates ALTER COLUMN html_code DROP NOT NULL');
      await pool.query('ALTER TABLE public.templates ALTER COLUMN css_code DROP NOT NULL');
    } catch (e) {
      // Ignored
    }

    // Add unique constraint to name if it doesn't exist
    try {
      await pool.query('ALTER TABLE public.templates ADD CONSTRAINT templates_name_key UNIQUE (name)');
    } catch (e) {
      // Constraint likely already exists
    }

    console.log('✓ templates table verified');

    // 11. Ensure saved_templates table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.saved_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, template_id)
      );
    `);
    console.log('✓ saved_templates table verified');

    console.log('\n--- Schema verification complete! ---');
  } catch (error) {
    console.error('\n✗ Error during schema verification:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkSchema();
