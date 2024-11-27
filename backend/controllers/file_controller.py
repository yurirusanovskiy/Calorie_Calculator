import os
import aiofiles
import aiofiles.os
from fastapi import UploadFile, HTTPException

# Constant for the path to the file storage directory
STATIC_DIR = "static"


async def ensure_static_dir_exists() -> None:
    """
    Ensures that the static directory exists.
    """
    if not await aiofiles.os.path.exists(STATIC_DIR):
        await aiofiles.os.makedirs(STATIC_DIR)


async def save_file(file: UploadFile) -> str:
    """
    Saves the file in the static directory and returns the path to the file.
    """
    # Checking the directory exists
    await ensure_static_dir_exists()

    # Get the file extension
    file_extension = os.path.splitext(file.filename)[-1]
    # Generate a new file name
    new_filename = f"{file.filename.split('.')[0]}{file_extension}"
    # Path to save
    file_path = os.path.join(STATIC_DIR, new_filename)

    # Save file asynchronously
    async with aiofiles.open(file_path, "wb") as buffer:
        while chunk := await file.read(1024):  # Reading the file by chunk
            await buffer.write(chunk)

    return file_path


async def get_file_path(file_name: str) -> str:
    """
    Returns the path to a file in the static directory.

    :param file_name: File name.
    :return: Path to file.
    """
    # Creating path to a file
    file_path = os.path.join(STATIC_DIR, file_name)

    # Asynchronous check for file existence
    if not await aiofiles.os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found.")

    return file_path


async def update_file(file: UploadFile, old_file_name: str) -> str:
    """
    Updates a file by deleting the old file (if it exists) and uploading a new file.

    :param file: The new file to upload.
    :param old_file_name: The name of the old file to delete.
    :return: The path to the newly uploaded file.
    """
    old_file_path = os.path.join(STATIC_DIR, old_file_name)

    # Delete the old file if it exists
    if await aiofiles.os.path.exists(old_file_path):
        await aiofiles.os.remove(old_file_path)

    # Save a new file using the save_file function
    return await save_file(file)


async def delete_file(file_name: str) -> None:
    """
    Deletes a file from the static directory.

    :param file_name: Name of the file to delete.
    :raises HTTPException: If the file does not exist.
    """
    # Creating path to a file
    file_path = os.path.join(STATIC_DIR, file_name)

    # Checking the existence of a file
    if not await aiofiles.os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found.")

    # Delete file asynchronously
    await aiofiles.os.remove(file_path)
