"use client";

import React, { useState, useEffect } from "react";
import { Bebida } from "../types";
import { api } from "../lib/api";
import { X, UploadCloud, Loader2, Image as ImageIcon } from "lucide-react";

interface BebidaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  bebidaToEdit?: Bebida | null;
}

const CATEGORIAS_LICORES = [
  "Ron",
  "Whisky",
  "Vodka",
  "Tequila",
  "Gin",
  "Cerveza",
  "Vino & Champagne",
  "Coctel Preparado",
  "Licor Especial",
];

export default function BebidaModal({
  isOpen,
  onClose,
  onSave,
  bebidaToEdit,
}: BebidaModalProps) {
  const [nombreB, setNombreB] = useState("");
  const [tipo, setTipo] = useState(CATEGORIAS_LICORES[0]);
  const [cantidad, setCantidad] = useState<number>(10);
  const [precio, setPrecio] = useState<number>(35.0);
  const [imagenUrl, setImagenUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (bebidaToEdit) {
      setNombreB(bebidaToEdit.nombre_b || bebidaToEdit.nombreB || "");
      setTipo(bebidaToEdit.tipo || CATEGORIAS_LICORES[0]);
      setCantidad(bebidaToEdit.cantidad || 0);
      setPrecio(bebidaToEdit.precio || 0);
      setImagenUrl(bebidaToEdit.imagen_url || "");
    } else {
      setNombreB("");
      setTipo(CATEGORIAS_LICORES[0]);
      setCantidad(10);
      setPrecio(35.0);
      setImagenUrl("");
    }
    setErrorMsg("");
  }, [bebidaToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setErrorMsg("");
      const result = await api.bebidas.uploadImage(file);
      setImagenUrl(result.imagen_url);
    } catch (err: any) {
      setErrorMsg("Error al subir imagen a Supabase Storage: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreB.trim()) {
      setErrorMsg("El nombre de la bebida es obligatorio.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");
      const payload: Partial<Bebida> = {
        nombre_b: nombreB.trim(),
        tipo,
        cantidad: Number(cantidad),
        precio: Number(precio),
        imagen_url: imagenUrl || undefined,
      };

      if (bebidaToEdit) {
        await api.bebidas.update(bebidaToEdit.id, payload);
      } else {
        await api.bebidas.create(payload);
      }

      onSave();
      onClose();
    } catch (err: any) {
      setErrorMsg("Error al guardar: " + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121217] border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl shadow-purple-900/20">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-lg text-zinc-100">
            {bebidaToEdit ? "Editar Bebida" : "Nueva Bebida para la Barra"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
              Nombre de la Bebida (nombreB)
            </label>
            <input
              type="text"
              required
              value={nombreB}
              onChange={(e) => setNombreB(e.target.value)}
              placeholder="Ej: Tequila Don Julio Reposado"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                Tipo / Categoría
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
              >
                {CATEGORIAS_LICORES.map((cat) => (
                  <option key={cat} value={cat} className="bg-zinc-900">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                Precio ($ USD)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                value={precio}
                onChange={(e) => setPrecio(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
              Cantidad en Stock
            </label>
            <input
              type="number"
              min="0"
              required
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
            />
            {cantidad <= 5 && (
              <p className="text-[11px] text-amber-400 mt-1">
                ⚠️ Alerta: Cantidad baja (≤ 5 activará advertencia de stock crítico).
              </p>
            )}
          </div>

          {/* Upload Image with Supabase Storage */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
              Imagen de la Bebida (Supabase Storage)
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden flex items-center justify-center shrink-0">
                {imagenUrl ? (
                  <img src={imagenUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-zinc-600" />
                )}
              </div>

              <div className="flex-1">
                <label className="cursor-pointer flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800/80 transition-colors text-xs text-zinc-300 font-medium">
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      <span>Subiendo a Supabase Storage...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 text-purple-400" />
                      <span>Seleccionar imagen (.jpg, .png, .webp)</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                {imagenUrl && (
                  <p className="text-[10px] text-zinc-500 truncate mt-1">
                    URL: {imagenUrl}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
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
              disabled={saving || uploadingImage}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{saving ? "Guardando..." : "Guardar Bebida"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
