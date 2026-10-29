from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserProfile
from app.db.supabase import get_supabase_client
from app.core.security import get_current_user

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/login", response_model=TokenResponse, summary="Iniciar sesión con Supabase Auth")
async def login(credentials: LoginRequest):
    """
    Inicia sesión de usuario en Supabase Auth y retorna el JWT Bearer Token.
    """
    try:
        client = get_supabase_client()
        res = client.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if not res.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas"
            )
            
        return TokenResponse(
            access_token=res.session.access_token,
            token_type="bearer",
            expires_in=res.session.expires_in,
            refresh_token=res.session.refresh_token,
            user={
                "id": res.user.id,
                "email": res.user.email,
                "user_metadata": res.user.user_metadata
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fallo en la autenticación: {str(e)}"
        )

@router.post("/register", summary="Registrar nuevo usuario/empleado")
async def register(data: RegisterRequest):
    """
    Registra un nuevo usuario en Supabase Auth con metadatos de rol.
    """
    try:
        client = get_supabase_client()
        res = client.auth.sign_up({
            "email": data.email,
            "password": data.password,
            "options": {
                "data": {
                    "full_name": data.full_name or "",
                    "role": data.role or "bartender"
                }
            }
        })
        
        return {
            "message": "Usuario registrado exitosamente. Verifique su correo si la confirmación está activa.",
            "user_id": res.user.id if res.user else None,
            "email": res.user.email if res.user else data.email
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error en el registro: {str(e)}"
        )

@router.get("/me", response_model=UserProfile, summary="Obtener perfil del usuario autenticado")
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Retorna los datos del usuario correspondiente al Bearer Token enviado.
    """
    return UserProfile(
        id=current_user["id"],
        email=current_user["email"],
        role=current_user.get("role"),
        metadata=current_user.get("user_metadata")
    )
