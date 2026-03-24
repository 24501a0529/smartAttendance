from pydantic import BaseModel # type: ignore
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    full_name: str
    department: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    user_id: int
    status: str = "Present"
    liveness_score: Optional[str] = None

class AttendanceResponse(AttendanceBase):
    id: int
    timestamp: datetime
    user: Optional[UserResponse] = None
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str
