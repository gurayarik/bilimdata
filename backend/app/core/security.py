import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from .config import settings
from .supabase_client import get_supabase

bearer_scheme = HTTPBearer(auto_error=False)

# Supabase artık JWT'leri projeye özel asimetrik anahtarlarla (ES256) imzalıyor;
# doğrulama JWKS üzerinden yapılır (statik SUPABASE_JWT_SECRET yalnızca eski/legacy
# HS256 projeleri için fallback olarak tutuluyor).
_jwks_client = PyJWKClient(f"{settings.supabase_url}/auth/v1/.well-known/jwks.json")


class CurrentUser:
    def __init__(self, user_id: str, email: str | None, role: str):
        self.id = user_id
        self.email = email
        self.role = role


def _decode_token(token: str) -> dict:
    try:
        signing_key = _jwks_client.get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
            leeway=30,  # sunucu/backend arasındaki saat farkını tolere eder
        )
    except jwt.PyJWKClientError:
        # JWKS'te bulunamadı — eski (HS256) legacy secret ile dene.
        try:
            return jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
                leeway=30,
            )
        except jwt.PyJWTError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
            ) from exc
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        ) from exc


def _get_role(user_id: str) -> str:
    """Rol, JWT'de değil `profiles` tablosunda tutulur — JWT'ye custom claim
    eklemek için bir Supabase Auth Hook gerekir; v1'de basitçe DB'den okunuyor."""
    supabase = get_supabase()
    result = supabase.table("profiles").select("role").eq("id", user_id).execute()
    if not result.data:
        return "student"
    return result.data[0]["role"]


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser | None:
    if credentials is None:
        return None
    payload = _decode_token(credentials.credentials)
    user_id = payload["sub"]
    return CurrentUser(
        user_id=user_id,
        email=payload.get("email"),
        role=_get_role(user_id),
    )


async def get_current_user(
    user: CurrentUser | None = Depends(get_current_user_optional),
) -> CurrentUser:
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user


async def require_admin(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


async def require_instructor_or_admin(
    user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    if user.role not in ("instructor", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Instructor access required"
        )
    return user


def get_instructor_id_for_user(user_id: str) -> str | None:
    """Bu kullanıcıya (profiles.id) ait instructors.id'yi döner, yoksa None."""
    supabase = get_supabase()
    result = supabase.table("instructors").select("id").eq("profile_id", user_id).execute()
    if not result.data:
        return None
    return result.data[0]["id"]
