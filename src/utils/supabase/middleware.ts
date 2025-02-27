import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    console.log('🔒 Middleware running...')

    const response = NextResponse.next()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const path = request.nextUrl.pathname

    // Allow public pages like /login and /signup
    const publicPaths = ['/login', '/signup']
    if (publicPaths.includes(path)) {
        return response
    }

    const sessionExpiry = request.cookies.get('session-expiry')?.value
    const currentTime = Date.now()

    // Block all other paths if there's no valid session
    if (!sessionExpiry || currentTime >= Number(sessionExpiry)) {
        console.log('🚫 No valid session - redirecting to /login')

        const redirectResponse = NextResponse.redirect(new URL('/login', request.url))

        // Clear cookies related to auth/session
        const cookiesToClear = [
            'session-expiry',
            'sb-bbkpjrnraermllvdjhno-auth-token.0',
            'sb-bbkpjrnraermllvdjhno-auth-token.1',
        ]

        cookiesToClear.forEach((cookieName) => {
            redirectResponse.cookies.set(cookieName, '', {
                path: '/',
                expires: new Date(0),
            })
        })

        console.log('✅ Cleared auth cookies during redirect to /login')
        return redirectResponse
    }

    // If logged in and session is valid, refresh session expiry
    const newExpiry = currentTime + 60 * 60 * 1000 // 1 hour session extension
    response.cookies.set('session-expiry', String(newExpiry), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    })
    console.log('🔄 Session expiry extended by 1 hour')

    return response
}

export const config = {
    matcher: '/:path*', // Applies to all paths
}
