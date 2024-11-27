from fastapi import APIRouter, UploadFile, HTTPException
from pathlib import Path
from fastapi.responses import FileResponse

from controllers.file_controller import (
    save_file,
    get_file_path,
    update_file,
    delete_file,
)


router = APIRouter(tags=["files"])


@router.get("/files/{file_name}", summary="Download a file")
async def download_file(file_name: str):
    """
    Download a file from the 'static' directory.

    :param file_name: The name of the file to download.
    :return: The requested file as a response.
    """
    try:
        file_path = await get_file_path(file_name)
        return FileResponse(
            file_path, media_type="application/octet-stream", filename=file_name
        )
    except HTTPException as e:
        raise e


@router.get("/{file_name}", response_class=FileResponse)
async def show_file(file_name: str):
    """
    Retrieve a file from the 'static' directory and return it as a response.

    This endpoint handles different image file types (PNG, JPEG) and serves them
    with the appropriate media type. If the requested file doesn't exist, a 404
    error is returned.

    - If the file is a PNG image, the response will be served with a `image/png` media type.
    - If the file is a JPEG or JPG image, the response will be served with a `image/jpeg` media type.
    - For all other file types, the default media type will be used.

    :param file_name: The name of the file to retrieve from the 'static' directory.
    :return: A `FileResponse` containing the requested file.
    :raises HTTPException: If the file does not exist, a 404 HTTPException is raised.
    """
    file_path = Path("static") / file_name

    # Checking file existence
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    # Defining the content type for images
    if file_name.endswith(".png"):
        return FileResponse(file_path, media_type="image/png")
    elif file_name.endswith(".jpg") or file_name.endswith(".jpeg"):
        return FileResponse(file_path, media_type="image/jpeg")

    return FileResponse(file_path)


@router.delete("/{file_name}", summary="Delete a file")
async def delete_file_route(file_name: str):
    """
    Delete a file from the 'static' directory.

    :param file_name: The name of the file to delete.
    :return: A success message upon deletion.
    """
    try:
        await delete_file(file_name)
        return {"message": f"File '{file_name}' deleted successfully."}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")


@router.post("/upload", summary="Upload a file")
async def upload_file(file: UploadFile):
    """
    Upload a file to the 'static' directory.

    :param file: The file to upload.
    :return: The path to the uploaded file.
    """
    try:
        file_path = await save_file(file)
        return {"message": "File uploaded successfully", "file_path": file_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")


@router.put("/{old_file_name}", summary="Update a file")
async def update_file_route(file: UploadFile, old_file_name: str):
    """
    Update an existing file by replacing it with a new one.

    :param file: The new file to upload.
    :param old_file_name: The name of the old file to replace.
    :return: The path to the updated file.
    """
    try:
        new_file_path = await update_file(file, old_file_name)
        return {"message": "File updated successfully", "file_path": new_file_path}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update file: {str(e)}")
