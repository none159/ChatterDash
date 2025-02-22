import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  // Clear authentication cookies by setting them to expire in the past
  (await
        // Clear authentication cookies by setting them to expire in the past
        cookies()).set("sb-bbkpjrnraermllvdjhno-auth-token.1", "", {
    expires: new Date(0),
    path: "/",
  });

  (await cookies()).set("sb-bbkpjrnraermllvdjhno-auth-token.0", "", {
    expires: new Date(0),
    path: "/",
  });

  return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
}
