import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/CreateDish.module.css";

const CreateDish = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [dishCalories, setDishCalories] = useState(0);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("products/")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleNameChange = (e) => setName(e.target.value);
  const handleCategoryChange = (e) => setCategory(e.target.value);
  const handleImageChange = (e) => setImage(e.target.files[0]);

  const handleIngredientSearchChange = (e) => {
    setIngredientSearch(e.target.value);
  };

  const handleIngredientSelect = (ingredient) => {
    setSelectedIngredient(ingredient);
  };

  const handleAddIngredient = () => {
    if (!selectedIngredient || !amount || amount <= 0) {
      alert("Please select an ingredient and enter a valid amount.");
      return;
    }
    const ingredientWithAmount = {
      ingredient: selectedIngredient,
      amount: parseFloat(amount),
    };
    setIngredients((prevIngredients) => [
      ...prevIngredients,
      ingredientWithAmount,
    ]);
    setAmount("");
  };

  const handleRemoveIngredient = (ingredientId) => {
    const updatedIngredients = ingredients.filter(
      (ing) => ing.ingredient.id !== ingredientId
    );
    setIngredients(updatedIngredients);
  };

  const calculateCalories = () => {
    let totalCalories = 0;
    let totalAmount = 0;

    ingredients.forEach((ingredient) => {
      const ingredientCalories =
        ingredient.ingredient.calories_per_100g * (ingredient.amount / 100);
      totalCalories += ingredientCalories;
      totalAmount += ingredient.amount;
    });

    const caloriesPer100g = (totalCalories / totalAmount) * 100;
    setDishCalories(Math.round(caloriesPer100g));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("auth");
    if (!token) {
      setError("Authorization token is missing.");
      return;
    }

    const url = `products/?name=${encodeURIComponent(
      name
    )}&category=${encodeURIComponent(
      category
    )}&calories_per_100g=${dishCalories}`;

    const formData = new FormData();
    if (image) {
      formData.append("file", image);
    }

    formData.append("ingredients", JSON.stringify(ingredients));

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
      <h2 className={styles.title}>Create a New Dish</h2>
      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="name">Dish Name</label>
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
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={handleCategoryChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="ingredientsSearch">Search for Ingredients</label>
          <input
            type="text"
            id="ingredientsSearch"
            value={ingredientSearch}
            onChange={handleIngredientSearchChange}
            placeholder="Search by name"
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="ingredientSelect">Select Ingredient</label>
          <select
            id="ingredientSelect"
            value={selectedIngredient ? selectedIngredient.id : ""}
            onChange={(e) =>
              handleIngredientSelect(
                products.find((p) => p.id === parseInt(e.target.value))
              )
            }
            required
            className={styles.select}
          >
            <option value="">Select an Ingredient</option>
            {products
              .filter((product) =>
                product.name
                  .toLowerCase()
                  .includes(ingredientSearch.toLowerCase())
              )
              .map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="amount">Amount (g)</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in grams"
            className={styles.input}
          />
          <button
            type="button"
            onClick={handleAddIngredient}
            className={styles.button}
          >
            Add Ingredient
          </button>
        </div>

        <div className={styles.ingredientsList}>
          <h3>Ingredients List</h3>
          <ul>
            {ingredients.map((ingredient, idx) => (
              <li key={idx} className={styles.ingredientItem}>
                {ingredient.ingredient.name} - {ingredient.amount}g
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveIngredient(ingredient.ingredient.id)
                  }
                  className={styles.removeButton}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.caloriesSection}>
          <button
            type="button"
            onClick={calculateCalories}
            className={styles.button}
          >
            Calculate Calories per 100g
          </button>
          <h3>Dish Calories per 100g: {dishCalories}</h3>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="image">Image (optional)</label>
          <input
            type="file"
            id="image"
            onChange={handleImageChange}
            className={styles.input}
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          Create Dish
        </button>
      </form>

      <button onClick={() => navigate("/")} className={styles.backButton}>
        Back to Home
      </button>

      {success && (
        <div className={styles.successModal}>
          <h3>Successfully created</h3>
          <button
            onClick={() => setSuccess(false)}
            className={styles.closeModalButton}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateDish;
