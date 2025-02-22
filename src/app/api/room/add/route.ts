import { SupaBaseServer } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, creator, description } = body;

    if (!name || !creator) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const supabase = await SupaBaseServer();

    // Insert into "room" table
    const { data, error } = await supabase
      .from("room")
      .insert({ name, created_by: creator, description })
      .select("*");

    if (error || !data || data.length === 0) {
      console.log(error);
      return NextResponse.json({ message: "Failed to create room" }, { status: 500 });
    }

    const roomId = data[0].id; // Correct way to get room ID

    // Get the authenticated user
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user?.id) {
      return NextResponse.json({ message: "User not authenticated" }, { status: 401 });
    }

    // Insert into "members" table
    await supabase
      .from("members")
      .insert({ roomid: roomId, member: authData.user.id });

    return NextResponse.json({ id: roomId }, { status: 200 });

  } catch (error) {
    console.error('Error in API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
