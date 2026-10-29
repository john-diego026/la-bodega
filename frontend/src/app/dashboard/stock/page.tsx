"use client";

import React, { useState, useEffect } from "react";
import { StockItem } from "../../../types";
import { api } from "../../../lib/api";
import { 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sliders, 
  Trash2,
  Beer,
  Layers
} from "lucide-react";

const DEMO_STOCK: StockItem[] = [
  {
    id: "stk-1",
    cerveza: "Cerveza Corona Extra Pack x24",
    cantidad: 4,
    umbral_minimo: 10,
    alerta_producto_faltante: true,
    updated_at: "2026-10-27T19:00:00Z",
  },
  {
    id: "stk-2",
    cerveza: "Cerveza Heineken Barril 5L",
    cantidad: 15,
    umbral_minimo: 8,
    alerta_producto_faltante: false,
    updated_at: "2026-10-27T19:00:00Z",
  },
  {
    id: "stk-3",
    cerveza: "Cerveza Paceña Black Lata",
    cantidad: 6,
    umbral_minimo: 12,
    alerta_producto_faltante: true,
    updated_at: "2026-10-27T19:00:00Z",
  },
];

export default function StockPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [filterAlertasOnly, setFilterAlertasOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [cerveza, setCerveza] = useState("");
  const [cantidad, setCantidad] = useState<number>(5);
  const [umbralMinimo, setUmbralMinimo] = useState<number>(10);
  const [saving, setSaving] = useState(false);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const data = filterAlertasOnly
        ? await api.stock.getAlertas()
        : await api.stock.getAll();

      if (Array.isArray(data) && data.length > 0) {
        setStockItems(data);
      } else {
        setStockItems(DEMO_STOCK);
      }
    } catch (err) {
      console.warn("Backend no disponible, usando datos de demostración:", err);
      setStockItems(
        filterAlertasOnly ? DEMO_STOCK.filter((s) => s.alerta_producto_faltante) : DEMO_STOCK
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [filterAlertasOnly]);

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload: Partial<StockItem> = {
        cerveza: cerveza.trim(),
        cantidad: Number(cantidad),
        umbral_minimo: Number(umbralMinimo),
      };
      await api.stock.create(payload);
      setIsModalOpen(false);
      setCerveza("");
      fetchStock();
    } catch (err) {
      // Local addition
      const newItem: StockItem = {
        id: `stk-${Date.now()}`,
        cerveza: cerveza.trim(),
        cantidad: Number(cantidad),
        umbral_minimo: Number(umbralMinimo),
        alerta_producto_faltante: Number(cantidad) <= Number(umbralMinimo),
      };
      setStockItems((prev) => [newItem, ...prev]);
      setIsModalOpen(false);
      setCerveza("");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este registro de stock?")) {
      try {
        await api.stock.delete(id);
        fetchStock();
      } catch (err) {
        setStockItems((prev) => prev.filter((s) => s.id !== id));
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            <span>Control de Stock y Alertas de Faltantes</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Lógica reactiva: El sistema activa automáticamente la alerta cuando la existencia cae por debajo del umbral mínimo.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFilterAlertasOnly(!filterAlertasOnly)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-colors ${
              filterAlertasOnly
                ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>{filterAlertasOnly ? "Mostrando Solo Faltantes" : "Filtrar Faltantes"}</span>
          </button>

          <button
            onClick={fetchStock}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Stock</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#101014] border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Producto / Cerveza</th>
                <th className="px-6 py-4 text-center">Cantidad Actual</th>
                <th className="px-6 py-4 text-center">Umbral Mínimo</th>
                <th className="px-6 py-4">Estado Automático de Alerta</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {stockItems.map((item) => {
                const isFaltante =
                  item.alerta_producto_faltante || item.cantidad <= item.umbral_minimo;
                return (
                  <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-100 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                        <Beer className="w-4 h-4" />
                      </div>
                      <span>{item.cerveza || "Item de Inventario"}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-sm">
                      <span
                        className={`px-3 py-1 rounded-xl ${
                          isFaltante
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {item.cantidad} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-zinc-400">
                      {item.umbral_minimo} unidades
                    </td>
                    <td className="px-6 py-4">
                      {isFaltante ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 font-semibold animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>ALERTA PRODUCTO FALTANTE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Stock Óptimo</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal create stock entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121217] border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-zinc-100 flex items-center space-x-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>Registrar Lote de Stock</span>
              </h3>
            </div>

            <form onSubmit={handleSaveStock} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                  Descripción / Cerveza / Lote
                </label>
                <input
                  type="text"
                  required
                  value={cerveza}
                  onChange={(e) => setCerveza(e.target.value)}
                  placeholder="Ej: Cerveza Corona Extra 355ml"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                    Cantidad Actual
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

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                    Umbral Mínimo Alerta
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={umbralMinimo}
                    onChange={(e) => setUmbralMinimo(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400">
                💡 <span className="font-semibold text-zinc-200">Lógica automática:</span> Si la cantidad ({cantidad}) es ≤ al umbral ({umbralMinimo}), el sistema marcará inmediatamente la alerta de producto faltante.
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all"
                >
                  {saving ? "Guardando..." : "Guardar en Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
