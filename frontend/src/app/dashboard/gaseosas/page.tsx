"use client";

import React, { useState, useEffect } from "react";
import { Gaseosa } from "../../../types";
import { api } from "../../../lib/api";
import { 
  GlassWater, 
  Plus, 
  Search, 
  Trash2, 
  RefreshCw, 
  AlertCircle,
  PlusCircle,
  MinusCircle
} from "lucide-react";

const DEMO_GASEOSAS: Gaseosa[] = [
  { id: "g-1", nombre_g: "Coca Cola Original 300ml", cantidad: 40, alerta_critica: false },
  { id: "g-2", nombre_g: "Coca Cola Zero 300ml", cantidad: 25, alerta_critica: false },
  { id: "g-3", nombre_g: "Sprite 300ml", cantidad: 15, alerta_critica: false },
  { id: "g-4", nombre_g: "Agua Tónica Britvic", cantidad: 6, alerta_critica: true },
  { id: "g-5", nombre_g: "Red Bull Energy Drink 250ml", cantidad: 8, alerta_critica: true },
];

export default function GaseosasPage() {
  const [gaseosas, setGaseosas] = useState<Gaseosa[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombreG, setNombreG] = useState("");
  const [cantidad, setCantidad] = useState(24);
  const [saving, setSaving] = useState(false);

  const fetchGaseosas = async () => {
    try {
      setLoading(true);
      const data = await api.gaseosas.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setGaseosas(data);
      } else {
        setGaseosas(DEMO_GASEOSAS);
      }
    } catch (err) {
      console.warn("Backend no disponible, usando gaseosas demostrativas:", err);
      setGaseosas(DEMO_GASEOSAS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGaseosas();
  }, []);

  const handleUpdateQty = async (g: Gaseosa, delta: number) => {
    const newQty = Math.max(0, g.cantidad + delta);
    try {
      await api.gaseosas.update(g.id, { cantidad: newQty });
      setGaseosas((prev) =>
        prev.map((item) =>
          item.id === g.id
            ? { ...item, cantidad: newQty, alerta_critica: newQty <= 8 }
            : item
        )
      );
    } catch (err) {
      setGaseosas((prev) =>
        prev.map((item) =>
          item.id === g.id
            ? { ...item, cantidad: newQty, alerta_critica: newQty <= 8 }
            : item
        )
      );
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.gaseosas.create({
        nombre_g: nombreG.trim(),
        cantidad: Number(cantidad),
      });
      setIsModalOpen(false);
      setNombreG("");
      fetchGaseosas();
    } catch (err) {
      const newItem: Gaseosa = {
        id: `g-${Date.now()}`,
        nombre_g: nombreG.trim(),
        cantidad: Number(cantidad),
        alerta_critica: Number(cantidad) <= 8,
      };
      setGaseosas((prev) => [newItem, ...prev]);
      setIsModalOpen(false);
      setNombreG("");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este mezclador del inventario?")) {
      try {
        await api.gaseosas.delete(id);
        fetchGaseosas();
      } catch (err) {
        setGaseosas((prev) => prev.filter((g) => g.id !== id));
      }
    }
  };

  const filtered = gaseosas.filter((g) => {
    const nombre = (g.nombre_g || g.nombreG || "").toLowerCase();
    return nombre.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center space-x-2">
            <GlassWater className="w-6 h-6 text-cyan-400" />
            <span>Inventario de Gaseosas y Mezcladores</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Control de sodas, aguas tónicas y energizantes con ajuste rápido de barra.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchGaseosas}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-600/20 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Gaseosa</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar gaseosa o mezclador..."
          className="w-full bg-[#101014] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((g) => {
          const isCritical = g.cantidad <= 8;
          return (
            <div
              key={g.id}
              className={`p-5 rounded-2xl bg-[#121217] border transition-all flex flex-col justify-between ${
                isCritical
                  ? "border-rose-500/40 shadow-lg shadow-rose-950/20"
                  : "border-zinc-800 hover:border-cyan-500/30"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <GlassWater className="w-5 h-5" />
                  </div>
                  {isCritical ? (
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold flex items-center space-x-1 animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      <span>CRÍTICO (≤ 8)</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                      Stock Normal
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-base text-zinc-100">
                  {g.nombre_g || g.nombreG}
                </h4>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-500 block">Stock en barra</span>
                  <span className="font-mono font-extrabold text-xl text-white">
                    {g.cantidad} <span className="text-xs text-zinc-400 font-normal">un.</span>
                  </span>
                </div>

                {/* Counter controls */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleUpdateQty(g, -1)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    title="Restar 1"
                  >
                    <MinusCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUpdateQty(g, 1)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-400 transition-colors"
                    title="Sumar 1"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-2"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal create */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#121217] border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-zinc-100">Registrar Gaseosa o Mezclador</h3>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                  Nombre (nombreG)
                </label>
                <input
                  type="text"
                  required
                  value={nombreG}
                  onChange={(e) => setNombreG(e.target.value)}
                  placeholder="Ej: Schweppes Ginger Ale 300ml"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                  Cantidad Inicial
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                >
                  {saving ? "Guardando..." : "Guardar Gaseosa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
