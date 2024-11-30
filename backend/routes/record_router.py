from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from sqlmodel import Session
from models.record import Record
from db import get_session
from controllers.record_controller import (
    create_record,
    get_record_by_id,
    get_records_by_date,
    update_record,
    delete_record,
)

router = APIRouter(prefix="/api/v1/records", tags=["Records"])


@router.post("/", response_model=Record)
async def create_record_endpoint(
    user_id: int,
    products: List[dict],
    session: Session = Depends(get_session),
):
    """
    Create a new record with associated products.

    - **user_id**: ID of the user creating the record.
    - **products**: List of products with their weights.
    """
    return await create_record(user_id, products, session)


@router.get("/{record_id}", response_model=Record)
async def get_record_by_id_endpoint(
    record_id: int, session: Session = Depends(get_session)
):
    """
    Get a specific record by its ID.

    - **record_id**: ID of the record.
    """
    return await get_record_by_id(record_id, session)


@router.get("/", response_model=List[Record])
async def get_records_by_date_endpoint(
    date: Optional[datetime] = None, session: Session = Depends(get_session)
):
    """
    Get all records by creation date.

    - **date**: Date to filter records (format: YYYY-MM-DD).
    """
    if not date:
        raise HTTPException(status_code=400, detail="Date parameter is required")
    return await get_records_by_date(date, session)


@router.put("/{record_id}", response_model=Record)
async def update_record_endpoint(
    record_id: int,
    products: Optional[List[dict]] = None,
    session: Session = Depends(get_session),
):
    """
    Update a record by adding new products or updating existing ones.

    - **record_id**: ID of the record to update.
    - **products**: List of products with their weights to update or add.
    """
    return await update_record(record_id, products, session)


@router.delete("/{record_id}")
async def delete_record_endpoint(
    record_id: int, session: Session = Depends(get_session)
):
    """
    Delete a specific record by its ID.

    - **record_id**: ID of the record to delete.
    """
    return await delete_record(record_id, session)
