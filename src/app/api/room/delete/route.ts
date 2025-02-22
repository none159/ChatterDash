
import { SupaBaseServer } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // Parse the request body
    const { creator, roomid} = body;

    if (!creator || !roomid) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const supabase = await SupaBaseServer();
    const { data : dataroom, error:errorroom} = await supabase
      .from("room")
      .delete()
      .eq("id",roomid)
      .eq("created_by", creator);
     
      const { data:datamember, error :errormember} = await supabase
        .from("members")
        .delete()
        .eq("roomid",roomid);
  
    if (errorroom || errormember) {
      console.log(errorroom)
      console.log(errormember)
      return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }

    return NextResponse.json({ message: "Room Deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error in delete API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
