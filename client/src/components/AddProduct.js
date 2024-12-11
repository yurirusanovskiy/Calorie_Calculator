import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/AddProduct.module.css";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [caloriesPer100g, setCaloriesPer100g] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Load categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/products/");
        const uniqueCategories = Array.from(
          new Set(response.data.map((product) => product.category))
        );
        setCategories(uniqueCategories);
      } catch (err) {
        console.error(err.response?.data || err.message);
        setError("Failed to fetch categories.");
      }
    };

    fetchCategories();
  }, []);

  // Change handlers
  const handleNameChange = (e) => setName(e.target.value);
  const handleCategoryChange = (e) => setCategory(e.target.value);
  const handleCaloriesChange = (e) => setCaloriesPer100g(e.target.value);
  const handleImageChange = (e) => setImage(e.target.files[0]);

  // Send data function
  const handleSubmit = async (e) => {
    e.preventDefault();

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
    } else {
      // Append default image if none is provided
      formData.append(
        "file",
        new File([""], "default.jpg", { type: "image/jpeg" })
      );
    }

    const url = `products/?name=${encodeURIComponent(
      name
    )}&category=${encodeURIComponent(
      category
    )}&calories_per_100g=${parsedCalories}`;

    try {
      await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${JSON.parse(token).accessToken}`,
        },
      });
      setSuccess(true);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Failed to create the product. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Add a New Product</h2>
      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="name" className={styles.label}>
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
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
            onChange={handleCategoryChange}
            list="categories"
            required
            className={styles.input}
          />
          <datalist id="categories">
            {categories.map((cat, index) => (
              <option key={index} value={cat} />
            ))}
          </datalist>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="calories" className={styles.label}>
            Calories per 100g
          </label>
          <input
            type="number"
            id="calories"
            value={caloriesPer100g}
            onChange={handleCaloriesChange}
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
            onChange={handleImageChange}
            className={styles.input}
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Create Product
        </button>
      </form>

      <button onClick={() => navigate("/")} className={styles.backButton}>
        Back to Home
      </button>

      {success && (
        <div className={styles.modal}>
          <h3>Successfully created</h3>
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

export default AddProduct;
