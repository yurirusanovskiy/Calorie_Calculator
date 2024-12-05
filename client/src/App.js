import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./components/Home";
import AddProduct from "./components/AddProduct";
import CreateDish from "./components/CreateDish";
import Layout from "./components/Layout";
import Missing from "./components/Missing";
import Unauthorized from "./components/Unauthorized";
// import LinkPage from "./components/LinkPage";
import RequireAuth from "./components/RequireAuth";
import PersistLogin from "./components/PersistLogin";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";

function App() {
  return (
    <div>
      <Header /> {/* компонент Header рендерится перед Routes */}
      <div className="container">
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* public routes */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            {/* <Route path="linkpage" element={<LinkPage />} /> */}
            <Route path="unauthorized" element={<Unauthorized />} />

            {/* защищённые маршруты */}
            <Route element={<PersistLogin />}>
              <Route element={<RequireAuth />}>
                <Route path="/" element={<Home />} />
                <Route path="add-product" element={<AddProduct />} />{" "}
                <Route path="create-dish" element={<CreateDish />} />{" "}
                {/* Новый маршрут */}
              </Route>
            </Route>
          </Route>

          {/* маршрут для всех остальных адресов */}
          <Route path="*" element={<Missing />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
