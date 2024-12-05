import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const CreateDish = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [dishCalories, setDishCalories] = useState(0); // Total caloric content of the dish
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [amount, setAmount] = useState(""); // Quantity of ingredient
  const [error, setError] = useState(null); // To display errors
  const [success, setSuccess] = useState(false); // To successfully send data
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
    setAmount(""); // Clearing the quantity field
  };

  const handleRemoveIngredient = (ingredientId) => {
    const updatedIngredients = ingredients.filter(
      (ing) => ing.ingredient.id !== ingredientId
    );
    setIngredients(updatedIngredients);
  };

  const calculateCalories = () => {
    let totalCalories = 0;
    let totalAmount = 0; // Total weight of the dish

    ingredients.forEach((ingredient) => {
      const ingredientCalories =
        ingredient.ingredient.calories_per_100g * (ingredient.amount / 100);
      totalCalories += ingredientCalories;
      totalAmount += ingredient.amount; // Add the weight of the ingredient
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

    // Forming URL with parameters
    const url = `products/?name=${encodeURIComponent(
      name
    )}&category=${encodeURIComponent(
      category
    )}&calories_per_100g=${dishCalories}`;

    // Generating data for an image
    const formData = new FormData();
    if (image) {
      formData.append("file", image);
    }

    // Add ingredients
    formData.append("ingredients", JSON.stringify(ingredients));

    try {
      // Sending a request via Axios
      await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${JSON.parse(token).accessToken}`,
        },
      });
      setSuccess(true); // Displaying a modal window
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Failed to create the product. Please try again.");
    }
  };

  return (
    <div>
      <h2>Create a New Dish</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Dish Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            required
          />
        </div>

        <div>
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={handleCategoryChange}
            required
          />
        </div>

        <div>
          <label htmlFor="ingredientsSearch">Search for Ingredients</label>
          <input
            type="text"
            id="ingredientsSearch"
            value={ingredientSearch}
            onChange={handleIngredientSearchChange}
            placeholder="Search by name"
          />
        </div>

        <div>
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

        <div>
          <label htmlFor="amount">Amount (g)</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in grams"
          />
          <button type="button" onClick={handleAddIngredient}>
            Add Ingredient
          </button>
        </div>

        <div>
          <h3>Ingredients List</h3>
          <ul>
            {ingredients.map((ingredient, idx) => (
              <li key={idx}>
                {ingredient.ingredient.name} - {ingredient.amount}g
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveIngredient(ingredient.ingredient.id)
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <button type="button" onClick={calculateCalories}>
            Calculate Calories per 100g
          </button>
        </div>

        <div>
          <h3>Dish Calories per 100g: {dishCalories}</h3>
        </div>

        <div>
          <label htmlFor="image">Image (optional)</label>
          <input type="file" id="image" onChange={handleImageChange} />
        </div>

        <button type="submit">Create Dish</button>
      </form>

      <button onClick={() => navigate("/")} style={{ marginTop: "10px" }}>
        Back to Home
      </button>

      {success && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
            textAlign: "center",
          }}
        >
          <h3>Successfully created</h3>
          <button onClick={() => setSuccess(false)}>OK</button>
        </div>
      )}
    </div>
  );
};

export default CreateDish;
