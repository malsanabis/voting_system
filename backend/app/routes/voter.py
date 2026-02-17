from fastapi import APIRouter, Depends, HTTPException,Query
from typing import Any,List,Optional
import hashlib
from datetime import datetime, timezone
from ..models.votes import VoteCreate,VoteChoice
from ..services.database import get_database
from ..models.candidate import CandidateResponse, ValidPositions

router = APIRouter(prefix="/api/voter", tags=["voter"])


# 1. جلب المرشحين حسب المنصب
@router.get("/candidates", response_model=List[CandidateResponse])
async def get_candidates(
    position: Optional[ValidPositions] = Query(None),
    db: Any = Depends(get_database)
):
    query = {"positionStatus": "multiple"}  # مرشحين نشطين فقط
    if position:
        query["positionName"] = position
    
    candidates = await db.candidates.find(query).sort("full_Name", 1).to_list(50)
    return candidates


@router.post("/cast-vote")
async def cast_vote(vote: VoteCreate, db: Any = Depends(get_database)):
    # 1. Verification
    voter_record = await db.voters.find_one({"VoterId": vote.voter_id})
    
    if not voter_record or not voter_record.get("isEligible"):
        raise HTTPException(status_code=403, detail="غير مسموح لك بالتصويت")
        
    if voter_record.get("hasVoted"):
        raise HTTPException(status_code=400, detail="لقد قمت بالتصويت مسبقاً")

    # 2. Anonymization
    voter_hash = hashlib.sha256(vote.voter_id.encode()).hexdigest()

    # 3. Save the Blind Ballot
    ballot = {
        # IMPORTANT: Do NOT include a field named "VoterId" here 
        # unless you intend for it to be the unique identifier.
        "voterIdHash": voter_hash, 
        "choices": [c.model_dump() for c in vote.choices],
        "created_at": datetime.now(timezone.utc)
    }
    
    # 4. Check for duplicate hash
    if await db.votes.find_one({"voterIdHash": voter_hash}):
         raise HTTPException(status_code=400, detail="خطأ: صوت مسجل مسبقاً")

    # Try to insert and catch the index error specifically
    try:
        await db.votes.insert_one(ballot)
    except Exception as e:
     # ROLLBACK: If saving the ballot fails, we must let them try again
        await db.voters.update_one(
            {"VoterId": vote.voter_id}, 
            {"$set": {"hasVoted": False}}
        )
        if "11000" in str(e):
             raise HTTPException(status_code=400, detail="تم تسجيل هذا الصوت مسبقاً")
        raise e
    
    # 5. Mark the voter as having voted in the OTHER collection
    await db.voters.update_one(
        {"VoterId": vote.voter_id}, 
        {"$set": {"hasVoted": True}}
    )

    return {"message": "تم تسجيل صوتك بنجاح"}


    # 3. حالة التصويت للناخب
@router.get("/progress")
async def get_voting_progress(voter_id: str, db: Any = Depends(get_database)):
    voter = await db.voters.find_one({"VoterId": voter_id})
    if not voter:
        raise HTTPException(status_code=404, detail="الناخب غير موجود")
    
    voter_hash = hashlib.sha256(voter_id.encode()).hexdigest()
    vote_record = await db.votes.find_one({"voterIdHash": voter_hash})
    
    completed_positions = [
        choice["positionName"] for choice in vote_record["choices"]
    ] if vote_record else []
    
    return {
        "hasVoted": bool(vote_record),
        "completedPositions": completed_positions,
        "isEligible": voter.get("isEligible", False)
    }