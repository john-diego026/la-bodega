"use client";

import React, { useState, useEffect } from "react";
import { Bebida } from "../../../types";
import { api } from "../../../lib/api";
import BebidaCard from "../../../components/BebidaCard";
import BebidaModal from "../../../components/BebidaModal";
import { 
  Wine, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle 
} from "lucide-react";

const CATEGORIAS = ["Todos", "Ron", "Whisky", "Vodka", "Tequila", "Cerveza", "Gin", "Vino & Champagne"];

// Fallback demo data si la base de datos se inicializa en local sin conexión previa
const DEMO_BEBIDAS: Bebida[] = [
  {
    id: "demo-1",
    nombre_b: "Ron Havana Club 7 Años",
    tipo: "Ron",
    cantidad: 25,
    precio: 45.0,
    imagen_url: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80",
    alerta_critica: false,
  },
  {
    id: "demo-2",
    nombre_b: "Whisky Johnnie Walker Black Label",
    tipo: "Whisky",
    cantidad: 18,
    precio: 65.0,
    imagen_url: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=600&q=80",
    alerta_critica: false,
  },
  {
    id: "demo-3",
    nombre_b: "Vodka Absolut Original",
    tipo: "Vodka",
    cantidad: 8,
    precio: 38.0,
    imagen_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    alerta_critica: false,
  },
  {
    id: "demo-4",
    nombre_b: "Tequila Don Julio Reposado",
    tipo: "Tequila",
    cantidad: 4,
    precio: 85.0,
    imagen_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80",
    alerta_critica: true,
  },
  {
    id: "demo-5",
    nombre_b: "Cerveza Corona Extra 355ml",
    tipo: "Cerveza",
    cantidad: 6,
    precio: 5.0,
    imagen_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=600&q=80",
    alerta_critica: false,
  },
];

export default function BebidasPage() {
  const [bebidas, setBebidas] = useState<Bebida[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [bebidaToEdit, setBebidaToEdit] = useState<Bebida | null>(null);

  const fetchBebidas = async () => {
    try {
      setLoading(true);
      const data = await api.bebidas.getAll(
        selectedCategoria !== "Todos" ? selectedCategoria : undefined
      );
      if (Array.isArray(data) && data.length > 0) {
        setBebidas(data);
      } else {
        setBebidas(DEMO_BEBIDAS);
      }
    } catch (err) {
      console.warn("Backend no disponible o error de red, usando catálogo demostrativo:", err);
      setBebidas(DEMO_BEBIDAS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBebidas();
  }, [selectedCategoria]);

  const handleEdit = (bebida: Bebida) => {
    setBebidaToEdit(bebida);
    setModalOpen(true);
  };

  const handleCreateNew = () => {
    setBebidaToEdit(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta bebida del inventario?")) {
      try {
        await api.bebidas.delete(id);
        fetchBebidas();
      } catch (err) {
        // Actualización local si falla backend
        setBebidas((prev) => prev.filter((b) => b.id !== id));
      }
    }
  };

  const filteredBebidas = bebidas.filter((b) => {
    const nombre = (b.nombre_b || b.nombreB || "").toLowerCase();
    const matchesSearch = nombre.includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategoria === "Todos" ||
      b.tipo.toLowerCase() === selectedCategoria.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & New Bebida button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center space-x-2">
            <Wine className="w-6 h-6 text-purple-400" />
            <span>Inventario y Catálogo de Bebidas</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Gestión visual de licores con imágenes sincronizadas en Supabase Storage.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchBebidas}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Refrescar catálogo"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Bebida</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#101014] p-4 rounded-2xl border border-zinc-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de bebida..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoria(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategoria === cat
                  ? "bg-purple-600 text-white font-semibold shadow-sm"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredBebidas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBebidas.map((bebida) => (
            <BebidaCard
              key={bebida.id}
              bebida={bebida}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-[#101014] rounded-3xl border border-zinc-800">
          <Wine className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <h4 className="font-bold text-zinc-300">No se encontraron bebidas</h4>
          <p className="text-xs text-zinc-500 mt-1">
            Intenta cambiar el término de búsqueda o registra una nueva botella.
          </p>
        </div>
      )}

      {/* Modal create / edit */}
      <BebidaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={fetchBebidas}
        bebidaToEdit={bebidaToEdit}
      />
    </div>
  );
}
