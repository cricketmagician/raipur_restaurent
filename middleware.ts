import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Robust check to ensure we have a valid-looking URL before passing it to createServerClient
    const isConfigured = !!(supabaseUrl && 
                         supabaseUrl.startsWith('http') && 
                         !supabaseUrl.includes('your-project-id') && 
                         supabaseKey && 
                         supabaseKey.length > 40 &&
                         supabaseKey !== 'placeholder-key' &&
                         process.env.NEXT_PUBLIC_FORCE_DEMO !== 'true');

    // Bypass middleware if Supabase is not configured (Demo Mode) or if Force Demo is active
    if (!isConfigured) {
        return response;
    }

    const supabase = createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');

    // Protect admin routes, but keep the middleware auth check lightweight.
    // Hotel/profile matching is enforced in the client app where profile reads
    // have proven more reliable than edge lookups for this project.
    if (pathSegments.length >= 3 && pathSegments[2] === 'admin' && pathSegments[3] !== 'login') {
        const hotelSlug = pathSegments[1];

        // 1. Check if user is logged in
        if (userError || !user) {
            return NextResponse.redirect(new URL(`/${hotelSlug}/admin/login`, request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ['/:hotel_slug/admin/:path*'],
};
