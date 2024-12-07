import React, { useState, useEffect, useCallback } from "react";
import axios from "../api/axios";
import { axiosPrivate } from "../api/axios";

const TableEntries = ({ date, auth, reload, dailyCalories }) => {
  const [records, setRecords] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [newWeight, setNewWeight] = useState("");

  // Function to calculate total calories consumed based on records
  const calculateTotalCalories = useCallback((data) => {
    return data.reduce(
      (sum, record) =>
        sum + Math.round((record.weight / 100) * record.product_calory),
      0
    );
  }, []);

  // Function to fetch records for the given date
  const fetchRecords = useCallback(async () => {
    try {
      const response = await axios.get(`records/${date}`, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });
      setRecords(response.data);
      setTotalCalories(calculateTotalCalories(response.data));
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  }, [auth.accessToken, calculateTotalCalories, date]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords, reload]); // Fetch records when reload changes

  // Function to handle weight update for a specific record
  const handleUpdateWeight = async (recordId) => {
    try {
      const recordToUpdate = records.find(
        (record) => record.record_id === recordId
      );

      if (!recordToUpdate) {
        console.error(`Record with ID ${recordId} not found.`);
        return;
      }

      const updateData = {
        product_id: recordToUpdate.product_id,
        weight: parseInt(newWeight, 10),
      };

      await axiosPrivate.put(`records/${recordId}`, updateData, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });

      setEditingRecordId(null);
      setNewWeight("");
      fetchRecords();
    } catch (error) {
      console.error(
        "Error updating weight:",
        error.response?.data || error.message
      );
    }
  };

  // Function to handle record deletion
  const handleDeleteRecord = async (recordId) => {
    try {
      await axios.delete(`records/${recordId}`, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });
      fetchRecords();
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const img_path = process.env.REACT_APP_IMG_URL;

  // Check if the total calories exceed the daily limit
  const isTotalCaloriesOverLimit = totalCalories > dailyCalories;

  return (
    <div>
      <table style={{ borderSpacing: "10px" }}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Caloric Content</th>
            <th>Weight</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.length > 0 ? (
            records.map((record) => (
              <tr key={record.record_id}>
                <td>
                  {record.image ? (
                    <img
                      src={`${img_path}${record.image.split("/").pop()}`}
                      alt={record.name}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>{record.name}</td>
                <td>{record.product_calory}</td>
                <td>{record.weight}</td>
                <td>
                  {Math.round((record.weight / 100) * record.product_calory)}
                </td>
                <td>
                  {editingRecordId === record.record_id ? (
                    <>
                      <input
                        type="number"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                      />
                      <button
                        onClick={() => handleUpdateWeight(record.record_id)}
                      >
                        Update
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingRecordId(record.record_id)}
                      >
                        Edit Weight
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.record_id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No records found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div>
        <strong>Total Calories:</strong> {totalCalories}
      </div>

      {isTotalCaloriesOverLimit && (
        <div style={{ color: "red", marginTop: "10px" }}>
          You have exceeded your daily calorie limit!
        </div>
      )}
    </div>
  );
};

export default TableEntries;
