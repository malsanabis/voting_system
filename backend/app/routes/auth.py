from fastapi import APIRouter, HTTPException, Depends
import hashlib
from typing import Any

from ..models.admin import AdminLogin
from ..models.voterMangment import VoterManagementLogin
from ..models.voter import VoterLogin
from ..services.database import get_database
from ..services.jwt_handler import create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# --- 1. ADMIN LOGIN ---
@router.post("/login/admin")
async def login_admin(credentials: AdminLogin, db: Any = Depends(get_database)):
    admin = await db.admin.find_one({"username": credentials.username})
    if not admin or admin["password"] != hash_password(credentials.password):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    token = create_access_token(data={"sub": str(admin["_id"]), "role": "admin"})
    return {"access_token": token, "token_type": "bearer", "role": "admin"}

# --- 2. VOTER MANAGEMENT LOGIN ---
@router.post("/login/staff")
async def login_staff(credentials: VoterManagementLogin, db: Any = Depends(get_database)):
    voter_mngmt = await db.voter_mangment.find_one({"username": credentials.username})
    if not voter_mngmt or voter_mngmt["password"] != hash_password(credentials.password):
        raise HTTPException(status_code=401, detail="Invalid staff credentials")
    
    token = create_access_token(data={"sub": str(voter_mngmt["_id"]), "role": "staff"})
    return {"access_token": token, "token_type": "bearer", "role": "staff"}



# --- VOTER LOGIN (Separate Logic) ---
@router.post("/login/voter")
async def login_voter(credentials: VoterLogin, db: Any = Depends(get_database)):
    # Voters use 'VoterId' (alias for username in the model)
    voter = await db.voters.find_one({"VoterId": credentials.voter_id})

    # 1. التحقق من وجود الناخب (طلبك)
    if not voter:
        raise HTTPException(status_code=403, detail="أنت غير مسجل")
    
    if not voter.get("isEligible", False):
        raise HTTPException(status_code=403, detail="أنت غير مسجل في كشوفات الناخبين")

    if voter.get("hasVoted", False):
        raise HTTPException(status_code=403, detail="لقد قمت بالتصويت مسبقاً. شكراً لمشاركتك!")

    token = create_access_token(data={"sub": str(voter["_id"]), "role": "voter"})
    return {"access_token": token, "token_type": "bearer", "role": "voter"}