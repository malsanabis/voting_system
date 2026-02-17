from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from ..services.database import get_database
from .jwt_handler import verify_token
from typing import Dict,Any

# This tells FastAPI where to look for the token (the 'Authorize' button in Swagger)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login/admin")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict:
    """Decodes the token and returns the payload (sub and role)"""
    return verify_token(token)

def require_role(allowed_roles: list):
    """Factory function to check for specific roles"""
    def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="ليس لديك صلاحية الوصول لهذا المورد"
            )
        return current_user
    return role_checker

# Helper shortcuts
get_admin = require_role(["admin"])
get_staff = require_role(["staff"])
get_voter = require_role(["voter"])


async def check_election_status(db: Any = Depends(get_database)):
    """Fetch the global election state from DB"""
    status = await db.settings.find_one({"_id": "election_state"})
    if not status:
        # Default if not set
        return {"is_locked": False, "is_open": False}
    return status

def prevent_if_locked():
    """Stop Admin/Staff from editing candidates if election started"""
    async def checker(status: dict = Depends(check_election_status)):
        if status.get("is_locked"):
            raise HTTPException(
                status_code=403, 
                detail="المخطط مقفل حالياً - لا يمكن التعديل أثناء الانتخابات"
            )
    return Depends(checker)

def prevent_if_closed():
    """Stop Voters from voting if election is not active"""
    async def checker(status: dict = Depends(check_election_status)):
        if not status.get("is_open"):
            raise HTTPException(
                status_code=403, 
                detail="التصويت مغلق حالياً"
            )
    return Depends(checker)