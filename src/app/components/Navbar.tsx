"use client";

import React, { useEffect, useRef, useState } from "react";
import { Settings, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


type user = {
  full_name: string;
  avatar_url:string;
  display_name:string;
};
const Navbar = () => {

  const [showProfile, setShowProfile] = useState(false);
  const[session,setsession]=useState<user>()
  const ref = useRef(undefined)

  const getsession = async () => {

    const res = await fetch("/api/session");
    if (res.ok) {
      const data = await res.json();
      setsession(data.user);
      ref.current = data.user
      console.log(ref)

    }
  };
  const logout = async()=>{
    const res=  await fetch('/api/logout')
    if(res.ok){
      window.location.href="/login"
    }
  }
  
  useEffect(() => {
 
      getsession();
    
  }, []);
  
  return (
    <nav className="bg-gray-900 shadow-md">
      <div className="flex justify-between w-[95%] p-5 mx-auto">
        <a className="text-white text-xl font-bold cursor-default"><span className="text-blue-500">C</span>hatter<span className="text-blue-500">D</span>ash</a>

        <div className="flex gap-5 align-middle items-center text-white">
          <Link href="/" className="cursor-pointer duration-300 ease-in-out hover:text-gray-300">
            Home
          </Link>
          <Link href="/room/list" className="cursor-pointer duration-300 ease-in-out hover:text-gray-300">
            Chat rooms
          </Link>
          <Link href="/room/create" className="cursor-pointer duration-300 ease-in-out hover:text-gray-300">
            Create room
          </Link>

{session?

      (
          <div className="relative">
            {/* Avatar */}
            <div
              className="flex items-center gap-2 cursor-pointer hover:text-gray-300"
              onClick={() => setShowProfile(!showProfile)}
            >
              <Image
                src={session.avatar_url?session.avatar_url:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACUCAMAAAAqEXLeAAAAMFBMVEXk5ueutLfo6uu7wMOrsbTh4+SorrLS1dfW2dvO0tSyuLvLz9Ha3d7EyMq/xMbe4OGSiLUmAAAD20lEQVR4nO2b25arIAxAIVwF0f//20GnM705LSQa7DnsJx/3ChAwBCE6nU6n0+l0Op1Op9PpfAQAQhgjzPIFrWU2AZj9EKdJKTWlOIzmfJ5gogpS/yJDUO5UmiC8slo+Yq3y4iyeMGwpLmh9knDCGDYFL5pSza0N81xM20G8atrY2nFUbxwXTWWaOjr53nGZmi2H3JUorvhWyweGUsXM2MYSYnEcM9Y3cSwf65UwNpB8mR43LRtIFuSee7TinpZ1E/Ji6Xgtwdc75gFnTpfVg72GMrGGEhXIbMm5PwJKMTPxhRKcxVryJUtQWEed2Bw91jEvcK5ZCe/OuS+wjknSoEc7w7XtjPhA5lAySQ4kSZ7jL6B2m194dh0gOTJNSoPO5Cs8SYi0bphO6EBaN1mSY+Vgjru3sBx9IZEcpR44JKf/QTJ+guRHRJJFMhIlWVY3MQVJFsnKGtAjPDWhmbh381QIaJI8tWn0T/c3PL/elP8wpgyU8ZTxtkxFq5ngKCVXoWXCjzdbYY2SzjVbMcjUlsuvjnyXY4QzBsc57QL6h5GtXiWWUCIrvYyBzL+1yEgyKmJ3Hc1V9/sBE0fF7AiIvZH/1rs+o3NfiK1UVgCZb5p+qNp39NRCMZ+GKiz5r2jrLTXnVvNIKJuXmjv53GGKVg/fPdgfFGQi9o3mCZjfBDMfIdu31IEYXsxMG5qH8RsQUW62g2l5FsWFHM0p6HtPrcN0jubJX0DMPgVt7dosa61Vyc+naUO9BcCMzg3OnbHr+Bt4oLXPA4uS8X5IKamV/DE4P5/DNSuY2cekllm4TMfrqlknpg4q+tE0HPwlenFSweoX2Ty7yqCSm9t4zoOS2+lxwzT/cceRd7GDGGOwlT852oaclbg88waj5Ksh/ttTZk+Gcc9BnP5ozy8UDe7g8y8Ip1AxvMWGeOCoA7jHDRobzXjQIgLhA+1y5FZTpyNOmeBpnTZPmmH3ChuIqSwlVmnu2yC/TMadFVfNtN/UXMJ4DFrtFUzwh4TxornPzCT0xpZg0w65nXaTWMAeFZh9E8+2JnFilpVRyNA6w3gcSU+KzIHL+h6NjyVXHBeQF6PYay8cuGcREA/Nj09gMhGlLR8F5naC1sOAwVa3kBD7tFHUTktq4y5OsrL8X3NFsyNVJdfDTxXb6KqnjaaJY93pkjeN31ERyFaKFaFsNCNXivuGSC+XqJS+sEa+nNyF0s2x5WgXP88idppSJcuOv8RHQUTKxrvJtn1DUR8E9dkAlaLDL7Q5W1wlS/4c8R2cO1HS4zTuXoiso6jHe1SNGd47Pt+2clPi2Ol0/g2+AJcuMWGqzwoiAAAAAElFTkSuQmCC"} // Replace with actual user profile image
                alt="Profile"
                width={20}
                height={20}
                className="w-8 h-8 rounded-full border-2 border-gray-700 hover:border-gray-500"
              />
            </div>
            {/* Dropdown Menu */}
            <ul
              className={`absolute top-[50px] ${
                showProfile ? "grid" : "hidden"
              } gap-2 left-[-50px] shadow-md p-2 rounded grid place-items-center text-center bg-white text-black w-32`}
            >
              <h2 className="border-b w-[100%] mx-auto">{session.display_name?session.display_name:session.full_name}</h2>
              <Link href="/profile" className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-200 rounded-m d">
                <User size={18} />
                Profile
              </Link>
              <Link href="/setting" className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-200 rounded-md">
                <Settings size={18} />
                Settings
              </Link>
              <li  onClick={logout} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-200 rounded-md text-red-500">
                <LogOut size={18} />
                Logout
              </li>
            </ul>
            </div>)
:<>  <Link href="/login" className="cursor-pointer duration-300 ease-in-out hover:text-gray-300">
Login
</Link>
<Link href="/signup" className="cursor-pointer duration-300 ease-in-out hover:text-gray-300">
            Signup
          </Link></>}
    
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
