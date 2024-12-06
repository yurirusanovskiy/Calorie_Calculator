from fastapi import APIRouter, Depends
from controllers.record_controller import (
    create_record,
    get_all_records,
    get_record_by_id,
    get_records_by_date,
    update_record,
    delete_record,
)
from schemas.record import RecordCreate, RecordUpdate
from models.record import Record
from sqlalchemy.ext.asyncio import AsyncSession
from db import get_session
from typing import List, Annotated
from controllers.user_controller import get_current_username
from models.user import User

router = APIRouter(prefix="/api/v1/records", tags=["records"])


@router.post("/", response_model=Record, status_code=201, summary="Create a new record")
async def create_new_record(
    record_data: RecordCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    user: User = Depends(get_current_username),
):
    """
    Create a new record for the authenticated user.
    """
    return await create_record(record_data=record_data, user=user, session=session)


@router.get("/", response_model=List[Record], summary="Get all records")
async def get_all_user_records(
    session: Annotated[AsyncSession, Depends(get_session)],
    user: User = Depends(get_current_username),
):
    """
    Retrieve all records created by the authenticated user.
    """
    return await get_all_records(user=user, session=session)


@router.get("/{date}", response_model=List[dict], summary="Get records by date")
async def get_records_by_date_endpoint(
    date: str,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_username),
):
    """
    Retrieve records for a specific date (only the day part of the timestamp).
    """
    return await get_records_by_date(date=date, session=session, user_id=user.id)


@router.get("/{record_id}", response_model=Record, summary="Get a record by ID")
async def get_record(
    record_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    user: User = Depends(get_current_username),
):
    """
    Retrieve a specific record by its ID for the authenticated user.
    """
    return await get_record_by_id(record_id=record_id, user=user, session=session)


@router.put("/{record_id}", response_model=Record, summary="Update a record")
async def update_user_record(
    record_id: int,
    record_data: RecordUpdate,
    session: Annotated[AsyncSession, Depends(get_session)],
    user: User = Depends(get_current_username),
):
    """
    Update an existing record for the authenticated user.

    This endpoint allows the user to either change the quantity of a product or
    replace the product with a different one.

    Args:
        record_id (int): The ID of the record to update.
        record_data (RecordUpdate): Data containing the updated product ID and/or weight.
        session (AsyncSession): The database session.
        user (User): The currently authenticated user.

    Returns:
        Record: The updated record.
    """
    return await update_record(
        record_id=record_id, record_data=record_data, user=user, session=session
    )


@router.delete("/{record_id}", summary="Delete a record")
async def delete_user_record(
    record_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    user: User = Depends(get_current_username),
):
    """
    Delete a specific record by its ID for the authenticated user.
    """
    return await delete_record(record_id=record_id, user=user, session=session)
