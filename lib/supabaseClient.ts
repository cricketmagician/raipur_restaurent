import { createBrowserClient } from '@supabase/ssr';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Robust check to ensure we have a valid-looking URL before passing it to createBrowserClient
export const isSupabaseConfigured = rawUrl && 
                     rawUrl.startsWith('http') && 
                     !rawUrl.includes('your-project-id') && 
                     rawKey && 
                     rawKey.length > 40 && // Supabase keys are long JWTs
                     rawKey !== 'placeholder-key';

const supabaseUrl = (isSupabaseConfigured ? rawUrl : "https://placeholder.supabase.co") as string;
const supabaseKey = (isSupabaseConfigured ? rawKey : "placeholder-key") as string;

// createBrowserClient automatically handles session persistence using cookies 
// which is required for Next.js Middleware to function correctly.
export const supabase = createBrowserClient(
    supabaseUrl,
    supabaseKey
);
