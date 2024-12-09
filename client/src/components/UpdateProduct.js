import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/UpdateProduct.module.css";

const UpdateProduct = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [caloriesPer100g, setCaloriesPer100g] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/products/");
        setProducts(response.data);
        setCategories([...new Set(response.data.map((p) => p.category))]);
      } catch (err) {
        setError("Failed to fetch products.");
      }
    };

    fetchProducts();
  }, []);

  const handleProductSelection = (e) => {
    const productId = e.target.value;
    setSelectedProductId(productId);

    const selectedProduct = products.find(
      (product) => product.id === +productId
    );
    if (selectedProduct) {
      setName(selectedProduct.name);
      setCategory(selectedProduct.category);
      setCaloriesPer100g(selectedProduct.calories_per_100g.toString());
    }
  };

  const handleCategoryFilter = (e) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    setFilteredProducts(
      selectedCategory
        ? products.filter((p) => p.category === selectedCategory)
        : products
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProductId) {
      setError("Please select a product to update.");
      return;
    }

    const token = localStorage.getItem("auth");
    if (!token) {
      setError("Authorization token is missing.");
      return;
    }

    const parsedCalories = parseInt(caloriesPer100g, 10);
    if (isNaN(parsedCalories)) {
      setError("Calories must be a valid number.");
      return;
    }

    const formData = new FormData();
    if (image) {
      formData.append("file", image);
    }

    const url = `/products/${selectedProductId}?name=${encodeURIComponent(
      name
    )}&category=${encodeURIComponent(
      category
    )}&calories_per_100g=${parsedCalories}`;

    try {
      await axios.put(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${JSON.parse(token).accessToken}`,
        },
      });
      setSuccess(true);
    } catch (err) {
      setError("Failed to update the product. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Update Product</h2>
      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="categoryFilter" className={styles.label}>
            Filter by Category
          </label>
          <select
            id="categoryFilter"
            onChange={handleCategoryFilter}
            value={category}
            className={styles.select}
          >
            <option value="">All Categories</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="productSelect" className={styles.label}>
            Select Product
          </label>
          <select
            id="productSelect"
            onChange={handleProductSelection}
            value={selectedProductId}
            className={styles.select}
          >
            <option value="">Select a product</option>
            {(category ? filteredProducts : products).map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="name" className={styles.label}>
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="category" className={styles.label}>
            Category
          </label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="calories" className={styles.label}>
            Calories per 100g
          </label>
          <input
            type="number"
            id="calories"
            value={caloriesPer100g}
            onChange={(e) => setCaloriesPer100g(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="image" className={styles.label}>
            Image (optional)
          </label>
          <input
            type="file"
            id="image"
            onChange={(e) => setImage(e.target.files[0])}
            className={styles.input}
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          Update Product
        </button>
      </form>

      <button onClick={() => navigate("/")} className={styles.backButton}>
        Back to Home
      </button>

      {success && (
        <div className={styles.modal}>
          <h3>Successfully updated</h3>
          <button
            onClick={() => setSuccess(false)}
            className={styles.modalButton}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};

export default UpdateProduct;
