from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from typing import Any, Dict
from ..models.voter import VoterCreate, VoterResponse, VoterUpdate
from ..services.database import get_database
from ..services.dependencies import get_staff # Use the guard

def calculate_age_from_cpr(cpr: str):
    try:
        cpr = str(cpr).strip().split('.')[0]
        cpr = cpr.zfill(9)
        if not cpr.isdigit() or len(cpr) != 9:
                return None

        yy = int(cpr[0:2])
        mm = int(cpr[2:4])
        dd = int(cpr[4:6])

        # --- FIX FOR 00 VALUES ---
        # If month is 00, default to January (01)
        if mm == 0: mm = 1
        # If day is 00, default to the 1st of the month (01)
        if dd == 0: dd = 1
        # -------------------------

        # 1. Determine the Century
        current_year_short = datetime.today().year % 100
        if yy > current_year_short:
            year = 1900 + yy
        else:
            year = 2000 + yy
        
        # 2. Validate and Create Date Object
        # Using a nested try to catch "31st of Feb" type errors after fixing 00s
        try:
            birth_date = datetime(year, mm, dd)
        except ValueError:
            # If still invalid (e.g., 31st of June), default to 1st of that month
            birth_date = datetime(year, mm, 1)

        today = datetime.today()

        # 3. Calculate Age
        has_had_birthday = (today.month, today.day) >= (birth_date.month, birth_date.day)
        age = today.year - birth_date.year - (0 if has_had_birthday else 1)
        
        return int(age)
    except Exception:
        return None


router = APIRouter(prefix="/api/staff", tags=["voter-management"])

@router.post("/register-voter", response_model=VoterResponse)
async def register_voter(voter_data: VoterCreate, db: Any = Depends(get_database)):
    existing = await db.voters.find_one({"VoterId": voter_data.voter_id})
    if existing:
        raise HTTPException(status_code=400, detail="الناخب مسجل بالفعل")

    doc = voter_data.model_dump(by_alias=True)
    doc["isEligible"] = True      # staff-created voters are eligible
    doc["hasVoted"] = False
    doc["created_at"] = datetime.now()

    result = await db.voters.insert_one(doc)
    doc["_id"] = result.inserted_id
    return VoterResponse.model_validate(doc)


@router.get("/voters", response_model=list[VoterResponse])
async def list_voters(db: Any = Depends(get_database)):
    voters = []
    async for v in db.voters.find({}).sort("created_at", -1):  # Sort newest first
        voters.append(VoterResponse.model_validate(v))
    return voters

@router.put("/voter/{voter_id}", response_model=VoterResponse)
async def update_voter(
    voter_id: str,
    payload: VoterUpdate,
    db: Any = Depends(get_database),
):
    existing = await db.voters.find_one({"VoterId": voter_id})
    if not existing:
        raise HTTPException(status_code=404, detail="الناخب غير موجود")

    # 1. Start with eligibility
    update_data = {"isEligible": True}

    # 2. Get all sent fields using their Aliases (VoterName, MembershipType, etc.)
    sent_data = payload.model_dump(exclude_unset=True, by_alias=True)
    update_data.update(sent_data)

    # 3. If CPR changed, check for duplicates and update Age
    if "VoterId" in update_data and update_data["VoterId"] != voter_id:
        dup = await db.voters.find_one({"VoterId": update_data["VoterId"]})
        if dup:
            raise HTTPException(status_code=409, detail="رقم الهوية مستخدم بالفعل")
        
        # Use your age function from earlier
        update_data["Age"] = calculate_age_from_cpr(update_data["VoterId"])

    # 4. Update
    await db.voters.update_one({"_id": existing["_id"]}, {"$set": update_data})
    
    updated = await db.voters.find_one({"_id": existing["_id"]})
    return updated

@router.get("/voter/{voter_id}", response_model=VoterResponse)
async def get_voter(voter_id: str, db: Any = Depends(get_database)):
    """
    Get single voter by VoterId - Used for edit forms
    """
    voter = await db.voters.find_one({"VoterId": voter_id})
    if not voter:
        raise HTTPException(status_code=404, detail="الناخب غير موجود")
    
    # Convert MongoDB document to Pydantic model
    voter_dict = dict(voter)
    return VoterResponse.model_validate(voter_dict)


    
@router.get("/results")
async def get_voting_results(
    db: Any = Depends(get_database),
    _voterMgmt: Dict = Depends(get_staff) # Guarded
):
    """Get voting statistics calculated from anonymous ballots"""
    # 1. Total votes from the anonymous 'votes' collection
       # 2. Total eligible voters from the 'voters' collection
    total_users = await db.voters.count_documents({})
    
    # 2. Total eligible voters from the 'voters' collection
    total_users_isEligible = await db.voters.count_documents({"isEligible": True})
    
    return {
        "total_users": total_users,
        "total_users_isEligible": total_users_isEligible,
    }

# router = APIRouter(prefix="/api/staff", tags=["voter-management"])
@router.get("/voters/listing")
async def get_voters_listing(
    db: Any = Depends(get_database) 
):
    try:
        all_voters = await db.voters.find().to_list(length=None)
        
        stats = {
            "total_all": len(all_voters),
            "total_eligible": sum(1 for v in all_voters if v.get("isEligible") == True and v.get("hasVoted") == False),
            "total_voted": sum(1 for v in all_voters if v.get("hasVoted") == True)
        }

        listing_query = {"isEligible": True, "hasVoted": False}
        eligible_to_vote_list = await db.voters.find(listing_query).to_list(length=None)

        # تحويل _id إلى string لمنع أخطاء JSON
        for v in eligible_to_vote_list:
            v["_id"] = str(v.get("_id"))

        return {
            "statistics": stats,
            "voters_list": eligible_to_vote_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/voters/check/{voter_id}")
async def check_voter_exists(
    voter_id: str, 
    db: Any = Depends(get_database),
    current_admin: dict = Depends(get_staff) # Optional: Protect the route
):
    # Important: Apply the same zfill(9) logic used in your import
    target_id = voter_id.strip().zfill(9)
    voter = await db.voters.find_one({"VoterId": target_id})
    
    return {"exists": True if voter else False}


