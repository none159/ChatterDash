"use client";

import { Button } from "@/components/ui/button";
import { supabaseclient } from "@/utils/supabase/browser";
import { PostgrestSingleResponse } from "@supabase/postgrest-js";
import React, { useEffect, useState } from "react";

type Room = {
  id: string;
  created_at: string;
  created_by: string;
  name: string;
};

type RoomType = Room[];

type UserType = {
  avatar_url: string;
  created_at: string;
  display_name: string;
  id: string;
}[];

type MemberResponse = PostgrestSingleResponse<
  {
    created_at: string;
    id: string;
    member: string;
    roomid: string;
  }[]
>;

const RoomList = () => {
  const supabase = supabaseclient();
  const [users, setUsers] = useState<UserType>([]);
  const [rooms, setRooms] = useState<RoomType>([]);
  const [joinedroom, setJoinedRoom] = useState<MemberResponse>();

  // Fetch all rooms
  const fetchRooms = async () => {
    const { data, error } = await supabase.from("room").select("*");
    if (error) {
      console.error("Error fetching rooms:", error.message);
      return;
    }
    if (data) {
      setRooms(data);
      fetchUsers(data);
    }
  };

  // Fetch user details
  const fetchUsers = async (data: RoomType) => {
    if (data.length === 0) return;

    const userPromises = data.map(async (room: Room) => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", room.created_by);

      if (error) {
        console.error(`Error fetching user for ${room.created_by}:`, error.message);
        return null;
      }

      return data?.[0] || null;
    });

    const users = await Promise.all(userPromises);
    setUsers(users.filter((user) => user !== null));
  };

  // Fetch member data
  const fetchMember = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return;

    const member = await supabase
      .from("members")
      .select("*")
      .eq("member", data.user.id)

    if (member.data) {
      setJoinedRoom(member);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchMember();
  }, []);

  // Handle joining a room
  const handleJoin = async (roomid: string) => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;
  
    const { data: memberData, error } = await supabase
      .from("members")
      .select("*")
      .eq("member", authData.user.id)
      .eq("roomid", roomid);
  
 // Debugging: Check the output
  
    // If the user is already in the room, do nothing
    if (memberData && memberData.length > 0) {
      console.warn("User is already in this room.");
      return;
    }
  
    const res = await fetch("/api/room/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomid,
        userid: authData.user.id,
      }),
    });
  
    if (res.ok) {
      fetchMember(); 
      window.location.href=`/chatroom/${roomid}`// Refresh member list after joining
    }
  };

  return (
    <section className="p-4 grid gap-5 relative top-[100px]">
      <h2 className="text-xl font-bold bg-blue-500   p-3 w-fit rounded-lg mb-4">Available Rooms</h2>
      <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.length > 0 ? (
          rooms.map((room, index) => {
            // Check if user is already in the room
            const hasJoined = joinedroom?.data?.some((member) => member.roomid === room.id);

            if (!hasJoined) {
              return (
                <div key={room.id} className="p-4 border rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold">{room.name}</h3>
                  <p className="text-sm text-gray-500">
                    Created by: {users.length > 0 && users[index]?.display_name}
                  </p>
                  <Button onClick={() => handleJoin(room.id)}>Join</Button>
                </div>
              );
            }
            else if(hasJoined&& index == rooms.length-1){
             return <p>No rooms available to join.</p>
            }
       
          })
        ) : (
          <p>No rooms available.</p>
        )}
      </div>
    </section>
  );
};

export default RoomList;
