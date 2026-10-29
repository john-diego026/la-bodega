from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class BebidaBase(BaseModel):
    nombre_b: str = Field(..., min_length=2, max_length=150, description="Nombre de la bebida", serialization_alias="nombreB")
    tipo: str = Field(..., min_length=2, max_length=50, description="Categoría o tipo de licor (Ron, Whisky, Vodka, Cerveza, etc.)")
    cantidad: int = Field(..., ge=0, description="Cantidad disponible en inventario")
    precio: float = Field(..., ge=0.0, description="Precio unitario de venta")
    imagen_url: Optional[str] = Field(None, description="URL pública de la imagen en Supabase Storage")

    class Config:
        populate_by_name = True

class BebidaCreate(BebidaBase):
    pass

class BebidaUpdate(BaseModel):
    nombre_b: Optional[str] = Field(None, min_length=2, max_length=150, serialization_alias="nombreB")
    tipo: Optional[str] = Field(None, min_length=2, max_length=50)
    cantidad: Optional[int] = Field(None, ge=0)
    precio: Optional[float] = Field(None, ge=0.0)
    imagen_url: Optional[str] = None

    class Config:
        populate_by_name = True

class BebidaResponse(BebidaBase):
    id: str
    alerta_critica: Optional[bool] = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        populate_by_name = True
