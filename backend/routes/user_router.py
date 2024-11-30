from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from controllers.user_controller import (
    create_user,
    create_access_token,
    authenticate_user,
    update_user,
    delete_user,
    change_password,
    get_current_username,
)
from db import get_session
from schemas.user import UserCreate, UserUpdate, PasswordChange
from models.user import User
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")


@router.post("/token")
async def login(
    db: Annotated[AsyncSession, Depends(get_session)],
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    user = await authenticate_user(db, form_data.username, form_data.password)
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/read_current_user")
async def read_current_user(current_user: User = Depends(get_current_username)):
    return current_user


@router.post("/register", status_code=201, summary="Register a new user")
async def register_user(
    user_data: UserCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await create_user(session, user_data)


@router.put("/update", summary="Update user information")
async def update_user_info(
    user_data: UserUpdate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: User = Depends(get_current_username),
):
    return await update_user(session, current_user.id, user_data)


@router.delete("/delete", summary="Delete a user")
async def remove_user(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: User = Depends(get_current_username),
):
    return await delete_user(session, current_user.id)


@router.put("/change-password", summary="Change a user's password")
async def update_password(
    password_data: PasswordChange,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: User = Depends(get_current_username),
):
    return await change_password(
        session,
        current_user.id,
        password_data.old_password,
        password_data.new_password,
    )
