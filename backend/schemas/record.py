from pydantic import BaseModel


class RecordCreate(BaseModel):
    product_id: int  # ID продукта
    weight: int  # Вес продукта
