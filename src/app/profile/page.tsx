"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabaseclient } from "@/utils/supabase/browser";
import { PostgrestSingleResponse } from "@supabase/postgrest-js";
import Link from "next/link";

type user = {
  avatar_url: string;
  display_name: string;
  full_name:string;
  email: string;
};

type Room = {
  id: string;
  created_at: string;
  created_by: string;
  name: string;
};

type MemberResponse = PostgrestSingleResponse<
  {
    created_at: string;
    id: string;
    member: string;
    roomid: string;
  }[]
>;

type RoomType = Room[];

const Profile = () => {
  const supabase = supabaseclient();
  const[email,setemail]=useState("")
  const [session, setSession] = useState<user>();
  const [joinedroom, setJoinedRoom] = useState<MemberResponse>();
  const [userid, setUserid] = useState("");
  const [rooms, setRooms] = useState<RoomType>([]);

  const fetchRooms = async () => {
    const { data, error } = await supabase.from("room").select("*");

    if (error) {
      console.error("Error fetching rooms:", error.message);
      return;
    }
    if (data) {
      setRooms(data);
    }
  };

  const fetchMember = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return;

    const member = await supabase.from("members").select("*").eq("member", data.user.id);

    if (member.data) {
      setJoinedRoom(member);
    }
  };

  const fetchuser = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user && authData.user.email) {
      setUserid(authData.user.id);
      setemail(authData.user.email)
    }
  };

  const getSession = async () => {
    const res = await fetch("/api/session");
    if (res.ok) {
      const data = await res.json();
      setSession(data.user);

    }
  };
