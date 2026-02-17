from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from typing import  Dict, Any, List
from datetime import datetime, timezone
import hashlib
from ..models.voterMangment import VoterManagementResponse , VoterManagementCreate , VoterManagementUpdate

from ..models.candidate import AdminCandidateOut, CandidateBase, CandidateCreate, CandidateUpdate, CandidateResponse
from ..services.database import get_database
from ..services.dependencies import get_admin # Use the guard we made


from ..models.settings import SystemSettings

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/results")
async def get_voting_results(
    db: Any = Depends(get_database),
    _admin: Dict = Depends(get_admin)
):
    # 1. Basic Counts
    total_users = await db.voters.count_documents({"isEligible": True})
    total_users2 = await db.voters.count_documents({})
    total_candidates = await db.candidates.count_documents({})
    total_votes = await db.votes.count_documents({})

 # --- Step 1: Get Valid Candidate IDs ---
    all_candidates = await db.candidates.find({}).to_list(None)
    valid_ids = {str(c["_id"]) for c in all_candidates}
    valid_ids_list = list(valid_ids)

    # --- Step 2: Aggregation for Document-Level Logic ---
    pipeline = [
        {
            "$project": {
                # 1. Fully Valid: All choices are valid candidates
                "is_fully_valid": {
                    "$allElementsTrue": {
                        "$map": {
                            "input": "$choices",
                            "as": "c",
                            "in": { "$in": ["$$c.candidate_Id", valid_ids_list] }
                        }
                    }
                },
                # 2. Partially Valid: At least one choice is a valid candidate
                "is_partially_valid": {
                    "$anyElementTrue": {
                        "$map": {
                            "input": "$choices",
                            "as": "c",
                            "in": { "$in": ["$$c.candidate_Id", valid_ids_list] }
                        }
                    }
                },
                # 3. Fully Invalid: No choices are valid candidates
                "is_fully_invalid": {
                    "$allElementsTrue": {
                        "$map": {
                            "input": "$choices",
                            "as": "c",
                            "in": { "$not": [{ "$in": ["$$c.candidate_Id", valid_ids_list] }] }
                        }
                    }
                }
            }
        }
    ]
    
    ballots = await db.votes.aggregate(pipeline).to_list(None)
    
    # We use "partially valid" as our primary "Valid Vote" count 
    # because it means the user made at least one real choice.
    count_valid = sum(1 for b in ballots if b["is_fully_valid"])
    count_valid_partially = sum(1 for b in ballots if b["is_partially_valid"])
    count_invalid = sum(1 for b in ballots if b["is_fully_invalid"])

    # --- Step 3: Candidate Vote Tally (Remains the same) ---
    pipeline_tally = [
        {"$unwind": "$choices"},
        {"$group": {"_id": "$choices.candidate_Id", "count": {"$sum": 1}}}
    ]
    tally_cursor = await db.votes.aggregate(pipeline_tally).to_list(None)
    vote_map = {str(item["_id"]): item["count"] for item in tally_cursor if item["_id"]}

    # --- Step 4: Format Candidates ---
    candidates_with_votes = []
    for cand in all_candidates:
        cid = str(cand["_id"])
        candidates_with_votes.append({
            "id": cid,
            "name": cand.get("full_Name") or cand.get("full_name") or "Unknown",
            "position_name": cand.get("positionName") or "غير محدد",
            "position_status": cand.get("positionStatus") or "elected",
            "votes": vote_map.get(cid, 0)
        })

    return {
        "total_users": total_users,
        "total_users2": total_users2,
        "total_votes": count_valid,  # "صوت صحيح"
        "total_votes_all": total_votes,
         "total_partially_votes": count_valid_partially,  # "صوت صحيح"
        "invalid_votes": count_invalid, # "صوت ملغى"
        "total_candidates": total_candidates,
        "candidates_with_votes": candidates_with_votes,
    }



@router.get("/voter-list-report")
async def get_voted_voters_list(
    db: Any = Depends(get_database),
    _admin: Dict = Depends(get_admin)
):
    """جلب قائمة الناخبين الذين أتموا التصويت بنجاح"""
    
    # البحث عن الناخبين الذين لديهم hasVoted = True
    cursor = db.voters.find({"hasVoted": True})
    voters_data = await cursor.to_list(None)
    
    voters_list = []
    for voter in voters_data:
        voters_list.append({
            "full_name": voter.get("VoterName"),
            "membership_type": voter.get("MembershipType", "عضوية ناقصة"),
        })

    return {
        "count": len(voters_list),
        "voters": voters_list
    }


