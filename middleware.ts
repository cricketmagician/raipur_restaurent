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

    // Check if the path matches /[hotel_slug]/admin/...
    // but ignore /[hotel_slug]/admin/login
    if (pathSegments.length >= 3 && pathSegments[2] === 'admin' && pathSegments[3] !== 'login') {
        const hotelSlug = pathSegments[1];

        // 1. Check if user is logged in
        if (userError || !user) {
            return NextResponse.redirect(new URL(`/${hotelSlug}/admin/login`, request.url));
        }

        // 2. Load the user's linked hotel directly from profile first.
        // The relation join can be flaky when schema cache or RLS is slightly out of sync.
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('hotel_id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (profileError || !profile?.hotel_id) {
            // PROACTIVE FIX: Check if the slug was 'geeta-hotel' but should be 'geeta'
            if (hotelSlug.endsWith('-hotel')) {
                const altSlug = hotelSlug.replace(/-hotel$/, '');
                const { data: altHotel } = await supabase
                    .from('hotels')
                    .select('id')
                    .eq('slug', altSlug)
                    .maybeSingle();

                if (altHotel?.id && profile?.hotel_id === altHotel.id) {
                    return NextResponse.redirect(new URL(`/${altSlug}/admin/dashboard`, request.url));
                }
            }
            return NextResponse.redirect(new URL(`/${hotelSlug}/admin/login?error=unauthorized`, request.url));
        }

        const { data: hotel, error: hotelError } = await supabase
            .from('hotels')
            .select('id, slug')
            .eq('id', profile.hotel_id)
            .maybeSingle();

        if (hotelError || !hotel) {
            return NextResponse.redirect(new URL(`/${hotelSlug}/admin/login?error=unauthorized`, request.url));
        }

        if (hotel.slug !== hotelSlug) {
            if (hotelSlug.endsWith('-hotel')) {
                const altSlug = hotelSlug.replace(/-hotel$/, '');
                if (hotel.slug === altSlug) {
                    return NextResponse.redirect(new URL(`/${altSlug}/admin/dashboard`, request.url));
                }
            }
            return NextResponse.redirect(new URL(`/${hotelSlug}/admin/login?error=unauthorized`, request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ['/:hotel_slug/admin/:path*'],
};
