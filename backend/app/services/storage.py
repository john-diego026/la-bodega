import uuid
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings
from app.db.supabase import get_supabase_client

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

async def upload_image_to_supabase(file: UploadFile, folder: str = "bebidas") -> str:
    """
    Sube un archivo de imagen al bucket de Supabase Storage especificado
    y devuelve la URL pública resultante.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no permitido. Tipos permitidos: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )
    
    # Generar nombre unico para evitar colisiones
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{folder}/{uuid.uuid4().hex}.{ext}"
    
    try:
        file_bytes = await file.read()
        client = get_supabase_client()
        
        # Subir al bucket configurado
        bucket_name = settings.STORAGE_BUCKET_NAME
        response = client.storage.from_(bucket_name).upload(
            path=unique_filename,
            file=file_bytes,
            file_options={"content-type": file.content_type, "upsert": "true"}
        )
        
        # Obtener la URL publica de la imagen
        public_url = client.storage.from_(bucket_name).get_public_url(unique_filename)
        return public_url
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir imagen a Supabase Storage: {str(e)}"
        )
