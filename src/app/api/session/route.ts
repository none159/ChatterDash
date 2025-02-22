
import { SupaBaseServer } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {

    const supabase = await SupaBaseServer()
    const user = await  supabase.auth.getUser()
    const userinfo = await supabase.from("users").select("*").eq("id",user.data.user?.user_metadata.sub)
    if(userinfo.data){
    return NextResponse.json({ user:userinfo.data![0] }, { status: 200 });
    }
    else{
      console.log(user.data.user?.user_metadata)
      return NextResponse.json({ user:user.data.user?.user_metadata }, { status: 200 });
    }

  } catch (error) {
    console.error('Error in set-cookie API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
