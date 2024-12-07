import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { useNavigate } from "react-router-dom";
import TableEntries from "./TableEntries";

const CreateRecord = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [weight, setWeight] = useState("");
  const [reloadTable, setReloadTable] = useState(false); // Flag to reload table
  const [toastVisible, setToastVisible] = useState(false); // State for displaying notification
  const navigate = useNavigate();

  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split("T")[0];

  // Retrieving a token from localStorage
  const auth = JSON.parse(localStorage.getItem("auth"));

  useEffect(() => {
    const token = auth?.accessToken;
    if (!token) {
      console.error("No token found!");
      return;
    }

    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Getting products and unique categories
    axiosInstance
      .get("products")
      .then((response) => {
        setProducts(response.data);
        const uniqueCategories = [
          ...new Set(response.data.map((product) => product.category)),
        ];
        setCategories(uniqueCategories);
      })
      .catch((error) => console.error("Failed to load products", error));
  }, [auth?.accessToken]);

  const filteredProducts = products.filter(
    (product) =>
      (!selectedCategory || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRecord = () => {
    if (!selectedProduct || !weight) {
      alert("Please select a product and enter weight.");
      return;
    }

    const token = auth?.accessToken;
    if (!token) {
      alert("User is not authorized!");
      return;
    }

    axiosInstance
      .post(
        "records",
        {
          product_id: selectedProduct.id,
          weight: parseFloat(weight),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setWeight("");
        setSelectedProduct(null);
        setReloadTable((prev) => !prev); // Toggle flag to reload table
        showToast(); // Show notification about adding
      })
      .catch((error) => {
        console.error("Failed to add record.", error);
        alert("Failed to add record.");
      });
  };

  const showToast = () => {
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000); // Hide notification after 3 seconds
  };

  return (
    <div>
      <h1>Create Record</h1>
      <div>
        <label>
          Filter by category:
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <input
          type="text"
          placeholder="Search product"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div>
        <label>
          Select product:
          <select
            value={selectedProduct?.id || ""}
            onChange={(e) =>
              setSelectedProduct(
                products.find(
                  (product) => product.id === parseInt(e.target.value)
                )
              )
            }
          >
            <option value="">Select</option>
            {filteredProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Enter weight (g):
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </label>
        <button onClick={handleAddRecord}>Add</button>
      </div>
      <TableEntries date={currentDate} auth={auth} reload={reloadTable} />
      <button onClick={() => navigate("/")}>Back</button>

      {/* Message */}
      {toastVisible && (
        <div className="toast">
          <p>Record added successfully!</p>
        </div>
      )}
    </div>
  );
};

export default CreateRecord;
