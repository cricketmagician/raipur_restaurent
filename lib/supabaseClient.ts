import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// createBrowserClient automatically handles session persistence using cookies 
// which is required for Next.js Middleware to function correctly.
export const supabase = createBrowserClient(
    supabaseUrl,
    supabaseKey
);
