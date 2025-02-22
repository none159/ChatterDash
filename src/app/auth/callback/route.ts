import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { type CookieOptions, createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
    try {
        const { searchParams, origin } = new URL(request.url);
        const code = searchParams.get('code');
        const next = searchParams.get('next') ?? '/';
        console.log('Authorization code:', code);

        if (code) {

            const cookieStore = await cookies();
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        get(name: string) {
                            return cookieStore.get(name)?.value;
                        },
                        set(name: string, value: string, options: CookieOptions) {
                            cookieStore.set({ name, value, ...options });
                        },
                        remove(name: string, options: CookieOptions) {
                            cookieStore.delete({ name, ...options });
                        },
                    },
                }
            );
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error) {
                console.log('Code exchanged successfully, redirecting to:', `${origin}${next}`);
                return NextResponse.redirect(`${origin}${next}`);
            } else {
                console.error('Error exchanging code for session:', error);
                return NextResponse.redirect(`${origin}/error?message=${error.message}`);
            }
        }

        console.error('Missing authorization code');
        return NextResponse.redirect(`${origin}/error?message="Missing authorization code"`);
    } catch (err:any) {
        console.error('Error handling GET request:', err);
        return NextResponse.redirect(`${origin}/error?message=${err.message}`);
    }
}
