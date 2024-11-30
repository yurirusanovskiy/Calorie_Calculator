from sqlmodel import select
from typing import Optional
from fastapi import UploadFile, HTTPException

from models.product import Product
from sqlalchemy.ext.asyncio import AsyncSession
from controllers.file_controller import save_file, update_file, delete_file


# Asynchronous function to create a product
async def create_product(
    session: AsyncSession,
    name: str,
    category: str,
    calories_per_100g: int,
    file: Optional[UploadFile] = None,
) -> Product:
    """
    Creates a product and saves an image file if provided.
    """
    image_url = None
    if file:
        image_url = await save_file(file)

    product = Product(
        name=name.title(),
        category=category.title(),
        calories_per_100g=calories_per_100g,
        image_url=image_url,
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product


# Async function to get all products
async def get_all_products(session: AsyncSession):
    """Get all products from the database."""
    statement = select(Product)
    result = await session.execute(statement)
    return result.scalars().all()


# Asynchronous function to get product by ID
async def get_product_by_id(session: AsyncSession, product_id: int) -> Product:
    """Get a product by its ID."""
    statement = select(Product).where(Product.id == product_id)
    result = await session.execute(statement)
    return result.scalar_one_or_none()


# Async function to get product by name
async def get_product_by_name(session: AsyncSession, name: str) -> Product:
    """Get a product by its name."""
    statement = select(Product).where(Product.name == name)
    result = await session.execute(statement)
    return result.scalar_one_or_none()


# Asynchronous function for updating a product
async def update_product(
    session: AsyncSession,
    product_id: int,
    name: str,
    category: str,
    calories_per_100g: int,
    image_file: Optional[UploadFile] = None,
) -> Optional[Product]:
    """Update an existing product's information."""
    product = await session.get(Product, product_id)
    if product:
        product.name = name.title()
        product.category = category.title()
        product.calories_per_100g = calories_per_100g

        # If a new file is sended, update it
        if image_file:
            old_file_name = None
            if product.image_url:
                # Extracting the old file name from the URL
                old_file_name = product.image_url.split("/")[-1]

            # Use update_file to update the image
            new_image_url = await update_file(image_file, old_file_name)
            product.image_url = new_image_url

        await session.commit()
        await session.refresh(product)
    return product


async def delete_product(session: AsyncSession, product_id: int) -> None:
    """
    Deletes a product and its associated file (if exists).

    :param session: Database session.
    :param product_id: ID of the product to delete.
    :raises HTTPException: If the product does not exist.
    """
    # Geting the product from the database
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    # Delete the linked file if it exists
    if product.image_url:
        try:
            await delete_file(
                product.image_url.split("/")[-1]
            )  # Extracting file name from URL
        except HTTPException as e:
            # If the file is not found, we simply log the error, but do not interrupt the process.
            print(f"Error deleting file: {e.detail}")

    # Removing a product from the database
    await session.delete(product)
    await session.commit()
