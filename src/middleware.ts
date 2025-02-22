import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  console.log("🔄 Middleware is running on every request...");
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/api/:path*",  // ✅ Ensure middleware runs on ALL API calls, including refresh token
    "/dashboard/:path*", 
    
  // ✅ Runs on protected pages (modify as needed)
  ],
};
