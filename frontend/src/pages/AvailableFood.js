import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AvailableFood.css';

const AvailableFood = () => {
  const [foodItems, setFoodItems] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/food')
      .then(response => setFoodItems(response.data))
      .catch(error => console.error("Error fetching food items:", error));
  }, []);

  const handleRemove = (id) => {
    if (window.confirm("Are you sure you want to remove this food item?")) {
      axios.delete(`http://localhost:8080/api/food/${id}`)
        .then(() => {
          setFoodItems(foodItems.filter(item => item.id !== id));
          toast.success("Food item removed successfully!");
        })
        .catch(error => {
          console.error("Error removing food item:", error);
          toast.error("Failed to remove food item.");
        });
    }
  };

  return (
    <div className="available-container">
      <h2>Available Surplus Food</h2>
      <table className="available-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Food</th>
            <th>Qty</th>
            <th>Location</th>
            <th>Expires</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {foodItems.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.pickupLocation}</td>
              <td>{item.expiryTime}</td>
              <td>
                <button
                  className="remove-button"
                  onClick={() => handleRemove(item.id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default AvailableFood;
