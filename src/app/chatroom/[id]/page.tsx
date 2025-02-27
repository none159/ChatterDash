"use client"
import { format } from "date-fns";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabaseclient } from '@/utils/supabase/browser';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FaEllipsisV } from "react-icons/fa";
import { useParams } from "next/navigation";

type MessagePayload = {
  new: {
    created_at: string;
    id: string;
    is_edit: boolean;
    send_by: string;
    text: string;
    roomid:string;
  };
};

type message = {
  created_at: string;
  id: string;
  is_edit: boolean;
  send_by: string;
  text: string;
  roomid:string;
  users: {
    avatar_url: string;
    created_at: string;
    display_name: string;
    id: string;

  };
}[];

type user = {
  full_name: string;
  id:string;
};
type roomtype = {
  id: string;
  created_at: string;
  created_by: string;
  name: string;
}[]
const Chatroom = () => {
  const { id } = useParams<{ id: string }>();
  const supabase = supabaseclient();
  const [showham, setshowham] = useState(false);
  const [datas, setdatas] = useState<message>([]);
  const [session, setsession] = useState<user>();
  const [room,setroom]=useState<roomtype>()
  const [messages, setMessages] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedMessage, setEditedMessage] = useState<string>("");
 const fetchroom=async()=>{
  const res =await fetch("/api/room/get",{
    method:"POST",
    body:JSON.stringify({
      roomid:id
    })

  })
  if(res.ok){
    const data = await res.json()

    setroom(data.room)
  }else{
    window.location.href="/error?message=Room Not Found"
  }
 }
  const handledelete = async (userid: any, messageid: any) => {
    try {
      const res = await fetch("/api/messages/delete", {
        method: 'POST',
        body: JSON.stringify({
          userid,
          messageid
        })
      });
      if (res.ok) {
        fetchmessages();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getsession = async () => {
    const res = await fetch("/api/session");
    if (res.ok) {
      const data = await res.json();
      setsession(data.user);
    }
  };

  const fetchmessages = async () => {
    const { error, data } = await supabase.from("messages").select('*, users(*)').eq("roomid",id);
    
    if (data) {
      // Parse the created_at string into Date objects before sorting
      const sortedMessages = data.sort((a, b) => {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ;
      });
      setdatas(sortedMessages);
      console.log(sortedMessages)
      sortedMessages.map((item) => {
        setMessages((prevMessages) => [...prevMessages, item.text]);
      });
    }
  };
  
  const handleSend = async () => {
    if (currentMessage.trim() !== "") {
      setCurrentMessage(""); // Clear the input after sending
      const { error } = await supabase.from("messages").insert({ text: currentMessage,send_by:session!.id,roomid:id});

      if (error) {
        console.log(error);
      }
    }
  };

  const handleEditMessage = async (userid:string,messageid: string) => {
  try{
    if (editedMessage.trim() !== "") {
     const res = await fetch("/api/messages/edit",{
        method:"POST",
        body:JSON.stringify({
          userid,
          messageid,
          message:editedMessage
        })
      })
      if(res.ok){
        setEditingMessageId('')
      }
    }
  }catch(error){
    console.log(error)
  }
  };

  useEffect(() => {
    getsession();
    fetchmessages();
    fetchroom()

    const insertChannel = supabase
      .channel(`Insert_channel_${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload: any) => {
        if (!payload.new) return;

        const userId = payload.new.send_by;
        if (!userId) {
          console.error('send_by field is missing in the payload');
          return;
        }

        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

          if (error) {
            console.error('Error fetching user data:', error.message);
            return;
          }

          const newMessage = {
            created_at: payload.new.created_at,
            id: payload.new.id,
            is_edit: payload.new.is_edit,
            send_by: userId,
            text: payload.new.text,
            users: data,
            roomid:payload.new.roomids
          };

          setdatas((prevData) => [...prevData, newMessage]);
    
          setMessages((prevMessages) => [...prevMessages, newMessage.text]);
        } catch (err) {
          console.error('Error processing new message:', err);
        }
      })
      .subscribe();

    const updateChannel = supabase
      .channel(`Update_channel_${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, async (payload: any) => {
        if (!payload.new) return;

        const userId = payload.new.send_by;
        if (!userId) {
          console.error('send_by field is missing in the payload');
          return;
        }

        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

          if (error) {
            console.error('Error fetching user data:', error.message);
            return;
          }

          const updatedMessage = {
            created_at: payload.new.created_at,
            id: payload.new.id,
            is_edit: payload.new.is_edit,
            send_by: userId,
            text: payload.new.text,
            users: data,
            roomid:payload.new.roomid
          };
 
          setdatas((prevData) =>
            prevData.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
      
          setMessages((prevMessages) =>
            prevMessages.map((msg, index) =>
              index === prevMessages.findIndex((msg: any) => msg.id === updatedMessage.id)
                ? updatedMessage.text
                : msg
            )
          );
        } catch (err) {
          console.error('Error processing updated message:', err);
        }
      })
      .subscribe();

    const deleteChannel = supabase
      .channel(`delete_channel_${id}`)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, async (payload: any) => {
        if (!payload.old) return;

        const deletedMessageId = payload.old.id;

        setdatas((prevData) => prevData.filter((msg) => msg.id !== deletedMessageId));
        setMessages((prevMessages) => prevMessages.filter((msg) => msg !== payload.old.text))
  
      })
      .subscribe();

    return () => {
      insertChannel.unsubscribe();
      updateChannel.unsubscribe();
      deleteChannel.unsubscribe();
    };
  }, []);

  return (
    <section className=' grid gap-20 relative top-[100px] m-10'>
      <h1 className=" border-b border-b-blue-500 pb-1  text-4xl mx-auto">{room&&room[0].name}</h1>
      <div className='grid place-items-center border'>
        <div className='w-[100%] h-[500px] overflow-y-auto p-4'>
          {messages.length > 0 ? (
            datas.map((msg, index) => {
              
              const isCurrentUser = msg.users.display_name === session?.full_name;
              return (
                <div key={msg.id} className={`flex flex-col gap-5 mx-3 my-4 ${isCurrentUser ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-3">
                    {!isCurrentUser && (
                      <Image
                        src={msg.users.avatar_url}
                        width={40}
                        height={40}
                        alt={msg.users.display_name}
                        className="rounded-full"
                      />
                    )}
                    {isCurrentUser && (
                      <div className="relative">
                        <FaEllipsisV
                          className="cursor-pointer text-gray-600 hover:text-gray-800"
                          onClick={() => setMenuOpen(menuOpen === msg.id ? null : msg.id)}
                        />
                        {menuOpen === msg.id && (
                          <ul className="absolute right-0 mt-2 bg-white text-black shadow-lg rounded p-2 text-sm">
                            <li className="p-2 hover:bg-gray-200 cursor-pointer" onClick={() => setEditingMessageId(msg.id)}>
                              Edit
                            </li>
                            <li className="p-2 hover:bg-red-500 cursor-pointer" onClick={() => handledelete(msg.users.id, msg.id)}>
                              Delete
                            </li>
                          </ul>
                        )}
                      </div>
                    )}
                    <span className="font-semibold">{msg.users.display_name}</span>
                    {isCurrentUser && (
                      <Image
                        src={msg.users.avatar_url}
                        width={40}
                        height={40}
                        alt={msg.users.display_name}
                        className="rounded-full"
                      />
                    )}
                  </div>
                  <div className={`flex items-center gap-2 ${isCurrentUser ? "justify-end" : ""}`}>
                    {isCurrentUser && (
                      <span className="text-gray-800 text-sm">
                        {format(new Date(msg.created_at), "dd MMMM yyyy HH:mm:ss")}
                      </span>
                    )}
                    {editingMessageId === msg.id ? (
                      <div className="flex gap-2">
                        <Textarea
                          value={editedMessage}
                          onChange={(e) => setEditedMessage(e.target.value)}
                          className="w-80"
                        />
                        <div className="grid gap-2">
                        <Button onClick={() => handleEditMessage(msg.users.id,msg.id)}>Save</Button>
                        <Button onClick={()=>{setEditingMessageId("");setMenuOpen("")} }>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <span
                        className={`px-4 py-2 w-fit shadow text-black rounded-lg ${isCurrentUser ? "bg-blue-400" : "bg-white"}`}
                      >
                        {msg.text}
                      </span>
                    )}
                    {!isCurrentUser && (
                      <span className="text-gray-800 text-sm">
                        {format(new Date(msg.created_at), "dd MMMM yyyy HH:mm:ss")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-400">No messages yet</p>
          )}
        </div>
        <div className='flex justify-evenly items-center w-[100%] p-4'>
          <Textarea
            className='w-[90%] h-[30px] rounded'
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder='Type your message here...'
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
    </section>
  );
};

export default Chatroom;
