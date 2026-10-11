from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    mobile: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str