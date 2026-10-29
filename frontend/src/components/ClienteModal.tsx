"use client";

import React, { useState, useEffect } from "react";
import { Cliente } from "../types";
import { api } from "../lib/api";
import { X, Loader2, UserPlus } from "lucide-react";

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  clienteToEdit?: Cliente | null;
}

export default function ClienteModal({
  isOpen,
  onClose,
  onSave,
  clienteToEdit,
}: ClienteModalProps) {
  const [nombreC, setNombreC] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [edad, setEdad] = useState<number>(21);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (clienteToEdit) {
      setNombreC(clienteToEdit.nombre_c || clienteToEdit.nombreC || "");
      setTelefono(clienteToEdit.telefono || "");
      setDireccion(clienteToEdit.direccion || "");
      setEdad(clienteToEdit.edad || 21);
    } else {
      setNombreC("");
      setTelefono("");
      setDireccion("");
      setEdad(21);
    }
    setErrorMsg("");
  }, [clienteToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (edad < 18) {
      setErrorMsg("El cliente debe ser mayor de 18 años para ingresar a la discoteca.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");
      const payload: Partial<Cliente> = {
        nombre_c: nombreC.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        edad: Number(edad),
      };

      if (clienteToEdit) {
        await api.clientes.update(clienteToEdit.id, payload);
      } else {
        await api.clientes.create(payload);
      }

      onSave();
      onClose();
    } catch (err: any) {
      setErrorMsg("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121217] border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-lg text-zinc-100 flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-purple-400" />
            <span>{clienteToEdit ? "Editar Cliente" : "Registrar Cliente VIP"}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
              Nombre Completo (nombreC)
            </label>
            <input
              type="text"
              required
              value={nombreC}
              onChange={(e) => setNombreC(e.target.value)}
              placeholder="Ej: Sofía Morales"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                Teléfono / WhatsApp
              </label>
              <input
                type="text"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+591 70001122"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                Edad (Mín. 18)
              </label>
              <input
                type="number"
                min="18"
                max="120"
                required
                value={edad}
                onChange={(e) => setEdad(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
              Dirección de Contacto
            </label>
            <input
              type="text"
              required
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: Av. San Martín #200"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all flex items-center space-x-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{saving ? "Guardando..." : "Guardar Cliente"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
