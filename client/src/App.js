import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./components/Home";
import AddProduct from "./components/AddProduct";
import CreateDish from "./components/CreateDish";
import CreateRecord from "./components/CreateRecord";
import LazyHorse from "./components/LazyHorse";
import Footer from "./components/Footer";
import Layout from "./components/Layout";
import Unauthorized from "./components/Unauthorized";
import RequireAuth from "./components/RequireAuth";
import PersistLogin from "./components/PersistLogin";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";

function App() {
  return (
    <div>
      <Header /> {/* The Header component is rendered before Routes */}
      <Footer />
      <div className="container">
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* public routes */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            <Route path="unauthorized" element={<Unauthorized />} />

            {/* protected routes */}
            <Route element={<PersistLogin />}>
              <Route element={<RequireAuth />}>
                <Route path="/" element={<Home />} />
                <Route path="add-product" element={<AddProduct />} />{" "}
                <Route path="create-dish" element={<CreateDish />} />{" "}
                <Route path="create-record" element={<CreateRecord />} />{" "}
              </Route>
            </Route>
          </Route>

          {/* route for all other addresses */}
          <Route path="*" element={<LazyHorse />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
