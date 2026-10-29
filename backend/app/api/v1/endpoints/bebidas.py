from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from app.schemas.bebida import BebidaCreate, BebidaUpdate, BebidaResponse
from app.db.supabase import get_supabase_client
from app.core.security import get_current_user, get_optional_user
from app.services.storage import upload_image_to_supabase

router = APIRouter(prefix="/bebidas", tags=["Bebidas"])

@router.get("", response_model=List[BebidaResponse], summary="Listar todas las bebidas")
async def list_bebidas(tipo: Optional[str] = None):
    """
    Obtiene el catálogo de bebidas de La Bodega.
    Permite filtrar opcionalmente por tipo (Ron, Whisky, Vodka, etc.).
    """
    try:
        client = get_supabase_client()
        query = client.table("bebidas").select("*")
        if tipo:
            query = query.ilike("tipo", f"%{tipo}%")
        response = query.order("nombre_b", desc=False).execute()
        
        # Enriquecer con flag de stock critico (< 5)
        bebidas = []
        for item in response.data:
            item["alerta_critica"] = item.get("cantidad", 0) <= 5
            bebidas.append(item)
            
        return bebidas
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener bebidas: {str(e)}"
        )

@router.get("/{bebida_id}", response_model=BebidaResponse, summary="Obtener detalle de bebida por ID")
async def get_bebida(bebida_id: str):
    try:
        client = get_supabase_client()
        response = client.table("bebidas").select("*").eq("id", bebida_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bebida no encontrada")
        data = response.data
        data["alerta_critica"] = data.get("cantidad", 0) <= 5
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Bebida no encontrada: {str(e)}")

@router.post("", response_model=BebidaResponse, status_code=status.HTTP_201_CREATED, summary="Crear nueva bebida")
async def create_bebida(data: BebidaCreate, current_user: dict = Depends(get_current_user)):
    """
    Registra una nueva bebida con su precio, cantidad inicial y URL de imagen de Supabase Storage.
    Requiere autenticación.
    """
    try:
        client = get_supabase_client()
        payload = {
            "nombre_b": data.nombre_b,
            "tipo": data.tipo,
            "cantidad": data.cantidad,
            "precio": data.precio,
            "imagen_url": data.imagen_url
        }
        response = client.table("bebidas").insert(payload).execute()
        if not response.data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se pudo registrar la bebida")
        
        created = response.data[0]
        created["alerta_critica"] = created.get("cantidad", 0) <= 5
        return created
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error al crear bebida: {str(e)}")

@router.post("/upload-image", summary="Subir imagen de bebida a Supabase Storage")
async def upload_bebida_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Sube un archivo de imagen al bucket de Supabase Storage ('bebidas-images')
    y retorna la URL pública lista para vincular a la entidad Bebida.
    """
    public_url = await upload_image_to_supabase(file, folder="catalogo")
    return {
        "message": "Imagen subida exitosamente a Supabase Storage",
        "imagen_url": public_url,
        "filename": file.filename
    }

@router.put("/{bebida_id}", response_model=BebidaResponse, summary="Actualizar bebida")
async def update_bebida(bebida_id: str, data: BebidaUpdate, current_user: dict = Depends(get_current_user)):
    try:
        client = get_supabase_client()
        update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items()}
        if not update_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se enviaron campos a actualizar")
            
        response = client.table("bebidas").update(update_data).eq("id", bebida_id).execute()
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bebida no encontrada")
            
        updated = response.data[0]
        updated["alerta_critica"] = updated.get("cantidad", 0) <= 5
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error al actualizar bebida: {str(e)}")

@router.delete("/{bebida_id}", summary="Eliminar bebida")
async def delete_bebida(bebida_id: str, current_user: dict = Depends(get_current_user)):
    try:
        client = get_supabase_client()
        response = client.table("bebidas").delete().eq("id", bebida_id).execute()
        return {"message": "Bebida eliminada correctamente", "id": bebida_id}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error al eliminar bebida: {str(e)}")
