from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

from app.models.candidate import PyObjectId


class AdminBase(BaseModel):
    username: str
    model_config = ConfigDict(populate_by_name=True)

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(AdminBase):
    id: PyObjectId = Field(alias="_id")
    created_at: datetime = Field(default_factory=datetime.now)
    model_config = ConfigDict(from_attributes=True)

class AdminInDB(AdminResponse):
    password: str
