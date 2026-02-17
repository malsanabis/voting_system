from pydantic import BaseModel, Field, ConfigDict
from typing import Optional , Annotated, Literal
from datetime import datetime
from pydantic.functional_validators import BeforeValidator


ValidPositions = Literal[
    "رئيس مجلس الإدارة",    
    "نائب رئيس مجلس الإدارة",
    "أمين السر",
    "الأمين المالي",
    "مدير المأتم",
    "منسق اللجان الفاعلة",
    "منسق اللجان الداعمة",
]

PyObjectId = Annotated[str, BeforeValidator(str)]


class CandidateBase(BaseModel):
    full_name: str = Field(..., alias="full_Name")
    position_name: ValidPositions = Field(..., alias="positionName")
    qualifications: Optional[str] = None
    mobile: Optional[str] = None
    image: str
    birth_date: Optional[datetime] = Field(None, alias="birthDate")
    address: Optional[str] = None
    position_status: Literal["multiple", "single"] = Field("single", alias="positionStatus")

    model_config = ConfigDict(populate_by_name=True)

class AdminCandidateOut(CandidateBase):
    id: PyObjectId = Field(alias="_id")
    
    model_config = ConfigDict(
        populate_by_name=True, 
        from_attributes=True,
        arbitrary_types_allowed=True
    )


class CandidateCreate(CandidateBase):
    pass


class CandidateUpdate(BaseModel):
    full_name: str = Field(..., alias="full_Name")
    position_name: ValidPositions = Field(..., alias="positionName")
    qualifications: Optional[str] = None
    mobile: Optional[str] = None
    image: str
    birth_date: Optional[datetime] = Field(None, alias="birthDate")
    address: Optional[str] = None
    position_status: Literal["multiple", "single"] = Field("multiple", alias="positionStatus")

    model_config = ConfigDict(populate_by_name=True)

class CandidateResponse(CandidateBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
