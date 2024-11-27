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

router = APIRouter(prefix="/products", tags=["products"])


# Create a product
@router.post("/")
async def create_product_endpoint(
    name: str,
    category: str,
    calories_per_100g: int,
    file: UploadFile = File(None),
    session: AsyncSession = Depends(get_session),
):
    """
    Endpoint for creating a product and uploading a file.
    """
    return await create_product(
        session=session,
        name=name,
        category=category,
        calories_per_100g=calories_per_100g,
        file=file,
    )


# Get all products
@router.get("/products/", response_model=list[Product])
async def get_all_products_route(session: AsyncSession = Depends(get_session)):
    return await get_all_products(session)


# Update a product by ID
@router.put("/products/{product_id}", response_model=Product)
async def update_product_route(
    product_id: int,
    name: str,
    category: str,
    calories_per_100g: int,
    image_file: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_session),
):
    product = await update_product(
        session, product_id, name, category, calories_per_100g, image_file
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# Get a product by ID
@router.get("/products/{product_id}", response_model=Product)
async def get_product_by_id_route(
    product_id: int, session: AsyncSession = Depends(get_session)
):
    product = await get_product_by_id(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# Get a product by name
@router.get("/products/name/{name}", response_model=Product)
async def get_product_by_name_route(
    name: str, session: AsyncSession = Depends(get_session)
):
    product = await get_product_by_name(session, name)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# Delete a product by id
@router.delete("/{product_id}", summary="Delete a product")
async def delete_product_route(
    product_id: int, session: AsyncSession = Depends(get_session)
):
    """
    Deletes a product and its associated file (if exists).

    :param product_id: ID of the product to delete.
    :param session: Database session.
    :return: Success message upon deletion.
    """
    try:
        await delete_product(session, product_id)
        return {"message": f"Product with ID {product_id} deleted successfully."}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to delete product: {str(e)}"
        )
