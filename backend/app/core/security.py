from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings
from app.db.supabase import get_supabase_client

security_scheme = HTTPBearer(auto_error=False)

def verify_jwt_token(token: str) -> Dict[str, Any]:
    """
    Verifica el token JWT de Supabase Auth.
    Intenta validarlo con Supabase Client o decodificarlo usando SUPABASE_JWT_SECRET.
    """
    try:
        # Metodo 1: Validacion directa contra Supabase Auth API
        client = get_supabase_client()
        user_response = client.auth.get_user(token)
        if user_response and user_response.user:
            return {
                "id": user_response.user.id,
                "email": user_response.user.email,
                "role": user_response.user.role,
                "user_metadata": user_response.user.user_metadata,
            }
    except Exception:
        # Fallback a verificacion local con JWT Secret si está configurado
        pass

    if settings.SUPABASE_JWT_SECRET and settings.SUPABASE_JWT_SECRET != "your-supabase-jwt-secret":
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            return {
                "id": payload.get("sub"),
                "email": payload.get("email"),
                "role": payload.get("role", "authenticated"),
                "user_metadata": payload.get("user_metadata", {}),
            }
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token JWT inválido o expirado: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo autenticar el token Bearer con Supabase.",
        headers={"WWW-Authenticate": "Bearer"},
    )

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Dict[str, Any]:
    """
    Dependencia de FastAPI para proteger rutas. Exige un Bearer token valido.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Falta el encabezado Authorization con esquema Bearer.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return verify_jwt_token(credentials.credentials)

def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Optional[Dict[str, Any]]:
    """
    Dependencia opcional para rutas publicas que deseen personalizar respuesta si hay usuario.
    """
    if not credentials:
        return None
    try:
        return verify_jwt_token(credentials.credentials)
    except HTTPException:
        return None
