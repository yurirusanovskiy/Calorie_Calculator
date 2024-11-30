from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """
    Base schema for user information.
    """

    username: str  # The user's username
    email: EmailStr  # The user's email
    weight: float  # Current weight of the user in kilograms
    height: int  # Height of the user in centimeters
    target_weight: float  # Desired target weight of the user in kilograms
    time_frame: int  # Timeframe to reach the target weight in days


class UserCreate(UserBase):
    """
    Schema for creating a new user.
    """

    password: str  # The user's password


class UserRead(UserBase):
    """
    Schema for reading user data.
    """

    id: int  # Unique identifier of the user

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """
    Schema for updating user information.
    """

    username: Optional[str]  # Optional updated username
    email: Optional[EmailStr]  # Optional updated email
    weight: Optional[float]  # Optional updated weight in kilograms
    height: Optional[int]  # Optional updated height in centimeters
    target_weight: Optional[float]  # Optional updated target weight in kilograms
    time_frame: Optional[int]  # Optional updated timeframe in days

    class Config:
        from_attributes = True


class PasswordChange(BaseModel):
    """
    Schema for changing a user's password.
    """

    old_password: str  # The current password of the user
    new_password: str  # The new password for the user
