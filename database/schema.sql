-- ==============================================================================
-- DISCOTECA "LA BODEGA" - ESQUEMA DE BASE DE DATOS Y STORAGE (SUPABASE POSTGRESQL)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: CLIENTES
-- Entidad: (nombreC, telefono, direccion, edad)
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_c VARCHAR(150) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    direccion TEXT NOT NULL,
    edad INT NOT NULL CHECK (edad >= 18), -- Control de mayoría de edad para discoteca
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABLA: BEBIDAS
-- Entidad: (nombreB, tipo, cantidad, precio, imagen_url)
CREATE TABLE IF NOT EXISTS public.bebidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_b VARCHAR(150) NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL, -- Ej: Ron, Whisky, Vodka, Tequila, Gin, Cerveza, Coctel
    cantidad INT NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    imagen_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABLA: GASEOSAS
-- Entidad: (nombreG, cantidad)
CREATE TABLE IF NOT EXISTS public.gaseosas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_g VARCHAR(150) NOT NULL UNIQUE,
    cantidad INT NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. TABLA: STOCK
-- Entidad: (bebida, gaseosa, cerveza, alerta_producto_faltante [lógica automática si baja de cierto límite])
CREATE TABLE IF NOT EXISTS public.stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bebida_id UUID REFERENCES public.bebidas(id) ON DELETE CASCADE,
    gaseosa_id UUID REFERENCES public.gaseosas(id) ON DELETE CASCADE,
    cerveza VARCHAR(100), -- Nombre o descripción del lote de cerveza
    cantidad INT NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
    umbral_minimo INT NOT NULL DEFAULT 10 CHECK (umbral_minimo >= 0),
    -- Columna computada persistente que calcula la alerta automática
    alerta_producto_faltante BOOLEAN GENERATED ALWAYS AS (cantidad <= umbral_minimo) STORED,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. TRIGGER PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_clientes_updated_at
BEFORE UPDATE ON public.clientes
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER tr_bebidas_updated_at
BEFORE UPDATE ON public.bebidas
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER tr_gaseosas_updated_at
BEFORE UPDATE ON public.gaseosas
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER tr_stock_updated_at
BEFORE UPDATE ON public.stock
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. VISTA GENERAL DE STOCK CON DETALLES DE PRODUCTOS
CREATE OR REPLACE VIEW public.vw_stock_general AS
SELECT 
    s.id AS stock_id,
    s.cantidad,
    s.umbral_minimo,
    s.alerta_producto_faltante,
    s.cerveza,
    b.id AS bebida_id,
    b.nombre_b AS bebida_nombre,
    b.tipo AS bebida_tipo,
    b.precio AS bebida_precio,
    b.imagen_url AS bebida_imagen,
    g.id AS gaseosa_id,
    g.nombre_g AS gaseosa_nombre,
    s.updated_at
FROM public.stock s
LEFT JOIN public.bebidas b ON s.bebida_id = b.id
LEFT JOIN public.gaseosas g ON s.gaseosa_id = g.id;

-- 8. SEGURIDAD: ROW LEVEL SECURITY (RLS)
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bebidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gaseosas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura y escritura para usuarios autenticados
CREATE POLICY "Permitir lectura general a autenticados en clientes"
ON public.clientes FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Permitir insercion y modificacion a autenticados en clientes"
ON public.clientes FOR ALL
TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir lectura general de bebidas"
ON public.bebidas FOR SELECT
TO authenticated, anon USING (true);

CREATE POLICY "Permitir gestion total de bebidas a autenticados"
ON public.bebidas FOR ALL
TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir lectura general de gaseosas"
ON public.gaseosas FOR SELECT
TO authenticated, anon USING (true);

CREATE POLICY "Permitir gestion total de gaseosas a autenticados"
ON public.gaseosas FOR ALL
TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir lectura de stock"
ON public.stock FOR SELECT
TO authenticated, anon USING (true);

CREATE POLICY "Permitir gestion de stock a autenticados"
ON public.stock FOR ALL
TO authenticated USING (true) WITH CHECK (true);

-- 9. CONFIGURACIÓN DE STORAGE EN SUPABASE (BUCKET: 'bebidas-images')
-- Nota: En Supabase, esto también puede crearse visualmente desde el panel 'Storage'.
INSERT INTO storage.buckets (id, name, public)
VALUES ('bebidas-images', 'bebidas-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acceso para el Bucket de imágenes de bebidas
CREATE POLICY "Acceso publico de lectura a imagenes de bebidas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'bebidas-images');

CREATE POLICY "Permitir subida de imagenes a usuarios autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bebidas-images');

CREATE POLICY "Permitir actualizacion y borrado de imagenes a autenticados"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'bebidas-images');

CREATE POLICY "Permitir borrado de imagenes a autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'bebidas-images');

-- 10. DATOS SEMILLA (SEED DATA PARA PRUEBAS INICIALES)
INSERT INTO public.bebidas (nombre_b, tipo, cantidad, precio, imagen_url)
VALUES 
('Ron Havana Club 7 Años', 'Ron', 25, 45.00, 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80'),
('Whisky Johnnie Walker Black Label', 'Whisky', 18, 65.00, 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=600&q=80'),
('Vodka Absolut Original', 'Vodka', 8, 38.00, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'),
('Tequila Don Julio Reposado', 'Tequila', 4, 85.00, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80'),
('Cerveza Corona Extra 355ml', 'Cerveza', 6, 5.00, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=600&q=80')
ON CONFLICT (nombre_b) DO NOTHING;

INSERT INTO public.gaseosas (nombre_g, cantidad)
VALUES 
('Coca Cola Original 300ml', 40),
('Coca Cola Zero 300ml', 25),
('Sprite 300ml', 15),
('Agua Tónica Britvic', 6),
('Red Bull Energy Drink 250ml', 8)
ON CONFLICT (nombre_g) DO NOTHING;

INSERT INTO public.clientes (nombre_c, telefono, direccion, edad)
VALUES
('Carlos Mendoza', '+591 70011223', 'Av. San Martín #450', 26),
('Valeria Rivas', '+591 71233445', 'Calle Las Palmas #12', 22),
('Mateo Fernández', '+591 78990011', 'Equipetrol Norte Calle 7', 31);
