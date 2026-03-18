import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. FAST EXCLUSIONS: If it's not an admin route, return immediately.
    // This is a second layer of protection alongside the config matcher.
    const pathSegments = pathname.split('/');
    const isAdminRoute = pathSegments.length >= 3 && pathSegments[2] === 'admin';
    const isLoginPage = pathname.endsWith('/admin/login');

    if (!isAdminRoute || isLoginPage) {
        return NextResponse.next();
    }

    // 2. ONLY INITIALIZE SUPABASE FOR ADMIN ROUTES
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
        return NextResponse.next();
    }

    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options });
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options });
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    // 3. FAST SESSION CHECK
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            const hotelSlug = pathSegments[1];
            return NextResponse.redirect(new URL(`/${hotelSlug}/admin/login`, request.url));
        }
    } catch (e) {
        // If session check fails (e.g. network glitch), allow through or redirect to login
        console.error("Middleware Session Error:", e);
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
