from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteResponse
from app.db.supabase import get_supabase_client
from app.core.security import get_current_user

router = APIRouter(prefix="/clientes", tags=["Clientes"])

@router.get("", response_model=List[ClienteResponse], summary="Listar todos los clientes")
async def list_clientes(current_user: dict = Depends(get_current_user)):
    """
    Obtiene la lista de clientes registrados en La Bodega. Requiere autenticación.
    """
    try:
        client = get_supabase_client()
        response = client.table("clientes").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener clientes: {str(e)}"
        )

@router.get("/{cliente_id}", response_model=ClienteResponse, summary="Obtener cliente por ID")
async def get_cliente(cliente_id: str, current_user: dict = Depends(get_current_user)):
    try:
        client = get_supabase_client()
        response = client.table("clientes").select("*").eq("id", cliente_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente no encontrado")
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Cliente no encontrado: {str(e)}")

@router.post("", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED, summary="Registrar nuevo cliente")
async def create_cliente(data: ClienteCreate, current_user: dict = Depends(get_current_user)):
    """
    Registra un cliente validando mayoría de edad (edad >= 18).
    """
    try:
        client = get_supabase_client()
        payload = {
            "nombre_c": data.nombre_c,
            "telefono": data.telefono,
            "direccion": data.direccion,
            "edad": data.edad,
            "user_id": current_user["id"]
        }
        response = client.table("clientes").insert(payload).execute()
        if not response.data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se pudo registrar el cliente")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error al crear cliente: {str(e)}")

@router.put("/{cliente_id}", response_model=ClienteResponse, summary="Actualizar cliente")
async def update_cliente(cliente_id: str, data: ClienteUpdate, current_user: dict = Depends(get_current_user)):
    try:
        client = get_supabase_client()
        update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items()}
        if not update_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se enviaron datos para actualizar")
            
        response = client.table("clientes").update(update_data).eq("id", cliente_id).execute()
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente no encontrado")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error al actualizar cliente: {str(e)}")

@router.delete("/{cliente_id}", summary="Eliminar cliente")
async def delete_cliente(cliente_id: str, current_user: dict = Depends(get_current_user)):
    try:
        client = get_supabase_client()
        response = client.table("clientes").delete().eq("id", cliente_id).execute()
        return {"message": "Cliente eliminado con éxito", "id": cliente_id}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error al eliminar cliente: {str(e)}")
