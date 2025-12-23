import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Users API
export const fetchUsers = () => API.get('/users');

// Donations API (using donation logs)
export const fetchDonations = () => API.get('/donations');

// Food Items API
export const fetchFoodItems = () => API.get('/food');

// Pickups API
export const fetchPickups = () => API.get('/pickups');

// Notifications API
export const fetchNotifications = (userId) => API.get(`/notifications/user/${userId}`);

export default API;
