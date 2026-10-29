"use client";

import React from "react";
import { Bebida } from "../types";
import { Wine, AlertCircle, Edit, Trash2, DollarSign } from "lucide-react";

interface BebidaCardProps {
  bebida: Bebida;
  onEdit: (bebida: Bebida) => void;
  onDelete: (id: string) => void;
}

export default function BebidaCard({ bebida, onEdit, onDelete }: BebidaCardProps) {
  const isCritical = bebida.cantidad <= 5;
  const nombre = bebida.nombre_b || bebida.nombreB || "Sin nombre";

  return (
    <div className="group relative bg-[#131318] border border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col justify-between">
      {/* Imagen & Badges */}
      <div className="relative h-48 w-full bg-zinc-950 overflow-hidden">
        {bebida.imagen_url ? (
          <img
            src={bebida.imagen_url}
            alt={nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Fallback si la imagen no carga
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-900/50">
            <Wine className="w-12 h-12 mb-2 stroke-1 text-zinc-700" />
            <span className="text-xs font-mono">Sin imagen cargada</span>
          </div>
        )}

        {/* Tipo de Bebida Badge */}
        <span className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md text-purple-300 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-purple-500/30">
          {bebida.tipo}
        </span>

        {/* Alerta de Stock Crítico */}
        {isCritical && (
          <span className="absolute top-3 right-3 bg-rose-950/90 backdrop-blur-md text-rose-300 text-[11px] font-bold px-2.5 py-1 rounded-full border border-rose-500/50 flex items-center space-x-1 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>STOCK CRÍTICO</span>
          </span>
        )}
      </div>

      {/* Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-lg text-zinc-100 group-hover:text-purple-300 transition-colors line-clamp-1">
            {nombre}
          </h4>

          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1 text-emerald-400 font-bold text-lg">
              <span className="text-xs text-emerald-500 font-normal">$</span>
              <span>{Number(bebida.precio).toFixed(2)}</span>
            </div>

            <div className="flex items-center space-x-1.5 font-mono text-xs">
              <span className="text-zinc-400">Stock:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-md ${
                  isCritical
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-zinc-800 text-zinc-200"
                }`}
              >
                {bebida.cantidad} un.
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-end space-x-2">
          <button
            onClick={() => onEdit(bebida)}
            className="p-2 rounded-xl text-zinc-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors border border-transparent hover:border-purple-500/20"
            title="Editar bebida"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(bebida.id)}
            className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
            title="Eliminar bebida"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
