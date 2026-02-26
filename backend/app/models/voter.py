from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Annotated, Any, Literal, Optional
from datetime import datetime
from pydantic.functional_validators import BeforeValidator

PyObjectId = Annotated[str, BeforeValidator(str)]

class VoterBase(BaseModel):
    voter_id: str = Field(..., alias="VoterId") 
    full_name: str = Field(..., alias="VoterName")
    membership_type:  Literal[ "عضوية ناقصة", "عضوية كاملة"] = Field("عضوية ناقصة", alias="MembershipType") # type: ignore
    mobile: Optional[str] = Field(None, alias="phone")
    address: Optional[str] =  Field(None, alias="address")
    age:Optional[int] = Field(None, alias="Age")

    @field_validator('mobile', mode='before')
    @classmethod
    def fix_phone_type(cls, v: Any) -> Optional[str]:
        if v is None or (isinstance(v, float) and str(v) == 'nan'):
            return None
        return str(v)
    # ✅ إضافة مصحح بيانات (Validator) لمعالجة nan
    @field_validator('membership_type', mode='before')
    @classmethod
    def fix_nan_membership(cls, v: Any) -> str:
        v_str = str(v).strip()
        if v_str.lower() == 'nan' or not v_str:
            return "عضوية ناقصة"
        # تصحيح الأخطاء الإملائية الشائعة إذا وجدت
        if "كاملة" in v_str: return "عضوية كاملة"
        return "عضوية ناقصة"

    model_config = ConfigDict(populate_by_name=True)

class VoterCreate(VoterBase):
    pass

class VoterLogin(BaseModel):
    voter_id: str = Field(..., alias="VoterId")




class VoterResponse(VoterBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    is_eligible: bool = Field(False, alias="isEligible")
    has_voted: bool = Field(False, alias="hasVoted")
    created_at:datetime = Field(None, alias="created_at")
    eligible_at: Optional[datetime] = Field(None, alias="eligibleAt")



class VoterUpdate(BaseModel):
    voter_id: Optional[str] = Field(None, alias="VoterId") 
    full_name: Optional[str] = Field(None, alias="VoterName")
    mobile: Optional[str] = Field(None, alias="phone") 
    address: Optional[str] = Field(None, alias="address")
    membership_type: Optional[Literal["عضوية ناقصة", "عضوية كاملة"]] = Field(None, alias="MembershipType")

    model_config = ConfigDict(populate_by_name=True)
