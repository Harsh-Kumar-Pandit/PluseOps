from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    email_notifications_enabled: bool = True
    down_alerts_enabled: bool = True
    recovery_alerts_enabled: bool = True

    model_config = {
        "from_attributes": True
    }


class UpdatePreferencesRequest(BaseModel):
    email_notifications_enabled: bool | None = None
    down_alerts_enabled: bool | None = None
    recovery_alerts_enabled: bool | None = None


class NotificationPreferencesResponse(BaseModel):
    email_notifications_enabled: bool = True
    down_alerts_enabled: bool = True
    recovery_alerts_enabled: bool = True

    model_config = {
        "from_attributes": True
    }


class UpdateProfileRequest(BaseModel):
    name: str