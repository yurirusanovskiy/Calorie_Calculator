from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from controllers.product_controller import (
    create_product,
    get_all_products,
    get_product_by_id,
    get_product_by_name,
    update_product,
    delete_product,
)
from db import get_session
from models.product import Product
from controllers.user_controller import get_current_username
from models.user import User

router = APIRouter(prefix="/api/v1/products", tags=["products"])


# Create a product
@router.post(
    "/", response_model=Product, status_code=201, summary="Create a new product"
)
async def create_product_endpoint(
    name: str,
    category: str,
    calories_per_100g: int,
    file: UploadFile = File(None),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_username),
):
    """
    Endpoint for creating a product and uploading a file.
    """
    print(f"Product created by user: {current_user.username}")  # User Logging
    return await create_product(
        session=session,
        name=name,
        category=category,
        calories_per_100g=calories_per_100g,
        file=file,
    )


# Get all products
@router.get("/", response_model=list[Product])
async def get_all_products_route(session: AsyncSession = Depends(get_session)):
    return await get_all_products(session)


# Update a product by ID
@router.put("/{product_id}", response_model=Product)
async def update_product_route(
    product_id: int,
    name: str,
    category: str,
    calories_per_100g: int,
    image_file: Optional[UploadFile] = File(None),  # File is optional, can be None
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_username),
):
    """
    Updates a product's information.
    """
    print(f"Product updated by user: {current_user.username}")  # User Logging
    product = await update_product(
        session, product_id, name, category, calories_per_100g, image_file
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# Get a product by ID
@router.get("/{product_id}", response_model=Product)
async def get_product_by_id_route(
    product_id: int, session: AsyncSession = Depends(get_session)
):
    """
    Fetches a product by its ID.
    """
    product = await get_product_by_id(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# Get a product by name
@router.get("/name/{name}", response_model=Product)
async def get_product_by_name_route(
    name: str, session: AsyncSession = Depends(get_session)
):
    """
    Fetches a product by its name.
    """
    product = await get_product_by_name(session, name)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# Delete a product by id
@router.delete("/{product_id}", summary="Delete a product")
async def delete_product_route(
    product_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_username),
):
    """
    Deletes a product and its associated file (if exists).
    """
    print(f"Product deleted by user: {current_user.username}")  # User Logging
    try:
        await delete_product(session, product_id)
        return {"message": f"Product with ID {product_id} deleted successfully."}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to delete product: {str(e)}"
        )
