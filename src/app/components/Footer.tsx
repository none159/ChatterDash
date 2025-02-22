import Link from "next/link";
import React from "react";
import { Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 relative top-[100vh]  shadow-md  text-white py-6">
      <div className="flex justify-between items-center w-[95%] mx-auto">
        {/* Navigation Links */}
        <ul className="grid gap-2">
          <Link href="/" className="hover:text-blue-500 hover:underline">
            Home
          </Link>
          <Link href="/room/list" className="hover:text-blue-500 hover:underline">
            Chat Rooms
          </Link>
          <Link href="/room/create" className="hover:text-blue-500 hover:underline">
            Create Room
          </Link>
        </ul>

        {/* Social Media Links */}
        <div className="flex flex-col items-center">
          <h2 className="mb-2 text-lg font-semibold">Socials</h2>
          <div className="flex gap-4">
            <Link href="https://facebook.com" target="_blank">
              <Facebook size={24} className="cursor-pointer hover:text-blue-500 transition" />
            </Link>
            <Link href="https://twitter.com" target="_blank">
              <Twitter size={24} className="cursor-pointer hover:text-blue-400 transition" />
            </Link>
            <Link href="https://instagram.com" target="_blank">
              <Instagram size={24} className="cursor-pointer hover:text-pink-500 transition" />
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-sm">Copyright © 2024-2025</div>
      </div>
    </footer>
  );
};

export default Footer;
