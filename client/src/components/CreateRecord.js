import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import TableEntries from "./TableEntries";
import styles from "../styles/CreateRecord.module.css";

const CreateRecord = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
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
    (product) => !selectedCategory || product.category === selectedCategory
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
    <div className={styles.container}>
      <h1 className={styles.heading}>Create Record</h1>
      <div className={styles.filterGroup}>
        <label>
          Filter by category:
          <select
            className={styles.select}
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
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Select product:
          <Select
            className={styles.select}
            options={filteredProducts.map((product) => ({
              value: product.id,
              label: product.name,
            }))}
            value={selectedProduct}
            onChange={(selectedOption) =>
              setSelectedProduct(
                filteredProducts.find(
                  (product) => product.id === selectedOption.value
                )
              )
            }
            placeholder="Search and select a product"
            isClearable
          />
        </label>
        <label className={styles.label}>
          Enter weight (g):
          <input
            type="number"
            className={styles.input}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </label>
        <button className={styles.button} onClick={handleAddRecord}>
          Add
        </button>
      </div>
      <div className={styles.tableContainer}>
        <TableEntries date={currentDate} auth={auth} reload={reloadTable} />
      </div>
      <button className={styles.button} onClick={() => navigate("/")}>
        Back
      </button>

      {/* Message */}
      {toastVisible && (
        <div className={styles.toast}>
          <p>Record added successfully!</p>
        </div>
      )}
    </div>
  );
};

export default CreateRecord;
