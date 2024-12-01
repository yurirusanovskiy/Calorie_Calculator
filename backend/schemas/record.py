from pydantic import BaseModel


class RecordCreate(BaseModel):
    product_id: int
    weight: int


class RecordUpdate(BaseModel):
    product_id: int
    weight: int
