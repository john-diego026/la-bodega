from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ClienteBase(BaseModel):
    nombre_c: str = Field(..., min_length=2, max_length=150, description="Nombre completo del cliente", serialization_alias="nombreC")
    telefono: str = Field(..., min_length=6, max_length=50, description="Número de teléfono de contacto")
    direccion: str = Field(..., min_length=3, description="Dirección de residencia o contacto")
    edad: int = Field(..., ge=18, le=120, description="Edad del cliente (debe ser mayor de edad para la discoteca)")

    class Config:
        populate_by_name = True

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    nombre_c: Optional[str] = Field(None, min_length=2, max_length=150, serialization_alias="nombreC")
    telefono: Optional[str] = Field(None, min_length=6, max_length=50)
    direccion: Optional[str] = Field(None, min_length=3)
    edad: Optional[int] = Field(None, ge=18, le=120)

    class Config:
        populate_by_name = True

class ClienteResponse(ClienteBase):
    id: str
    user_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        populate_by_name = True
