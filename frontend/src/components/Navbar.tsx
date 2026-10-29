"use client";
import React, { useEffect, useState } from "react";
import { Bell, ShieldCheck, User as UserIcon } from "lucide-react";
import { api } from "@/lib/api";

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string>("bartender@labodega.com");
  const [role, setRole] = useState<string>("Staff");

  useEffect(() => {
    const user = api.auth.getCurrentUser();
    if (user) {
      setUserEmail(user.email || "staff@labodega.com");
      setRole(user.user_metadata?.role || "Staff VIP");
    }
  }, []);

  return (
    <header className="h-16 border-b border-zinc-800 bg-[#101014]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-xs font-mono uppercase text-zinc-400">Sistema en Vivo • Discoteca Activa</span>
      </div>

      <div className="flex items-center space-x-4">
        {/* User Badge */}
        <div className="flex items-center space-x-3 bg-zinc-900/90 border border-zinc-800 rounded-full py-1.5 px-4">
          <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-500/30">
            <UserIcon className="w-3.5 h-3.5" />
          </div>
          <div className="text-left text-xs">
            <p className="font-semibold text-zinc-200 leading-tight">{userEmail}</p>
            <p className="text-[10px] text-purple-400 font-mono capitalize">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
