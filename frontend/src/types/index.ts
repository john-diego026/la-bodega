export interface Cliente {
  id: string;
  nombre_c: string;
  nombreC?: string;
  telefono: string;
  direccion: string;
  edad: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Bebida {
  id: string;
  nombre_b: string;
  nombreB?: string;
  tipo: string;
  cantidad: number;
  precio: number;
  imagen_url?: string;
  alerta_critica?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Gaseosa {
  id: string;
  nombre_g: string;
  nombreG?: string;
  cantidad: number;
  alerta_critica?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StockItem {
  id: string;
  bebida_id?: string | null;
  gaseosa_id?: string | null;
  cerveza?: string | null;
  cantidad: number;
  umbral_minimo: number;
  alerta_producto_faltante: boolean;
  updated_at?: string;
}

export interface ItemCritico {
  id: string;
  tipo: string;
  nombre: string;
  cantidad: number;
  umbral: number;
}

export interface ResumenStockGeneral {
  total_bebidas: number;
  total_gaseosas: number;
  total_alertas: number;
  items_criticos: ItemCritico[];
}

export interface UserSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
      role?: string;
    };
  };
}
