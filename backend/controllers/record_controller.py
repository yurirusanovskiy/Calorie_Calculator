from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from models.record import Record
from models.record_product import RecordProduct
from models.product import Product
from db import get_session
from controllers.user_controller import get_current_username
from models.user import User
from schemas.record import RecordCreate, RecordUpdate


# Create a new record
async def create_record(
    record_data: RecordCreate,
    user: User = Depends(get_current_username),
    session: AsyncSession = Depends(get_session),
):
    product_id = record_data.product_id
    weight = record_data.weight

    # Check if the product exists
    result = await session.execute(select(Product).filter(Product.id == product_id))
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Create the new record
    record = Record(user_id=user.id)
    session.add(record)
    await session.commit()
    await session.refresh(record)

    # Add product to RecordProduct
    record_product = RecordProduct(
        records_id=record.id, product_id=product.id, weight=weight
    )
    session.add(record_product)
    await session.commit()

    return record


# Get all records for the current user
async def get_all_records(
    user: User,
    session: AsyncSession,
):
    """
    Fetch all records for the authenticated user.
    """
    result = await session.execute(
        select(Record)
        .options(joinedload(Record.products))  # Eager load related products
        .filter(Record.user_id == user.id)
    )
    records = result.unique().scalars().all()  # Ensure unique records are returned
    return records


# Get a specific record by ID
async def get_record_by_id(record_id: int, user: User, session: AsyncSession):
    result = await session.execute(
        select(Record)
        .options(joinedload(Record.products))
        .filter(Record.id == record_id, Record.user_id == user.id)
    )
    record = result.unique().scalar_one_or_none()

    if record is None:
        raise HTTPException(status_code=404, detail="Record not found")

    return record


async def get_records_by_date(
    date: str, session: AsyncSession, user_id: int
) -> List[dict]:
    """
    Fetch all records for the authenticated user by date.
    """
    # We execute a query to get all records for a specific date
    result = await session.execute(
        select(Record)
        .options(
            joinedload(Record.products).joinedload(RecordProduct.product)
        )  # Loading products and their information
        .filter(Record.user_id == user_id)
        .filter(Record.created.like(f"{date}%"))  # Filter by date
    )

    records = result.unique().scalars().all()

    if not records:
        raise HTTPException(status_code=404, detail="No records found for this date")

    # We form a list of dictionaries with the necessary information
    records_list = [
        {
            "name": product.product.name,
            "image": product.product.image_url,
            "product_calory": product.product.calories_per_100g,
            "weight": product.weight,
            "record_id": record.id,
        }
        for record in records
        for product in record.products
    ]

    return records_list


# Update a record
async def update_record(
    record_id: int, record_data: RecordUpdate, user: User, session: AsyncSession
) -> Record:
    """
    Update the record by changing the product or its weight.

    If the user wants to update the quantity of a product, the weight will be updated.
    If the user wants to change the product, the product ID will be updated.
    """
    # Fetch the record and check if it exists
    stmt = select(Record).where(Record.id == record_id, Record.user_id == user.id)
    result = await session.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    # Check if the product exists
    stmt_product = select(Product).where(Product.id == record_data.product_id)
    result_product = await session.execute(stmt_product)
    product = result_product.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if we are updating product or just weight
    record_product = await session.execute(
        select(RecordProduct).where(RecordProduct.records_id == record_id)
    )
    record_product = record_product.scalar_one_or_none()

    # Update product or weight
    if record_product:
        record_product.product_id = record_data.product_id
        record_product.weight = record_data.weight

    record.updated = datetime.now(timezone.utc)

    await session.commit()
    await session.refresh(record)

    return record


# Delete a record
async def delete_record(
    record_id: int,
    user: User,
    session: AsyncSession,
):
    # Find the record
    result = await session.execute(
        select(Record).filter(Record.id == record_id, Record.user_id == user.id)
    )
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    # Delete associated products
    # Correct query to select the associated RecordProduct entries
    result = await session.execute(
        select(RecordProduct).filter(RecordProduct.records_id == record_id)
    )
    products_to_delete = result.scalars().all()

    # Delete each associated product
    for product in products_to_delete:
        await session.delete(product)

    # Delete the record itself
    await session.delete(record)

    # Commit the transaction
    await session.commit()

    return {"message": "Record deleted successfully"}
