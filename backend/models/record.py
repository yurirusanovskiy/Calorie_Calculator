from sqlmodel import Field, Relationship
from datetime import datetime
from typing import Optional, List
from models.base import BaseModel


# Delayed import for relationship to avoid circular import
class Record(BaseModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(
        foreign_key="user.id", nullable=False, description="User who created the record"
    )
    weight: int = Field(
        nullable=False, description="Total weight of the food consumed in grams"
    )
    created: datetime = Field(
        default_factory=datetime.utcnow, description="Creation date of the record"
    )
    updated: datetime = Field(
        default_factory=datetime.utcnow, description="Last updated date of the record"
    )

    products: List["RecordProduct"] = Relationship(back_populates="record")
