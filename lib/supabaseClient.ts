import { createBrowserClient } from '@supabase/ssr';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Comprehensive check for valid Supabase configuration
export const isSupabaseConfigured = !!(
    rawUrl && 
    rawUrl.startsWith('https://') && 
    rawUrl.includes('.supabase.co') &&
    rawKey && 
    rawKey.startsWith('eyJ') && // Supabase keys are JWTs starting with eyJ
    rawKey.length > 100
);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
    console.warn("⚠️ Supabase Configuration Missing or Invalid:");
    if (!rawUrl) console.warn("- NEXT_PUBLIC_SUPABASE_URL is missing");
    else if (!rawUrl.includes('supabase.co')) console.warn("- URL doesn't look like a Supabase URL");
    
    if (!rawKey) console.warn("- NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");
    else if (!rawKey.startsWith('eyJ')) console.warn("- Key is NOT a valid Supabase Anon Key (Should start with 'eyJ')");
}

const supabaseUrl = (isSupabaseConfigured ? rawUrl : "https://placeholder.supabase.co") as string;
const supabaseKey = (isSupabaseConfigured ? rawKey : "placeholder-key") as string;

// createBrowserClient automatically handles session persistence using cookies 
// which is required for Next.js Middleware to function correctly.
export const supabase = createBrowserClient(
    supabaseUrl,
    supabaseKey
);
