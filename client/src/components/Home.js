import { useState, useEffect, useCallback } from "react";
import axios from "../api/axios";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import styles from "../styles/HomeForm.module.css";

const Home = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const { auth } = useAuth();
  const navigate = useNavigate();

  // Функция для получения данных пользователя
  const getUserData = useCallback(async () => {
    try {
      const response = await axios.get("auth/read_current_user", {
        headers: {
          Authorization: `Bearer ${auth?.accessToken}`,
        },
      });
      setUser(response.data);
    } catch (err) {
      setError("Failed to fetch user data. Please try again.");
      console.error(err);
    }
  }, [auth?.accessToken]);

  useEffect(() => {
    if (auth?.accessToken) {
      getUserData();
    }
  }, [auth?.accessToken, getUserData]);

  const calculateBMI = (height, weight) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
  };

  const calculateCalories = (weight, targetWeight, timeFrame) => {
    const dailyCalorieDeficit = (weight - targetWeight) / timeFrame;
    const maintenanceCalories = 2500;
    return Math.max(maintenanceCalories - dailyCalorieDeficit, 1200);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) {
      return "Your weight is below normal. You should gain weight.";
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      return "Congratulations! You have a normal weight.";
    } else if (bmi >= 25) {
      return "Your weight is above normal. You should lose weight.";
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  const bmi = calculateBMI(user.height, user.weight);
  const calories = calculateCalories(
    user.weight,
    user.target_weight,
    user.time_frame
  );

  return (
    <div className={styles.homeContainer}>
      <div className={styles.userInfoCard}>
        <h1 className={styles.homeSubtitle}>Welcome, {user.username}!</h1>
        <p>Height: {user.height} cm</p>
        <p>Weight: {user.weight} kg</p>
        <p>Target Weight: {user.target_weight} kg</p>
        <p>Time Frame: {user.time_frame} months</p>
        <p>BMI: {bmi}</p>
        <p>{getBMICategory(bmi)}</p>
        <p>Daily Calories for Goal: {Math.round(calories)} kcal</p>
        <br />
        <h2 className={styles.homeSubtitle}>BMI Classification</h2>
        <table className={styles.bmiTable}>
          <thead>
            <tr>
              <th>Category</th>
              <th>BMI</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Underweight</td>
              <td>Less than 18.5</td>
            </tr>
            <tr>
              <td>Normal weight</td>
              <td>18.5 - 24.9</td>
            </tr>
            <tr>
              <td>Overweight</td>
              <td>25.0 - 29.9</td>
            </tr>
            <tr>
              <td>Obesity Class I</td>
              <td>30.0 - 34.9</td>
            </tr>
            <tr>
              <td>Obesity Class II</td>
              <td>35.0 - 39.9</td>
            </tr>
            <tr>
              <td>Obesity Class III</td>
              <td>40.0 and above</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.actionCard}>
        <h2 className={styles.homeSubtitle}>Actions</h2>
        <button
          className={styles.homeButton}
          onClick={() => navigate("/add-product")}
        >
          Add Product
        </button>
        <button
          className={styles.homeButton}
          onClick={() => navigate("/create-dish")}
        >
          Create a Dish
        </button>
        <button
          className={styles.homeButton}
          onClick={() => navigate("/change-product")}
        >
          Update Product
        </button>
        <button
          className={styles.homeButton}
          onClick={() => navigate("/delete-products")}
        >
          Delete Products
        </button>
        <button
          className={styles.homeButton}
          onClick={() => navigate("/create-record")}
        >
          Create Record
        </button>
        <button
          className={styles.homeButton}
          onClick={() => navigate("/products")}
        >
          Go to Products
        </button>
        <button
          className={styles.homeButton}
          onClick={() => navigate("/products")}
        >
          Go to Products
        </button>
        <button
          className={styles.homeButton}
          onClick={() => navigate("/products")}
        >
          Go to Products
        </button>
      </div>
    </div>
  );
};

export default Home;