@router.post("/candidates/create", response_model=AdminCandidateOut)
async def create_candidate(
    candidate_in: CandidateCreate, # نستخدم كائن واحد فقط
    db: Any = Depends(get_database),
    current_admin: dict = Depends(get_admin)
):
    # 1. تحويل البيانات إلى Dictionary مع استخدام الـ Aliases (مثل positionName)
    candidate_data = candidate_in.model_dump(by_alias=True)
    pos_name = candidate_data["positionName"]
    # 2. حساب عدد المرشحين لنفس المنصب لتحديد الحالة (single/multiple)
    position_count = await db.candidates.count_documents({
        "positionName": candidate_data["positionName"]
    })
    
    # 3. تحديث الحالة وإضافة التوقيت
    candidate_data["positionStatus"] = "multiple" if position_count > 0 else "single"
    candidate_data["created_at"] = datetime.now()

    # THE SYNC STEP: 
    # If this is the 2nd person (position_count == 1), 
    # we MUST update the 1st person from "single" to "multiple".
    if position_count > 0:
        await db.candidates.update_many(
            {"positionName": pos_name},
            {"$set": {"positionStatus": "multiple"}}
        )
    
    # 4. الحفظ في قاعدة البيانات
    result = await db.candidates.insert_one(candidate_data)
    
    # 5. إضافة الـ ID العائد للكائن لإرجاعه للمتصفح
    candidate_data["_id"] = str(result.inserted_id)
    
    return candidate_data


@router.delete("/candidates/delete/{candidate_id}")
async def delete_candidate(
    candidate_id: str, 
    db: Any = Depends(get_database),
    current_admin: dict = Depends(get_admin)
):
    # 1. Get candidate to know their position before they are gone
    candidate = await db.candidates.find_one({"_id": ObjectId(candidate_id)})
    if not candidate:
        raise HTTPException(status_code=404, detail="المرشح غير موجود")
    
    pos_name = candidate.get("positionName")

   # 2. Delete the candidate
    await db.candidates.delete_one({"_id": ObjectId(candidate_id)})

# 3. Check how many are left using count (faster than fetching the list)
    remaining_count = await db.candidates.count_documents({"positionName": pos_name})

    # 4. إذا تبقى مرشح واحد فقط، نحدث حالته إلى 'single'
    if len(remaining_count) == 1:
        await db.candidates.update_one(
            {"_id": remaining_count[0]["_id"]},
            {"$set": {"positionStatus": "single"}}
        )

    return {"message": "تم حذف المرشح وتحديث حالات المناصب بنجاح"}


@router.get("/candidates/all", response_model=List[AdminCandidateOut])
async def get_all_candidates(
    skip: int = 0,
    limit: int = 100,
    db: Any = Depends(get_database),
    current_admin: dict = Depends(get_admin)
):
    """Get all candidates with pagination"""
    candidates = []
    async for candidate in db.candidates.find({}).skip(skip).limit(limit):
        candidates.append(candidate)
    return candidates

