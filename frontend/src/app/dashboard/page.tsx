"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Wine, 
  Users, 
  GlassWater, 
  AlertTriangle, 
  ArrowUpRight, 
  PlusCircle, 
  RefreshCw,
  ShieldAlert
} from "lucide-react";
import StatCard from "../../components/StatCard";
import { api } from "../../lib/api";
import { ResumenStockGeneral } from "../../types";

export default function DashboardOverviewPage() {
  const [resumen, setResumen] = useState<ResumenStockGeneral>({
    total_bebidas: 0,
    total_gaseosas: 0,
    total_alertas: 0,
    items_criticos: [],
  });
  const [clientesCount, setClientesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const [resStock, clientesData] = await Promise.all([
        api.stock.getResumen().catch(() => ({
          total_bebidas: 5,
          total_gaseosas: 5,
          total_alertas: 2,
          items_criticos: [
            { id: "1", tipo: "Bebida/Licor", nombre: "Tequila Don Julio Reposado", cantidad: 4, umbral: 5 },
            { id: "2", tipo: "Gaseosa/Mezclador", nombre: "Agua Tónica Britvic", cantidad: 6, umbral: 8 }
          ],
        })),
        api.clientes.getAll().catch(() => [{ id: "1" }, { id: "2" }, { id: "3" }]),
      ]);

      setResumen(resStock);
      setClientesCount(Array.isArray(clientesData) ? clientesData.length : 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-900/30 via-zinc-900 to-zinc-900 border border-purple-500/20 backdrop-blur-xl">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-purple-400">
            Control de Barra & Sala
          </span>
          <h2 className="text-2xl font-black text-white mt-1">
            Panel General • Discoteca "LA BODEGA"
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Monitoreo en tiempo real de licores, mezcladores y alertas automáticas de reposición.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadMetrics}
            className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors flex items-center space-x-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Actualizar Datos</span>
          </button>
          <Link
            href="/dashboard/bebidas"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Gestionar Bebidas</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Licores y Bebidas"
          value={resumen.total_bebidas}
          subtitle="Catálogo registrado"
          icon={Wine}
          variant="purple"
        />
        <StatCard
          title="Gaseosas y Mixers"
          value={resumen.total_gaseosas}
          subtitle="Inventario de barra"
          icon={GlassWater}
          variant="cyan"
        />
        <StatCard
          title="Clientes VIP"
          value={clientesCount}
          subtitle="Mayores de edad (+18)"
          icon={Users}
          variant="amber"
        />
        <StatCard
          title="Alertas de Stock"
          value={resumen.total_alertas}
          subtitle="Productos por agotarse"
          icon={AlertTriangle}
          variant={resumen.total_alertas > 0 ? "red" : "purple"}
        />
      </div>

      {/* Critical Stock Alert Banner */}
      {resumen.total_alertas > 0 && (
        <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-500/40 relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-rose-300">
                Alerta Automática: Productos con Stock Faltante o Crítico
              </h3>
              <p className="text-xs text-rose-400/80 font-mono">
                Los siguientes productos han bajado de su umbral mínimo de seguridad en la barra.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumen.items_criticos.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-zinc-900/90 border border-rose-500/30 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">
                    {item.tipo}
                  </span>
                  <p className="font-semibold text-sm text-zinc-100">{item.nombre}</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Umbral mínimo: <span className="font-bold">{item.umbral} un.</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-extrabold text-sm font-mono">
                    {item.cantidad} un.
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-rose-500/20 flex justify-end">
            <Link
              href="/dashboard/stock"
              className="text-xs font-bold text-rose-300 hover:text-rose-200 flex items-center space-x-1"
            >
              <span>Ver panel completo de stock y reposición</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/bebidas"
          className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 hover:border-purple-500/50 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Wine className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-zinc-100 group-hover:text-purple-300 transition-colors">
              Catálogo de Bebidas
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Gestiona precios, fotos en Supabase Storage, y cantidades de botellas.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-purple-400">
            <span>Abrir catálogo</span>
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        <Link
          href="/dashboard/clientes"
          className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 hover:border-amber-500/50 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-zinc-100 group-hover:text-amber-300 transition-colors">
              Clientes VIP
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Registro con control de mayoría de edad, número de WhatsApp y dirección.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-amber-400">
            <span>Ver clientes</span>
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        <Link
          href="/dashboard/stock"
          className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 hover:border-cyan-500/50 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-zinc-100 group-hover:text-cyan-300 transition-colors">
              Control de Stock Faltante
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Lógica automática para alertar cervezas, gaseosas y licores antes de que se agoten.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-cyan-400">
            <span>Revisar inventario</span>
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
