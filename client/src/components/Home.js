import { useState, useEffect } from "react";
import axios from "../api/axios"; // Импортируем axios из вашего конфигурационного файла
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import useAuth from "../hooks/useAuth"; // Подключаем хук для получения auth из контекста

const Home = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const logout = useLogout();
  const { auth } = useAuth(); // Получаем данные авторизации из контекста

  // Функция для выхода
  const signOut = async () => {
    await logout();
    navigate("/linkpage");
  };

  // Функция для получения данных пользователя
  const getUserData = async () => {
    try {
      // Добавляем заголовок Authorization вручную
      const response = await axios.get("auth/read_current_user", {
        headers: {
          Authorization: `Bearer ${auth?.accessToken}`, // Добавляем токен авторизации
        },
      });
      setUser(response.data); // Сохранение данных пользователя в состоянии
    } catch (err) {
      setError("Failed to fetch user data. Please try again.");
      console.error(err);
    }
  };

  useEffect(() => {
    if (auth?.accessToken) {
      getUserData(); // Загружаем данные о пользователе при наличии токена
    }
  }, [auth?.accessToken]); // Перезапускать запрос, если токен изменился

  // Вычисление индекса массы тела (BMI)
  const calculateBMI = (height, weight) => {
    const heightInMeters = height / 100; // Конвертируем из см в метры
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
  };

  // Вычисление необходимого количества калорий для достижения цели
  const calculateCalories = (weight, targetWeight, timeFrame) => {
    const dailyCalorieDeficit = (weight - targetWeight) / timeFrame;
    const maintenanceCalories = 2500; // Примерная норма калорий для поддержания веса
    return Math.max(maintenanceCalories - dailyCalorieDeficit, 1200); // Минимум 1200 калорий в день
  };

  // Если данных пользователя нет или произошла ошибка, показываем сообщение
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
    <section>
      <h1>Welcome, {user.username}!</h1>
      <p>Height: {user.height} cm</p>
      <p>Weight: {user.weight} kg</p>
      <p>Target Weight: {user.target_weight} kg</p>
      <p>Time Frame: {user.time_frame} months</p>
      <p>BMI: {bmi}</p>
      <p>Daily Calories for Goal: {Math.round(calories)} kcal</p>
      <div className="footer">
        <button onClick={signOut}>Sign Out</button>
      </div>
    </section>
  );
};

export default Home;

// import { useState, useEffect } from "react";
// import axios from "axios";
// import "../styles/Home.css";
// import { useNavigate } from "react-router-dom";
// import useLogout from "../hooks/useLogout";
// import useAuth from "../hooks/useAuth"; // Подключаем хук для получения auth из контекста

// const Home = () => {
//   const [user, setUser] = useState(null);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();
//   const logout = useLogout();
//   const { auth } = useAuth(); // Получаем данные авторизации из контекста

//   // Функция для выхода
//   const signOut = async () => {
//     await logout();
//     navigate("/linkpage");
//   };

//   // Функция для получения данных пользователя
//   const getUserData = async () => {
//     try {
//       // Используем axios с токеном из auth
//       const response = await axios.get(
//         "http://127.0.0.1:8000/api/v1/auth/read_current_user",
//         {
//           headers: {
//             Authorization: `Bearer ${auth?.accessToken}`, // Используем токен из контекста
//           },
//         }
//       );
//       setUser(response.data); // Сохранение данных пользователя в состоянии
//     } catch (err) {
//       setError("Failed to fetch user data. Please try again.");
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     if (auth?.accessToken) {
//       getUserData(); // Загружаем данные о пользователе при наличии токена
//     }
//   }, [auth?.accessToken]); // Перезапускать запрос, если токен изменился

//   // Вычисление индекса массы тела (BMI)
//   const calculateBMI = (height, weight) => {
//     const heightInMeters = height / 100; // Конвертируем из см в метры
//     return (weight / (heightInMeters * heightInMeters)).toFixed(2);
//   };

//   // Вычисление необходимого количества калорий для достижения цели
//   const calculateCalories = (weight, targetWeight, timeFrame) => {
//     const dailyCalorieDeficit = (weight - targetWeight) / timeFrame;
//     const maintenanceCalories = 2500; // Примерная норма калорий для поддержания веса
//     return Math.max(maintenanceCalories - dailyCalorieDeficit, 1200); // Минимум 1200 калорий в день
//   };

//   // Если данных пользователя нет или произошла ошибка, показываем сообщение
//   if (error) {
//     return <div>{error}</div>;
//   }

//   if (!user) {
//     return <div>Loading...</div>;
//   }

//   const bmi = calculateBMI(user.height, user.weight);
//   const calories = calculateCalories(
//     user.weight,
//     user.target_weight,
//     user.time_frame
//   );

//   return (
//     <section>
//       <h1>Welcome, {user.username}!</h1>
//       <p>Height: {user.height} cm</p>
//       <p>Weight: {user.weight} kg</p>
//       <p>Target Weight: {user.target_weight} kg</p>
//       <p>Time Frame: {user.time_frame} months</p>
//       <p>BMI: {bmi}</p>
//       <p>Daily Calories for Goal: {Math.round(calories)} kcal</p>
//       <div className="footer">
//         <button onClick={signOut}>Sign Out</button>
//       </div>
//     </section>
//   );
// };

// export default Home;
