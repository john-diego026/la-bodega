from fastapi import APIRouter
from app.api.v1.endpoints import auth, clientes, bebidas, gaseosas, stock

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(clientes.router)
api_router.include_router(bebidas.router)
api_router.include_router(gaseosas.router)
api_router.include_router(stock.router)
