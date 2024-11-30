from sqlmodel import Field
from typing import Optional
from models.base import BaseModel


class User(BaseModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(
        nullable=False, index=True, description="Username of the user"
    )
    email: str = Field(
        nullable=False, unique=True, index=True, description="Email of the user"
    )
    hashed_password: str = Field(
        nullable=False, description="Hashed Password of the user"
    )
    weight: float = Field(
        nullable=False, description="Current weight of the user in kg"
    )
    height: int = Field(nullable=False, description="Height of the user in cm")
    target_weight: float = Field(
        nullable=False, description="Target weight of the user in kg"
    )
    time_frame: int = Field(
        default=6, description="Timeframe to reach target weight in months"
    )
