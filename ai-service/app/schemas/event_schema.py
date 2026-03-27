from pydantic import BaseModel, Field, field_validator
from typing import Optional


class ExtractRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Raw email text to analyse")

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("text must not be blank or whitespace only")
        return v.strip()


class ExtractResponse(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None          # ISO 8601: YYYY-MM-DD
    time: Optional[str] = None          # 24-hr:  HH:MM
    location: Optional[str] = None
    confidence: float = Field(0.0, ge=0.0, le=1.0)
    is_event: bool = False
