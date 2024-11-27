from sqlmodel import Field, Relationship
from typing import Optional
from models.base import BaseModel
from models.record_product import RecordProduct


class Product(BaseModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, index=True, description="Name of the product")
    category: str = Field(
        nullable=False, index=True, description="Category of the product"
    )
    calories_per_100g: int = Field(
        nullable=False, description="Calories per 100g of the product"
    )
    image_url: Optional[str] = Field(
        default=None, description="URL to the product image", nullable=True
    )

    # Delayed import for relationship to avoid circular import
    records: Optional["RecordProduct"] = Relationship(back_populates="product")
