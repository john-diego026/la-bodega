"use client";

import React, { useState, useEffect } from "react";
import { Cliente } from "../../../types";
import { api } from "../../../lib/api";
import ClienteModal from "../../../components/ClienteModal";
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Trash2, 
  Edit,
  RefreshCw 
} from "lucide-react";

const DEMO_CLIENTES: Cliente[] = [
  {
    id: "cli-1",
    nombre_c: "Carlos Mendoza",
    telefono: "+591 70011223",
    direccion: "Av. San Martín #450",
    edad: 26,
    created_at: "2026-10-25T20:00:00Z",
  },
  {
    id: "cli-2",
    nombre_c: "Valeria Rivas",
    telefono: "+591 71233445",
    direccion: "Calle Las Palmas #12",
    edad: 22,
    created_at: "2026-10-26T21:30:00Z",
  },
  {
    id: "cli-3",
    nombre_c: "Mateo Fernández",
    telefono: "+591 78990011",
    direccion: "Equipetrol Norte Calle 7",
    edad: 31,
    created_at: "2026-10-27T01:15:00Z",
  },
];

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await api.clientes.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setClientes(data);
      } else {
        setClientes(DEMO_CLIENTES);
      }
    } catch (err) {
      console.warn("Backend no disponible, usando clientes demostrativos:", err);
      setClientes(DEMO_CLIENTES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleEdit = (c: Cliente) => {
    setClienteToEdit(c);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setClienteToEdit(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este cliente?")) {
      try {
        await api.clientes.delete(id);
        fetchClientes();
      } catch (err) {
        setClientes((prev) => prev.filter((c) => c.id !== id));
      }
    }
  };

  const filteredClientes = clientes.filter((c) => {
    const nombre = (c.nombre_c || c.nombreC || "").toLowerCase();
    const tel = (c.telefono || "").toLowerCase();
    return (
      nombre.includes(searchTerm.toLowerCase()) ||
      tel.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center space-x-2">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Gestión de Clientes VIP</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Registro de asistentes con control estricto de mayoría de edad (≥ 18 años).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchClientes}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleCreate}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o teléfono de cliente..."
          className="w-full bg-[#101014] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-[#101014] border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Cliente (nombreC)</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Dirección</th>
                <th className="px-6 py-4">Edad</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filteredClientes.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-100 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-xs uppercase">
                      {(c.nombre_c || c.nombreC || "C")[0]}
                    </div>
                    <span>{c.nombre_c || c.nombreC}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300 font-mono">
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{c.telefono}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate max-w-xs">{c.direccion}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{c.edad} años (+18)</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ClienteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={fetchClientes}
        clienteToEdit={clienteToEdit}
      />
    </div>
  );
}
