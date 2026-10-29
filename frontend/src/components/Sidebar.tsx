"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Wine, 
  Users, 
  Layers, 
  AlertTriangle, 
  GlassWater, 
  LogOut, 
  Sparkles,
  LayoutDashboard
} from "lucide-react";
import { api } from "../lib/api";

const navigation = [
  { name: "Panel Principal", href: "/dashboard", icon: LayoutDashboard },
  { name: "Catálogo Bebidas", href: "/dashboard/bebidas", icon: Wine },
  { name: "Clientes VIP", href: "/dashboard/clientes", icon: Users },
  { name: "Gaseosas y Mixers", href: "/dashboard/gaseosas", icon: GlassWater },
  { name: "Stock y Alertas", href: "/dashboard/stock", icon: AlertTriangle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    api.auth.logout();
    router.push("/");
  };

  return (
    <aside className="w-64 bg-[#101014] border-r border-zinc-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400">
              LA BODEGA
            </h1>
            <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
              Nightclub & Bar
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-purple-600/15 text-purple-300 border border-purple-500/30 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-purple-400" : "text-zinc-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-zinc-800/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 border border-transparent transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
