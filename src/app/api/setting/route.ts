import { SupaBaseServer } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { avatar_url, full_name, id, password } = body;
   console.log(avatar_url)
    if (!avatar_url && !full_name) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }
    const supabase = await SupaBaseServer();
    if(avatar_url){
      console.log('run')
      const { error } = await supabase
      .from("users")
      .update({ avatar_url:avatar_url })
      .eq("id", id);
      if(error){
        console.log(error);
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
      }
    }
    // 🔐 If password is provided, clear cookies and return redirect response
    if (password) {
      console.log("🔒 Password provided! Clearing cookies and redirecting...");
      
      const cookieStore = cookies();
      (await cookieStore).getAll().forEach(async (cookie) => {
        (await cookieStore).delete(cookie.name);
      });

      // ✅ Ensure redirect is absolute
      return NextResponse.redirect(new URL('/login', req.url));
    }



    if (full_name) {
      const { error } = await supabase
        .from("users")
        .update({ display_name: full_name })
        .eq("id", id);

      if (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
      }
    }

    return NextResponse.json({ message: "User updated" }, { status: 200 });
  } catch (error) {
    console.error("Error in API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
