import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next();
  const currentTime = Date.now();
  const sessionExpiry = request.cookies.get('session-expiry')?.value;
  const expiresInFifteenMinutes = currentTime + 15 * 60 * 1000; // 15 minutes

  console.log("🕒 Current Time:", currentTime);
  console.log("🍪 Existing Session Expiry:", sessionExpiry);

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/auth');

  if (sessionExpiry && Number(sessionExpiry) < currentTime) {
    console.log("🚨 Session expired! Clearing cookies...");

    const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
    redirectResponse.cookies.delete('sb-auth-token.0');
    redirectResponse.cookies.delete('sb-auth-token.1');
    redirectResponse.cookies.delete('session-expiry');

    console.log("🔄 Redirecting to /login...");
    return redirectResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  );

  const adminClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  // 🔑 Get authenticated user
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

  if (user) {
    const userEmail = user.email;

    // Check if the user exists in the `users` table
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('provider, banned')
      .eq('email', userEmail!)
      .single();

    if (userCheckError) {
      console.log("❌ Error checking user existence:", userCheckError);
    }

    if (!existingUser) {
      console.log("🚨 User not found in DB. Deleting OAuth account...");

      // Delete user from Supabase Auth using adminClient
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.log("⚠️ Error deleting user:", deleteError);
      }

      response.cookies.delete('sb-auth-token.0');
      response.cookies.delete('sb-auth-token.1');
      response.cookies.delete('session-expiry');

      console.log("🔄 Redirecting to /login...");
      return NextResponse.redirect(new URL('/login', request.url));
    } else {
      if (!existingUser.provider) {
        console.log("🚫 No provider found! Banning user...");

        // Update `banned` column to true
        const { error: banError } = await supabase
          .from('users')
          .update({ banned: true })
          .eq('email', userEmail!);

        if (banError) {
          console.log("⚠️ Error updating banned status:", banError);
        }

        response.cookies.delete('sb-auth-token.0');
        response.cookies.delete('sb-auth-token.1');
        response.cookies.delete('session-expiry');

        console.log("🔄 Redirecting to /login...");
        return NextResponse.redirect(new URL('/login', request.url));
      }

      console.log("✅ User authenticated. Extending session...");
      response.cookies.set('session-expiry', expiresInFifteenMinutes.toString(), {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
    }
  }

  if (!user && !isAuthPage) {
    console.log("🚨 User not logged in. Redirecting to /login...");
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user && isAuthPage) {
    console.log("✅ Authenticated user trying to access auth page. Redirecting to /...");
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}
