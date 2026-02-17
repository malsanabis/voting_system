from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from datetime import datetime

from app.models.candidate import PyObjectId



class VoterManagementBase(BaseModel):
    username: str
    model_config = ConfigDict(populate_by_name=True)


class VoterManagementLogin(BaseModel):
    username: str
    password: str
    
class VoterManagementResponse(VoterManagementBase):
    id: PyObjectId = Field(alias="_id")
    username: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class VoterManagementCreate(VoterManagementBase):
    password: str = Field(..., min_length=6)

class VoterManagementUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3)
    password: Optional[str] = Field(None, min_length=6)
    
    model_config = ConfigDict(populate_by_name=True)



class VoterManagementInDB(VoterManagementBase):
    password: str #hashed 
    created_at: datetime