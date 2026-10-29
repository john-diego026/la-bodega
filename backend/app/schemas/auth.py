from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None
    role: Optional[str] = "bartender" # bartender, admin, mesero

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: Optional[int] = 3600
    refresh_token: Optional[str] = None
    user: Dict[str, Any]

class UserProfile(BaseModel):
    id: str
    email: str
    role: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
