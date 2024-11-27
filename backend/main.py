import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from db import database, init_db
from contextlib import asynccontextmanager
from routes.product_routes import router as product_router
from routes.files_routes import router as files_router

# Loading environment variables from .env
load_dotenv()

# Define the lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler. Executes logic during application startup and shutdown.
    """
    # Startup logic: connect to the database and initialize it
    await database.connect()
    await init_db()  # Initialize the database (create tables)
    yield  # The application runs during this time
    # Shutdown logic: disconnect from the database
    await database.disconnect()


# Initialize FastAPI app with lifespan handler
app = FastAPI(lifespan=lifespan)

DATABASE_URL = os.getenv("DATABASE_URL")

app.include_router(product_router)
app.include_router(files_router)


app.mount("/static", StaticFiles(directory="static"), name="static")
