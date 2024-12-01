from sqlmodel import Field, Relationship
from datetime import datetime, timezone
from typing import Optional, List
from models.base import BaseModel
from models.record_product import RecordProduct


class Record(BaseModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(
        foreign_key="user.id", nullable=False, description="User who created the record"
    )
    created: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Creation date of the record",
    )
    updated: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last updated date of the record",
    )

    products: List["RecordProduct"] = Relationship(back_populates="record")
