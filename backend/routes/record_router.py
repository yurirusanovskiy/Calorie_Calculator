from fastapi import APIRouter, Depends
from controllers.record_controller import create_record
from schemas.record import RecordCreate  # Схема для валидации данных создания записи
from models.record import Record
from sqlalchemy.ext.asyncio import AsyncSession
from db import get_session
from typing import Annotated
from controllers.user_controller import get_current_username
from models.user import User

router = APIRouter(prefix="/api/v1/records", tags=["records"])


@router.post("/", response_model=Record, status_code=201, summary="Create a new record")
async def create_new_record(
    record_data: RecordCreate,  # Данные для записи
    session: Annotated[AsyncSession, Depends(get_session)],
    user: User = Depends(
        get_current_username
    ),  # Получаем текущего авторизованного пользователя
):
    return await create_record(
        record_data=record_data,  # Передаем схему для создания записи
        user=user,
        session=session,
    )
