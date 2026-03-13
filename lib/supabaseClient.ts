import { createBrowserClient } from '@supabase/ssr';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Robust check to ensure we have a valid-looking URL before passing it to createBrowserClient
const isConfigured = rawUrl && 
                     rawUrl.startsWith('http') && 
                     !rawUrl.includes('your-project-id') && 
                     rawKey && 
                     rawKey !== 'placeholder-key';

const supabaseUrl = isConfigured ? rawUrl : "https://placeholder.supabase.co";
const supabaseKey = isConfigured ? rawKey : "placeholder-key";

// createBrowserClient automatically handles session persistence using cookies 
// which is required for Next.js Middleware to function correctly.
export const supabase = createBrowserClient(
    supabaseUrl,
    supabaseKey
);
