from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class GaseosaBase(BaseModel):
    nombre_g: str = Field(..., min_length=2, max_length=150, description="Nombre de la gaseosa o mezclador", serialization_alias="nombreG")
    cantidad: int = Field(..., ge=0, description="Cantidad disponible en stock")

    class Config:
        populate_by_name = True

class GaseosaCreate(GaseosaBase):
    pass

class GaseosaUpdate(BaseModel):
    nombre_g: Optional[str] = Field(None, min_length=2, max_length=150, serialization_alias="nombreG")
    cantidad: Optional[int] = Field(None, ge=0)

    class Config:
        populate_by_name = True

class GaseosaResponse(GaseosaBase):
    id: str
    alerta_critica: Optional[bool] = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        populate_by_name = True
