"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabaseclient } from "@/utils/supabase/browser";

type User = {
  avatar_url: string;
  created_at: string;
  full_name: string;
  email: string;
  provider_id: string;
  display_name: string;
  password: string;
  id: string;
};

const Settings = () => {
  const supabase = supabaseclient();
  const [session, setSession] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
        setLoading(false);
        return;
      }
    
      if (data?.user) {
        const { id, email, user_metadata, created_at } = data.user;
    
        // Get the latest avatar from storage
        console.log(user_metadata.provider_id)
        setSession({
          avatar_url: user_metadata?.avatar_url || "",
          full_name: user_metadata?.full_name || "",
          email: email || "",
          provider_id: user_metadata?.provider_id || "",
          display_name: user_metadata?.display_name || "",
          password: "",
          id,
          created_at: created_at || "",
        });
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (session) {
      setSession({ ...session, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    setMessage(null);
    const body: Record<string, any> = {
      id: session.id,
    };
    if (session.full_name) body.full_name = session.full_name;
    if (session.avatar_url) body.avatar_url = session.avatar_url;
    if (session.password) body.password = session.password;

    const updateData: Record<string, any> = {};

// Add fields only if they have values
if (session.full_name) updateData.full_name = session.full_name;
if (session.display_name) updateData.display_name = session.display_name;
if (session.avatar_url) updateData.avatar_url = session.avatar_url;
const updatePayload: Record<string, any> = { data: updateData };
// Only include password if it's provided
if (session.password) updatePayload.password = session.password;
    const { error } = await supabase.auth.updateUser(updatePayload);
console.log(session.avatar_url)
console.log(updateData)
    const res = await fetch("/api/setting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.redirected) {
      window.location.href = res.url;
      
    }

    if (error) {
      setMessage("Error updating settings: " + error.message);
    } else {
      setMessage("Settings updated successfully!");
      setTimeout(() => window.location.reload(), 1000);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!session || !file) return;

    setAvatarUploading(true);
    const fileExt = file.name.split(".").pop()?.toLowerCase();

    const filePath = `${session.id}-${Date.now()}.${fileExt}`;

    // Delete previous avatars
    const { data: files, error: listError } = await supabase.storage.from("avatars").list("avatars");
    if (listError) {
      console.error("Error listing images:", listError);
    } else if (files?.length > 0) {
      await Promise.all(
        files.map(async (file) => {
          if (file.name.startsWith(session.id)) {
            await supabase.storage.from("avatars").remove([file.name]);
          }
        })
      );
    }

    // Upload new avatar
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
    if (uploadError) {
      console.error("Upload error:", uploadError);
      setAvatarUploading(false);
      return;
    }

    // Get new avatar URL
    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const newUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    await supabase.auth.updateUser({ data: { avatar_url: newUrl } });
    setSession({ ...session, avatar_url: newUrl });
    setMessage("Avatar updated successfully!");
    setAvatarUploading(false);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>

      {message && <p className="mb-4 text-sm text-center">{message}</p>}

      <div className="mb-4">
        <label className="block text-sm font-medium">Full Name</label>
        <input
          type="text"
          name="full_name"
          value={session?.full_name || ""}
          onChange={handleChange}
          className="border rounded-md text-black p-2 w-full"
          disabled={!!session?.provider_id}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={session?.email || ""}
          className="border rounded-md p-2 w-full"
          disabled
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          name="password"
          onChange={handleChange}
          value={session?.password || ""}
          className="border text-black rounded-md p-2 w-full"
          disabled={!!session?.provider_id}
          
        />
      </div>

      <div className="mb-4 flex items-center space-x-4">
        {session?.avatar_url ? (
          <Image src={session.avatar_url} alt="User Avatar" width={150} height={0} className="rounded-full" />
        ) : (
          <p>No avatar</p>
        )}
{!session?.provider_id&&(
        <label className="cursor-pointer text-black bg-gray-200 p-2 rounded-md text-sm">
          Upload Avatar
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleAvatarUpload(e.target.files[0])}
            className="hidden"
          />
        </label>)
}
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
};

export default Settings;
