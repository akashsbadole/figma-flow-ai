import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.VITE_DATABASE_URL,
});

const TEST_USER_ID = '00000000-0000-0000-0000-000000000000';

async function createTestUser() {
  try {
    console.log('Creating/Updating test user...');

    // Ensure the user exists in 'users'
    await pool.query(
      'INSERT INTO public.users (id, role) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
      [TEST_USER_ID, 'user']
    );

    // Check if profile exists
    const checkProfile = await pool.query(
        'SELECT id FROM public.profiles WHERE user_id = $1',
        [TEST_USER_ID]
    );

    if (checkProfile.rows.length > 0) {
        await pool.query(
            'UPDATE public.profiles SET is_enabled = $1 WHERE user_id = $2',
            [true, TEST_USER_ID]
        );
        console.log('Test user profile enabled.');
    } else {
        await pool.query(
            'INSERT INTO public.profiles (user_id, display_name, is_enabled) VALUES ($1, $2, $3)',
            [TEST_USER_ID, 'Test User', true]
        );
        console.log('Test user profile created.');
    }

    console.log('Test user check complete.');
  } catch (error) {
    console.error('Failed to create/enable test user:', error);
  } finally {
    await pool.end();
  }
}

createTestUser();
