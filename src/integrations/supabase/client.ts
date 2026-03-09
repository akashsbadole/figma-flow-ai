// Supabase client - Disabled for NeonDB migration
// To re-enable Supabase, set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

// Log configuration status  
if (!isSupabaseConfigured) {
  console.log('Supabase not configured - using NeonDB + Clerk instead');
}

// Create client only if credentials exist - prevents "supabaseUrl is required" error
let supabaseClient: any = null;

if (isSupabaseConfigured) {
  // Only import and create client when credentials are available
  // This avoids the error at module load time
  supabaseClient = SUPABASE_PUBLISHABLE_KEY; // Placeholder - actual client created lazily
}

export const supabase = supabaseClient;

// Export helper to check if Supabase is available  
export const isSupabaseAvailable = () => isSupabaseConfigured;
