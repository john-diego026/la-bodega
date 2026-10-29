from supabase import create_client, Client
from app.core.config import settings

def get_supabase_client() -> Client:
    """
    Retorna una instancia singleton o cliente de Supabase usando
    la URL y la Key configurada en las variables de entorno.
    Si se provee la Service Role Key, se le da prioridad para tareas administrativas.
    """
    key = settings.SUPABASE_SERVICE_ROLE_KEY if settings.SUPABASE_SERVICE_ROLE_KEY else settings.SUPABASE_KEY
    if not settings.SUPABASE_URL or not key:
        raise ValueError("SUPABASE_URL y SUPABASE_KEY deben estar configurados en el archivo .env")
    
    return create_client(settings.SUPABASE_URL, key)

supabase_client: Client = None

try:
    supabase_client = get_supabase_client()
except Exception as e:
    # Permitir inicio aun en fase de configuracion previa
    print(f"[Supabase Warning] No se pudo inicializar el cliente inmediatamente: {e}")
