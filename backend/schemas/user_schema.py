from typing import Optional
from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    email: str
    name: str
    id: Optional[str] = None

    class Config:
        from_attributes = True
