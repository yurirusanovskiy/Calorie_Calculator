from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, Depends
from sqlmodel import Session, select
from models.record import Record
from models.product import Product
from models.record_product import RecordProduct
from db import get_session


async def create_record(
    user_id: int, products: List[dict], session: Session = Depends(get_session)
) -> Record:
    """
    Create a new record with associated products.

    :param user_id: ID of the user creating the record.
    :param products: List of products with their weights (e.g., [{"product_id": 1, "weight": 100}]).
    :param session: Database session.
    :return: The created Record.
    """
    if not products:
        raise HTTPException(status_code=400, detail="Products list cannot be empty")

    # 1. Создаем запись Record
    record = Record(user_id=user_id, created=datetime.now(), updated=datetime.now())
    session.add(record)
    session.flush()  # Обеспечиваем доступ к record.id

    # 2. Добавляем продукты в связь RecordProduct
    for product_data in products:
        # Проверяем наличие продукта в таблице Product
        product = session.get(Product, product_data["product_id"])
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product with ID {product_data['product_id']} not found",
            )

        # Создаем связь между Record и Product
        record_product = RecordProduct(
            records_id=record.id,
            product_id=product.id,
            weight=product_data.get("weight"),  # Указываем вес продукта
        )
        session.add(record_product)

    # 3. Сохраняем изменения в базе
    session.commit()
    session.refresh(record)

    return record


async def get_record_by_id(
    record_id: int, session: Session = Depends(get_session)
) -> Record:
    """
    Get a record by its ID.

    :param record_id: ID of the record.
    :param session: Database session.
    :return: The requested Record.
    """
    record = session.get(Record, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


async def get_records_by_date(
    date: datetime, session: Session = Depends(get_session)
) -> List[Record]:
    """
    Get all records created on a specific date.

    :param date: Date to filter records by.
    :param session: Database session.
    :return: List of records created on the given date.
    """
    query = select(Record).where(Record.created.date() == date.date())
    records = session.exec(query).all()
    return records


async def update_record(
    record_id: int,
    products: Optional[List[dict]] = None,
    session: Session = Depends(get_session),
) -> Record:
    """
    Update an existing record by adding new products or updating weights.

    :param record_id: ID of the record to update.
    :param products: List of products with their weights to update or add.
    :param session: Database session.
    :return: The updated Record.
    """
    record = session.get(Record, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    if products:
        for product_data in products:
            product = session.get(Product, product_data["product_id"])
            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product {product_data['product_id']} not found",
                )

            record_product = (
                session.exec(RecordProduct)
                .filter_by(records_id=record_id, product_id=product.id)
                .first()
            )
            if record_product:
                # Update existing relationship (e.g., weight update logic can go here)
                pass
            else:
                # Add new product to the record
                new_record_product = RecordProduct(
                    records_id=record_id, product_id=product.id
                )
                session.add(new_record_product)

    record.updated = datetime.now()
    session.commit()
    session.refresh(record)
    return record


async def delete_record(
    record_id: int, session: Session = Depends(get_session)
) -> dict:
    """
    Delete a record by its ID.

    :param record_id: ID of the record to delete.
    :param session: Database session.
    :return: A success message upon deletion.
    """
    record = session.get(Record, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    # Delete all associated record-product relationships
    session.exec(RecordProduct).filter_by(records_id=record_id).delete()
    session.delete(record)
    session.commit()
    return {"message": f"Record {record_id} deleted successfully"}


# Exmpl create record

# {
#   "user_id": 1,
#   "products": [
#     {"product_id": 1, "weight": 150},
#     {"product_id": 2, "weight": 200}
#   ]
# }
