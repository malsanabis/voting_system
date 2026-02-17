from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Annotated, Literal, List
from datetime import datetime
from pydantic.functional_validators import BeforeValidator
from app.models.candidate import ValidPositions

PyObjectId = Annotated[str, BeforeValidator(str)]

# --- VOTE MODELS (Anonymous Source of Truth) ---
class VoteChoice(BaseModel):
    position_name: ValidPositions = Field(..., alias="positionName")  # e.g., "رئيس مجلس الاداره"
    candidate_Id: str =  Field(..., alias="candidateId")    # The MongoDB _id of the candidate

class VoteCreate(BaseModel):
    # This comes from the frontend as plain text, 
    # but the backend will hash it before saving.
    voter_id: str = Field(..., alias="VoterId") 
    choices: List[VoteChoice]

class VoteInDB(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    # The CRITICAL change: Store the hash, NOT the ID
    voterIdHash: str = Field(..., alias="voterIdHash") 
    choices: List[VoteChoice]
    created_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(populate_by_name=True)