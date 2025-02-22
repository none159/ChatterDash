"use client";

import { supabaseclient } from "@/utils/supabase/browser";
import { useEffect, useState } from "react";

type Room = {
  id: string;
  created_at: string;
  created_by: string;
  name: string;
};

type Message = {
  created_at: string;
  id: string;
  is_edit: boolean;
  send_by: string;
  text: string;
  roomid: string;
  users?: {  // Made `users` optional
    avatar_url: string;
    created_at: string;
    display_name: string;
    id: string;
    email: string;
    provider: string;
  };
};

type Member = {
  created_at: string;
  id: string;
  member: string;
  roomid: string;
};

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<Message[]>([]); // Fixed type issue

  const supabase = supabaseclient();

  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase.from("room").select("*");
      if (error) console.error("Error fetching rooms:", error);
      else setRooms(data || []);
    };

    const fetchMembers = async () => {
      const { data, error } = await supabase.from("members").select("*");
      if (error) console.error("Error fetching members:", error);
      else setMembers(data || []);
    };

    const fetchMessages = async () => {
      const { data, error } = await supabase.from("messages").select("*");
      if (error) console.error("Error fetching messages:", error);
      else setMessages(data || []); // Ensure default value is an empty array
    };

    fetchRooms();
    fetchMembers();
    fetchMessages();
  }, []); // Run once on mount

  return (
    <section>
      <div>
        <h2>Popular Rooms</h2>
        {rooms.length > 0 ? (
          rooms.map((room) => <p key={room.id}>{room.name}</p>)
        ) : (
          <p>No rooms available.</p>
        )}
      </div>
    </section>
  );
}
