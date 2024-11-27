from sqlmodel import Field, Relationship
from typing import Optional
from models.base import BaseModel


# Delayed import to avoid circular dependency
class RecordProduct(BaseModel, table=True):
    records_id: int = Field(
        foreign_key="record.id", primary_key=True, description="Associated record"
    )
    product_id: int = Field(
        foreign_key="product.id", primary_key=True, description="Associated product"
    )

    product: Optional["Product"] = Relationship(back_populates="records")
    record: Optional["Record"] = Relationship(back_populates="products")
