from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.gaseosa import GaseosaCreate, GaseosaUpdate, GaseosaResponse
from app.db.supabase import get_supabase_client
from app.core.security import get_current_user

router = APIRouter(prefix="/gaseosas", tags=["Gaseosas"])

@router.get("", response_model=List[GaseosaResponse], summary="Listar todas las gaseosas / mezcladores")
async def list_gaseosas():
    """
    Obtiene la lista de gaseosas y mezcladores disponibles en inventario.
    """
    try:
        client = get_supabase_client()
        response = client.table("gaseosas").select("*").order("nombre_g", desc=False).execute()
        
        items = []
        for g in response.data:
            g["alerta_critica"] = g.get("cantidad", 0) <= 8
            items.append(g)
            
        return items
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener gaseosas: {str(e)}"
        )

@router.get("/{gaseosa_id}", response_model=GaseosaResponse, summary="Obtener gaseosa por ID")
async def get_gaseosa(gaseosa_id: str):
    try:
        client = get_supabase_client()
        response = client.table("gaseosas").select("*").eq("id", gaseosa_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gaseosa no encontrada")
        data = response.data
        data["alerta_critica"] = data.get("cantidad", 0) <= 8
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Gaseosa no encontrada: {str(e)}")

@router.post("", response_model=GaseosaResponse, status_code=status.HTTP_201_CREATED, summary="Registrar nueva gaseosa")
async def create_gaseosa(data: GaseosaCreate, current_user: dict = Depends(get_current_user)):
    try:
        client = get_supabase_client()
        payload = {
            "nombre_g": data.nombre_g,
            "cantidad": data.cantidad
        }
        response = client.table("gaseosas").insert(payload).execute()
        if not response.data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se pudo registrar la gaseosa")
        created = response.data[0]
        created["alerta_critica"] = created.get("cantidad", 0) <= 8
        return created
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error al crear gaseosa: {str(e)}")

@router.put("/{gaseosa_id}", response_model=GaseosaResponse, summary="Actualizar cantidad o nombre de gaseosa")
async def update_gaseosa(gaseosa_id: str, data: GaseosaUpdate, current_user: dict = Depends(get_current_user)):
    try:
        client = get_supabase_client()
        update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items()}
        if not update_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se enviaron datos para actualizar")
            
        response = client.table("gaseosas").update(update_data).eq("id", gaseosa_id).execute()
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gaseosa no encontrada")
            
        updated = response.data[0]
        updated["alerta_critica"] = updated.get("cantidad", 0) <= 8
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error al actualizar gaseosa: {str(e)}")

@router.delete("/{gaseosa_id}", summary="Eliminar gaseosa")
async def delete_gaseosa(gaseosa_id: str, current_user: dict = Depends(get_current_user)):
    try:
        client = get_supabase_client()
        response = client.table("gaseosas").delete().eq("id", gaseosa_id).execute()
        return {"message": "Gaseosa eliminada correctamente", "id": gaseosa_id}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error al eliminar gaseosa: {str(e)}")
