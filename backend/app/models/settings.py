from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class SystemSettings(BaseModel):
    is_locked: bool = Field(default=False, description="قفل تعديل المرشحين")
    is_open: bool = Field(default=False, description="فتح/إغلاق استقبال الأصوات")
    updated_at:datetime = Field(None, alias="created_at")
    
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "is_locked": False,
                "is_open": False,
                "updated_at": "2026-02-06T12:00:00"
            }
        }
    )

class SystemSettingsResponse(SystemSettings):
    # عادة لا نحتاج لإرجاع الـ ID لأننا نعرف أنه دائماً 'election_state'
    pass