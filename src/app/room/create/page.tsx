"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabaseclient } from '@/utils/supabase/browser';
import Router, { useRouter } from 'next/router';
import React, { useState } from 'react'

const roomcreate =  () => {
    const [name,setname]=useState("")
    const [description,setdescription]=useState('')
    const supabase = supabaseclient();
    const createroom=async()=>{
    const {error,data} = await supabase.auth.getUser()

    const res = await fetch("/api/room/add",{

    method:'POST',
    body:JSON.stringify({
        name:name,
        description,
        creator:data.user?.id
    })
})
if(res.ok){
    const data = await res.json()
     window.location.href=`/chatroom/${data.id}`
}
    }
  return (
<section className='grid bg-gray-900 w-fit mx-auto py-5 px-20 rounded place-content-center text-center gap-20 relative top-[100px]'>
    <h1 className='text-3xl'>Create Room</h1>
    <div className='grid place-content-center align-middle text-center gap-7'>
        <h2>Name</h2>
        <Input className='w-[400px] h-[40px] text-white   ' value={name} onChange={(e)=>setname(e.target.value)}/>
        <h2>Description</h2>
        <Textarea  onChange={(e)=>setdescription(e.target.value)}  />
        <Button onClick={createroom}>Create</Button>
    </div>
</section>
  )
}

export default roomcreate