from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    ## API REST para la gestión de inventario y clientes de la discoteca "LA BODEGA".
    
    ### Características principales:
    * **Autenticación:** Integrada con Supabase Auth (JWT Bearer tokens).
    * **Clientes:** Registro y control de clientes verificando mayoría de edad.
    * **Bebidas:** Gestión de catálogo y cartas de licores con subida de imágenes a Supabase Storage.
    * **Gaseosas:** Control de inventario de mezcladores y bebidas sin alcohol.
    * **Stock:** Control de existencias con **alerta automática de producto faltante**.
    """,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuración de CORS integrada
cors_origins = getattr(settings, "cors_origin_list", getattr(settings, "BACKEND_CORS_ORIGINS", []))

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in cors_origins] if cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rutas de la API v1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health Check"])
async def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "OK"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)