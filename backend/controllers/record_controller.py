from fastapi import HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.record import Record
from models.record_product import RecordProduct
from models.product import Product
from db import get_session
from controllers.user_controller import get_current_username
from schemas.record import RecordCreate
from models.user import User


# Функция для создания записи
async def create_record(
    record_data: RecordCreate,  # Получаем данные из схемы RecordCreate
    user: User = Depends(
        get_current_username
    ),  # Получаем текущего авторизованного пользователя
    session: AsyncSession = Depends(get_session),  # Получаем сессию базы данных
):
    product_id = record_data.product_id
    weight = record_data.weight

    # Проверка существования продукта
    result = await session.execute(select(Product).filter(Product.id == product_id))
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Создание новой записи
    record = Record(user_id=user.id)
    session.add(record)
    await session.commit()  # Сохраняем запись
    await session.refresh(record)

    # Запись продукта в таблицу связи RecordProduct
    record_product = RecordProduct(
        records_id=record.id, product_id=product.id, weight=weight
    )
    session.add(record_product)
    await session.commit()  # Сохраняем связь

    return record