const handledelete = async(roomid:string,creator:string)=>{
   const res = await fetch('/api/room/delete',{
        method:'POST',
        body:JSON.stringify({
            creator,
            roomid
        })
    })
    if(res.ok){

        fetchMember()
        fetchRooms()
    }
}
const handleleave = async(roomid:string,member:string)=>{
    const res = await fetch('/api/room/delete',{
         method:'POST',
         body:JSON.stringify({
             member,
             roomid
         })
     })
     if(res.ok){

         fetchMember()
         fetchRooms()
     }
 }

  useEffect(() => {
    getSession();
    fetchuser();
    fetchMember();
    fetchRooms();
  }, []);
  
  // Remove whitespace and split full name
  const getFirstAndLastName = (fullName: string) => {
    const cleanedName = fullName.replace(/\s+/g, " ").trim(); // Remove extra spaces
    const nameParts = cleanedName.split(" ");
    return {
      firstName: nameParts.slice(1).join(" ") || "",
      lastName:nameParts[0] || "" , // Join the rest as last name
    };
  };

  return (
    <section className="relative top-[100px]">
      <div className="grid place-items-center text-center gap-5">
        {session && (
          <>
            <div className="grid items-center place-items-center gap-2  ">
              <Image
                src={session.avatar_url?session.avatar_url:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACUCAMAAAAqEXLeAAAAMFBMVEXk5ueutLfo6uu7wMOrsbTh4+SorrLS1dfW2dvO0tSyuLvLz9Ha3d7EyMq/xMbe4OGSiLUmAAAD20lEQVR4nO2b25arIAxAIVwF0f//20GnM705LSQa7DnsJx/3ChAwBCE6nU6n0+l0Op1Op9PpfAQAQhgjzPIFrWU2AZj9EKdJKTWlOIzmfJ5gogpS/yJDUO5UmiC8slo+Yq3y4iyeMGwpLmh9knDCGDYFL5pSza0N81xM20G8atrY2nFUbxwXTWWaOjr53nGZmi2H3JUorvhWyweGUsXM2MYSYnEcM9Y3cSwf65UwNpB8mR43LRtIFuSee7TinpZ1E/Ji6Xgtwdc75gFnTpfVg72GMrGGEhXIbMm5PwJKMTPxhRKcxVryJUtQWEed2Bw91jEvcK5ZCe/OuS+wjknSoEc7w7XtjPhA5lAySQ4kSZ7jL6B2m194dh0gOTJNSoPO5Cs8SYi0bphO6EBaN1mSY+Vgjru3sBx9IZEcpR44JKf/QTJ+guRHRJJFMhIlWVY3MQVJFsnKGtAjPDWhmbh381QIaJI8tWn0T/c3PL/elP8wpgyU8ZTxtkxFq5ngKCVXoWXCjzdbYY2SzjVbMcjUlsuvjnyXY4QzBsc57QL6h5GtXiWWUCIrvYyBzL+1yEgyKmJ3Hc1V9/sBE0fF7AiIvZH/1rs+o3NfiK1UVgCZb5p+qNp39NRCMZ+GKiz5r2jrLTXnVvNIKJuXmjv53GGKVg/fPdgfFGQi9o3mCZjfBDMfIdu31IEYXsxMG5qH8RsQUW62g2l5FsWFHM0p6HtPrcN0jubJX0DMPgVt7dosa61Vyc+naUO9BcCMzg3OnbHr+Bt4oLXPA4uS8X5IKamV/DE4P5/DNSuY2cekllm4TMfrqlknpg4q+tE0HPwlenFSweoX2Ty7yqCSm9t4zoOS2+lxwzT/cceRd7GDGGOwlT852oaclbg88waj5Ksh/ttTZk+Gcc9BnP5ozy8UDe7g8y8Ip1AxvMWGeOCoA7jHDRobzXjQIgLhA+1y5FZTpyNOmeBpnTZPmmH3ChuIqSwlVmnu2yC/TMadFVfNtN/UXMJ4DFrtFUzwh4TxornPzCT0xpZg0w65nXaTWMAeFZh9E8+2JnFilpVRyNA6w3gcSU+KzIHL+h6NjyVXHBeQF6PYay8cuGcREA/Nj09gMhGlLR8F5naC1sOAwVa3kBD7tFHUTktq4y5OsrL8X3NFsyNVJdfDTxXb6KqnjaaJY93pkjeN31ERyFaKFaFsNCNXivuGSC+XqJS+sEa+nNyF0s2x5WgXP88idppSJcuOv8RHQUTKxrvJtn1DUR8E9dkAlaLDL7Q5W1wlS/4c8R2cO1HS4zTuXoiso6jHe1SNGd47Pt+2clPi2Ol0/g2+AJcuMWGqzwoiAAAAAElFTkSuQmCC"}
                alt="Profile"
                width={300}
                height={300}
                className="w-[150px] h-[150px] rounded-full border-2 border-gray-700 "
              />
              <h2>{session.display_name}</h2>
            </div>
            <div className="bg-gray-900 py-10 px-20 rounded-md shadow-lg shadow-gray-950">
              <div className="grid gap-3 mb-5">
                <h2>
                  <span className="text-blue-500">Email : </span>
                  {email}
                </h2>
                <h2>
                  <span className="text-blue-500">First Name : </span>
                  {getFirstAndLastName(session.display_name?session.display_name:session.full_name).firstName}
                </h2>
                <h2>
                  <span className="text-blue-500">Last Name : </span>
                  {getFirstAndLastName(session.display_name?session.display_name:session.full_name).lastName}
                </h2>
              </div>

              <div className="grid gap-5 place-items-center">
                <h2>Joined Rooms:</h2>
                <div className="flex gap-5">
                  {rooms.length > 0 ? (
                    rooms.map((room) => {
                      const hasJoined = joinedroom?.data?.some(
                        (member) => member.roomid === room.id && member.member != room.created_by
                      );

                      if (hasJoined) {
                        return (
                            <>
                          <div key={room.id} className="p-5 grid gap-5 border rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold">
                              <span className="text-blue-500">Room : </span>
                              {room.name}
                            </h3>
                            <div className="flex gap-2">
                              <Link href={`/chatroom/${room.id}`}>
                                <Button className="hover:bg-green-500">Chat</Button>
                              </Link>
                        
                                <Button onClick={()=>handleleave(room.id,userid)} className="hover:bg-red-500">Leave</Button>
                             
                            </div>
                          </div>
                          
                          </>
                        );
                      }
                      if(!hasJoined){
                        
                            return(
                                <p key={room.id} className="text-gray-600">No Joined Room T_T</p>
                            )
                        
                      }
                    })
                  ):
                  (
                    <p  className="text-gray-600">No Joined Room T_T</p>
                )
                  }
                </div>
              </div>
              <div className="grid mt-5 gap-5 place-items-center">
                <h2>Created Rooms:</h2>
                <div className="flex gap-5">
                  {rooms.length > 0 ? (
                    rooms.map((room) => {
                      const isadmin = joinedroom?.data?.some(
                        (member) => member.member === room.created_by
                      );

                      if (isadmin) {
                        return (
                            <>
                          <div key={room.id} className="p-5 grid gap-5 border rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold">
                              <span className="text-blue-500">Room : </span>
                              {room.name}
                            </h3>
                            <div className="flex gap-2">
                              <Link href={`/chatroom/${room.id}`}>
                                <Button className="hover:bg-green-500">Chat</Button>
                              </Link>
                        
                                <Button onClick={()=>handledelete(room.id,room.created_by)} className="hover:bg-red-500">Delete</Button>
                             
                            </div>
                          </div>
                          
                          </>
                        );
                      }
                      if(!isadmin){
                        
                            return(
                                <p key={room.id} className="text-gray-600">No Created Room ^_^</p>
                            )
                        
                      }
                    })
                  ):
                  (
                    <p  className="text-gray-600">No Joined Room T_T</p>
                )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Profile;
