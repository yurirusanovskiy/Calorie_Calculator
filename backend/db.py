import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from databases import Database
from models.user import User
from models.product import Product
from models.record import Record
from models.record_product import RecordProduct

# Database URL for SQLite
DATABASE_URL = os.getenv("DATABASE_URL")
print(DATABASE_URL)

# Creating an asynchronous engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Creating an asynchronous session
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Creating an object for working with a database (via the databases library)
database = Database(DATABASE_URL)


# Asynchronous database initialization
async def init_db():
    try:
        # Creating tables asynchronously
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing the database: {e}")


# Getting an asynchronous session
async def get_session():
    async with AsyncSessionLocal() as session:
        yield session
