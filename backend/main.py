from dotenv import load_dotenv

# Loading environment variables from .env
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from db import database, init_db
from contextlib import asynccontextmanager
from routes.product_routes import router as product_router
from routes.files_routes import router as files_router
from routes.record_router import router as record_router
from routes.user_router import router as user_router


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
app = FastAPI(
    lifespan=lifespan
)  # app = FastAPI(dependencies=[Depends(get_current_user)])

# Connecting CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Specify allowed domains
    allow_credentials=True,  # We allow the use of cookies
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # We allow any headers
)
app.include_router(product_router)
app.include_router(files_router)
app.include_router(record_router)
app.include_router(user_router)


app.mount("/static", StaticFiles(directory="static"), name="static")
