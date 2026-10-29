# 🍸 DISCOTECA "LA BODEGA" - SISTEMA INTEGRAL DE GESTIÓN

Sistema Full-Stack de alto rendimiento para el control de inventario, stock con alertas automáticas de reposición, catálogo de bebidas con almacenamiento de imágenes y registro de clientes VIP para la discoteca **"LA BODEGA"**.

---

## 🏛️ 1. Arquitectura Tecnológica

```
+-------------------------------------------------------------+
|                  FRONTEND (Next.js 14)                      |
|  - App Router & TypeScript                                   |
|  - Tailwind CSS (Nightclub Dark/Neon Aesthetic)              |
|  - Dashboard: Catálogo con Tarjetas Visuales + Alertas Live  |
+-------------------------------------------------------------+
                              │
                    REST API  │  Bearer JWT
                              ▼
+-------------------------------------------------------------+
|                  BACKEND (Python FastAPI)                   |
|  - Modelos y validaciones Pydantic                          |
|  - Seguridad y control CORS                                 |
|  - Endpoints CRUD modulares (Clientes, Bebidas, Stock)      |
|  - Servicio de integración con Supabase Storage             |
+-------------------------------------------------------------+
                              │
                    SDK / REST│  API Keys
                              ▼
+-------------------------------------------------------------+
|                     SERVICIOS SUPABASE                      |
|  - PostgreSQL Database (RLS + Triggers + Columnas Generadas)|
|  - Supabase Auth (Manejo de Sesiones & Tokens JWT)          |
|  - Supabase Storage (Bucket 'bebidas-images' para fotos)    |
+-------------------------------------------------------------+
```

---

## 📂 2. Estructura del Proyecto

```
LA BODEGA/
├── database/
│   └── schema.sql                # Script DDL completo para Supabase (Tablas, RLS, Storage)
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py       # Login y Registro con Supabase Auth
│   │   │   │   ├── bebidas.py    # CRUD Bebidas + Subida de imágenes a Supabase Storage
│   │   │   │   ├── clientes.py   # CRUD Clientes (+18 edad check)
│   │   │   │   ├── gaseosas.py   # CRUD Gaseosas y Mezcladores
│   │   │   │   └── stock.py      # Control de Stock con cálculo automático de faltante
│   │   │   └── api.py            # Enrutador consolidado v1
│   │   ├── core/
│   │   │   ├── config.py         # Configuración y variables Pydantic Settings
│   │   │   └── security.py       # Verificación de JWT Bearer tokens
│   │   ├── db/
│   │   │   └── supabase.py       # Cliente singleton de conexión a Supabase
│   │   ├── schemas/              # Modelos Pydantic (Request / Response)
│   │   ├── services/
│   │   │   └── storage.py        # Adaptador para Supabase Storage
│   │   └── main.py               # Aplicación FastAPI con CORS y Swagger Docs
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── bebidas/      # Catálogo con imágenes visuales en tarjetas
│   │   │   │   ├── clientes/     # Tabla de Clientes VIP
│   │   │   │   ├── gaseosas/     # Control de mezcladores
│   │   │   │   ├── stock/        # Alertas de stock crítico
│   │   │   │   ├── layout.tsx    # Shell con Sidebar y Navbar
│   │   │   │   └── page.tsx      # Dashboard general con métricas KPI
│   │   │   ├── globals.css       # Estilos Dark Nightclub
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx          # Login VIP
│   │   ├── components/           # Componentes modulares (BebidaCard, Modales, Stats)
│   │   ├── lib/                  # Clientes Axios y Supabase
│   │   └── types/                # Interfaces TypeScript
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
└── postman/
    └── La_Bodega_Postman_Collection.json   # Colección completa para pruebas inmediatas
```

---

## ⚡ 3. Puesta en Marcha Paso a Paso

### Paso 1: Configurar Supabase
1. Ingresa a tu panel en [supabase.com](https://supabase.com).
2. Ve al **SQL Editor** y ejecuta íntegramente el archivo [`database/schema.sql`](file:///e:/taller%20de%20programacion%20II/LA%20BODEGA/database/schema.sql).
3. Obtén tus credenciales desde **Project Settings > API**:
   - `Project URL`
   - `anon public key`
   - `service_role secret` (opcional para administración backend)
   - `JWT Secret`

### Paso 2: Iniciar el Backend (FastAPI)
```powershell
cd "backend"
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Configura tu archivo .env copiando .env.example
copy .env.example .env
# Edita .env con tus credenciales de Supabase

# Iniciar servidor
uvicorn app.main:app --reload --port 8000
```
* **Swagger UI:** `http://localhost:8000/docs`
* **Health Check:** `http://localhost:8000/`

### Paso 3: Iniciar el Frontend (Next.js)
```powershell
cd "frontend"
npm install
copy .env.example .env.local
# Iniciar servidor de desarrollo
npm run dev
```
* **Panel de Control:** `http://localhost:3000`