@router.put("/candidates/update/{candidate_id}", response_model=AdminCandidateOut)
async def update_candidate(
    candidate_id: str,
    candidate_in: CandidateUpdate,  # <--- Use ONLY this one
    db: Any = Depends(get_database),
    current_admin: dict = Depends(get_admin)
):
    # 1. Check if candidate exists
    existing = await db.candidates.find_one({"_id": ObjectId(candidate_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="المرشح غير موجود")
    
    # 2. Convert input to dict, ignoring fields the user didn't send
    # model_dump(exclude_unset=True) is the key here
    update_data = candidate_in.model_dump(exclude_unset=True, by_alias=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="لم يتم إرسال بيانات للتحديث")

    # 3. If position name is being updated, we handle the sync logic
    if "positionName" in update_data:
        old_pos = existing.get("positionName")
        new_pos = update_data["positionName"]

        # Update the candidate
        await db.candidates.update_one(
            {"_id": ObjectId(candidate_id)},
            {"$set": update_data}
        )

        # Refresh status for the old position and the new position
        for pos in [old_pos, new_pos]:
            count = await db.candidates.count_documents({"positionName": pos})
            new_status = "multiple" if count > 1 else "single"
            await db.candidates.update_many(
                {"positionName": pos},
                {"$set": {"positionStatus": new_status}}
            )
    else:
        # Standard update (no position change)
        await db.candidates.update_one(
            {"_id": ObjectId(candidate_id)},
            {"$set": update_data}
        )
    
    # 4. Return the updated document
    updated = await db.candidates.find_one({"_id": ObjectId(candidate_id)})
    return updated


@router.get("/candidates/{candidate_id}", response_model=AdminCandidateOut)
async def get_candidate(
    candidate_id: str,
    db: Any = Depends(get_database),
    current_admin: dict = Depends(get_admin)
):
    candidate = await db.candidates.find_one({"_id": ObjectId(candidate_id)})
    if not candidate:
        raise HTTPException(status_code=404, detail="المرشح غير موجود")
    return AdminCandidateOut.model_validate(candidate)






@router.get("/election-status", response_model=SystemSettings)
async def get_election_status(db: Any = Depends(get_database)):
    status = await db.settings.find_one({"_id": "election_state"})
    if not status:
        # إذا لم تكن موجودة بعد، نرجع الحالة الافتراضية
        return SystemSettings(is_locked=False, is_open=False)
    return status

@router.post("/update-status")
async def update_status(
    new_status: SystemSettings, 
    db: Any = Depends(get_database),
    _ = Depends(get_admin)
):
    await db.settings.update_one(
        {"_id": "election_state"},
        {"$set": new_status.model_dump()},
        upsert=True
    )
    return {"message": "تم تحديث حالة النظام بنجاح"}




# أضف هذا الاستيراد في أعلى الملف
from datetime import datetime, timezone

@router.post("/start-voting")
async def start_voting(
    db: Any = Depends(get_database),
    current_admin: dict = Depends(get_admin)
):
    """🔓 بدء التصويت: تصفير الأصوات + قفل تعديل المرشحين + فتح التصويت"""
    
    # 1. حذف جميع الأصوات السابقة (تنبيه: إجراء لا رجعة فيه)
    await db.votes.delete_many({})
    
    # 2. إعادة تعيين حالة جميع الناخبين ليتمكنوا من التصويت مجدداً
    await db.voters.update_many(
        {}, 
        {"$set": {"hasVoted": False}}
    )
    
    # 3. تحديث حالة النظام: مقفل للتعديل ومفتوح للتصويت
    await db.settings.update_one(
        {"_id": "election_state"},
        {
            "$set": {
                "is_locked": True, 
                "is_open": True,
                "updated_at": datetime.now(timezone.utc)
            }
        },
        upsert=True
    )
    return {"message": "تم بدء الانتخابات وتصفير السجلات بنجاح"}

@router.post("/end-voting") 
async def end_voting(
    db: Any = Depends(get_database),
    current_admin: dict = Depends(get_admin)
):
    """🔒 إنهاء التصويت: إغلاق استقبال الأصوات مع بقاء قفل التعديل"""
    
    await db.settings.update_one(
        {"_id": "election_state"},
        {
            "$set": {
                "is_locked": True, 
                "is_open": False,
                "updated_at": datetime.now(timezone.utc)
            }
        },
        upsert=True
    )
    
    # وسم المرشحين بأن التصويت انتهى (للأرشفة)
    await db.candidates.update_many({}, {"$set": {"votingEnded": True}})
    
    return {"message": "تم إغلاق صناديق الاقتراع بنجاح"}


def hash_password(password):
    """تشفير الباسورد باستخدام SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()



# 1. جلب قائمة جميع موظفي الإدارة
@router.get("/staff", response_model=List[VoterManagementResponse])
async def list_staff(
    db: Any = Depends(get_database),
    _admin: Dict = Depends(get_admin)
):
    staff_list = []
    async for s in db.voter_mangment.find({}).sort("created_at", -1):
        staff_list.append(VoterManagementResponse.model_validate(s))
    return staff_list

# 2. جلب بيانات موظف واحد (لأغراض التعديل)
@router.get("/staff/{staff_id}", response_model=VoterManagementResponse)
async def get_staff_member(
    staff_id: str, 
    db: Any = Depends(get_database),
    _admin: Dict = Depends(get_admin)
):
    # نستخدم ObjectId لأن معرف الحساب هو ID تلقائي من مونجو وليس رقم هوية
    staff = await db.voter_mangment.find_one({"_id": ObjectId(staff_id)})
    if not staff:
        raise HTTPException(status_code=404, detail="حساب الإدارة غير موجود")
    return VoterManagementResponse.model_validate(staff)



@router.post("/staff/create", response_model=VoterManagementResponse)
async def create_staff(
    payload: VoterManagementCreate, 
    db: Any = Depends(get_database),
    _admin: Dict = Depends(get_admin)
):
    if await db.voter_mangment.find_one({"username": payload.username}):
        raise HTTPException(status_code=409, detail="اسم المستخدم موجود مسبقاً")

    staff_doc = {
        "username": payload.username,
        "password": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc)
    }

    result = await db.voter_mangment.insert_one(staff_doc)
    staff_doc["_id"] = result.inserted_id
    return staff_doc




# 3. تحديث بيانات حساب الإدارة (الاسم أو كلمة المرور)
@router.put("/staff/{staff_id}", response_model=VoterManagementResponse)
async def update_staff_member(
    staff_id: str,
    payload: VoterManagementUpdate,
    db: Any = Depends(get_database),
    _admin: Dict = Depends(get_admin)
):
    existing = await db.voter_mangment.find_one({"_id": ObjectId(staff_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="الحساب غير موجود")

    update_data = {}
    
    # إذا تم تغيير اسم المستخدم، نتحقق من عدم تكراره
    if "username" in payload and payload["username"] != existing["username"]:
        dup = await db.voter_mangment.find_one({"username": payload["username"]})
        if dup:
            raise HTTPException(status_code=409, detail="اسم المستخدم مستخدم بالفعل")
        update_data["username"] = payload["username"]

    # إذا تم إرسال كلمة مرور جديدة، نقوم بتشفيرها
    if "password" in payload and payload["password"]:
        update_data["password"] = hashlib.sha256(payload["password"].encode()).hexdigest()

    if not update_data:
        raise HTTPException(status_code=400, detail="لا توجد بيانات لتحديثها")

    await db.voter_mangment.update_one(
        {"_id": ObjectId(staff_id)}, 
        {"$set": update_data}
    )
    
    updated = await db.voter_mangment.find_one({"_id": ObjectId(staff_id)})
    return VoterManagementResponse.model_validate(updated)

