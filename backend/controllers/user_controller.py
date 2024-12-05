import os
import jwt
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from sqlmodel import select
from typing import Annotated
from db import get_session
from models.user import User
from fastapi.security import OAuth2PasswordBearer

# Initialize bcrypt for password hashing
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 Password bearer configuration
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")

# JWT secret key and algorithm for token generation
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


# Function to generate JWT token
def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=24)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def authenticate_user(
    db: Annotated[AsyncSession, Depends(get_session)], username: str, password: str
):
    user = await db.scalar(select(User).where(User.username == username))
    if not user or not bcrypt_context.verify(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_current_username(
    db: Annotated[AsyncSession, Depends(get_session)],
    token: str = Depends(oauth2_scheme),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = await db.scalar(select(User).where(User.username == username))
    if user is None:
        raise credentials_exception
    return user


async def create_user(
    session: Annotated[AsyncSession, Depends(get_session)], user_data
):
    existing_user = await session.scalar(
        select(User).where(User.email == user_data.email)
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    hashed_password = bcrypt_context.hash(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        weight=user_data.weight,
        height=user_data.height,
        target_weight=user_data.target_weight,
        time_frame=user_data.time_frame,
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return new_user


async def update_user(session: AsyncSession, user_id: int, user_data):
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in user_data.dict(exclude_unset=True).items():
        setattr(user, key, value)

    await session.commit()
    await session.refresh(user)
    return user


async def delete_user(session: AsyncSession, user_id: int):
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await session.delete(user)
    await session.commit()
    return {"detail": "User deleted successfully"}


async def change_password(
    session: AsyncSession,
    user_id: int,
    old_password: str,
    new_password: str,
):
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not bcrypt_context.verify(old_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Old password is incorrect"
        )

    user.hashed_password = bcrypt_context.hash(new_password)
    await session.commit()
    await session.refresh(user)
    return {"detail": "Password changed successfully"}
