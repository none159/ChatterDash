
import { SupaBaseServer } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // Parse the request body
    const { messageid, userid,message } = body;

    if (!messageid || !userid||!message) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const supabase = await SupaBaseServer();
    const { data, error } = await supabase
      .from("messages")
      .update({"text":message})
      .eq("id", messageid)
      .eq("send_by", userid);

    if (error) {
      console.log(error)
      return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }

    return NextResponse.json({ message: "Message Updated" }, { status: 200 });


  } catch (error) {
    console.error('Error in set-cookie API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
