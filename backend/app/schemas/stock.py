from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class StockBase(BaseModel):
    bebida_id: Optional[str] = Field(None, description="ID de la bebida vinculada")
    gaseosa_id: Optional[str] = Field(None, description="ID de la gaseosa vinculada")
    cerveza: Optional[str] = Field(None, description="Nombre o marca de cerveza")
    cantidad: int = Field(..., ge=0, description="Cantidad en existencia")
    umbral_minimo: int = Field(10, ge=0, description="Nivel mínimo antes de disparar alerta de faltante")

class StockCreate(StockBase):
    pass

class StockUpdate(BaseModel):
    bebida_id: Optional[str] = None
    gaseosa_id: Optional[str] = None
    cerveza: Optional[str] = None
    cantidad: Optional[int] = Field(None, ge=0)
    umbral_minimo: Optional[int] = Field(None, ge=0)

class StockResponse(StockBase):
    id: str
    alerta_producto_faltante: bool = Field(..., description="Flag booleano automático si cantidad <= umbral_minimo")
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ResumenStockGeneral(BaseModel):
    total_bebidas: int
    total_gaseosas: int
    total_alertas: int
    items_criticos: list
