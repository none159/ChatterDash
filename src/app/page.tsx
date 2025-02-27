"use client"
import { supabaseclient } from "@/utils/supabase/browser";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Define types for state
type Room = {
  id:string;
  name: string;
  created_at: string;
};

type RoomWithCount = {
  name: string;
  count: number;
};

export default function Home() {
  const [recentRooms, setRecentRooms] = useState<Room[]>([]);
  const [activeRooms, setActiveRooms] = useState<RoomWithCount[]>([]);
  const [mostMemberRooms, setMostMemberRooms] = useState<RoomWithCount[]>([]);
  const supabase = supabaseclient();

  useEffect(() => {
    fetchRecentRooms();
    fetchActiveRooms();
    fetchMostMemberRooms();
  }, []);

  const fetchRecentRooms = async () => {
    const { data, error } = await supabase
      .from("room")
      .select("name, created_at,id")
      .order("created_at", { ascending: false })
      .limit(3);
    if (!error) setRecentRooms(data || []);
  };

  const fetchActiveRooms = async () => {
    const { data: messages } = await supabase.from("messages").select("roomid");
    if (!messages) return;

    const roomMessageCounts: Record<string, number> = messages.reduce((acc, msg) => {
      acc[msg.roomid] = (acc[msg.roomid] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedRooms = Object.entries(roomMessageCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3)
      .map(([id, count]) => ({ id, count }));

    const { data: rooms } = await supabase.from("room").select("id, name").in("id", sortedRooms.map((r) => r.id));
    if (!rooms) return;

    setActiveRooms(
      rooms.map((room) => ({
        name: room.name,
        count: roomMessageCounts[room.id] || 0,
      }))
    );
  };

  const fetchMostMemberRooms = async () => {
    const { data: members } = await supabase.from("members").select("roomid");
    if (!members) return;

    const roomMemberCounts: Record<string, number> = members.reduce((acc, member) => {
      acc[member.roomid] = (acc[member.roomid] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedRooms = Object.entries(roomMemberCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3)
      .map(([id, count]) => ({ id, count }));

    const { data: rooms } = await supabase.from("room").select("id, name").in("id", sortedRooms.map((r) => r.id));
    if (!rooms) return;

    setMostMemberRooms(
      rooms.map((room) => ({
        name: room.name,
        count: roomMemberCounts[room.id] || 0,
      }))
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative top-[200px] space-y-8 grid gap-5 ">
      <h1 className="text-2xl bg-blue-400 px-10 py-3 rounded mx-auto shadow-md shadow-black">STATS</h1>
       <section className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">Recently Added Rooms</h2>
        <div className="space-y-4">
          {recentRooms.length > 0 ? (
            recentRooms.map((room) => (
              <div key={room.id} className="p-4 bg-gray-100 shadow-md rounded-lg hover:shadow-lg transition duration-200">
                <h3 className="text-lg font-bold text-gray-700">{room.name}</h3>
                <p className="text-sm text-gray-500">Created at: {new Date(room.created_at).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No rooms available.</p>
          )}
        </div>
      </section>
      <section className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">Most Active Rooms</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activeRooms}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">Rooms with Most Members</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mostMemberRooms}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
