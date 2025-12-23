import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaUtensils,
  FaTruck,
  FaChartLine,
  FaCog,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaSync
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import './AdminDashboard.css';
import { fetchUsers, fetchDonations, fetchPickups } from '../services/api';
import API from '../services/api';

// Helper functions for API calls
const fetchUsersCount = () => API.get('/users/count');
const fetchDonationsCount = () => API.get('/donations/count');
const fetchPickupsCount = () => API.get('/pickups/count');

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // State for stats counters
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalPickups: 0
  });

  // State for data lists
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [pickups, setPickups] = useState([]);

  // Fetch data from backend APIs
  useEffect(() => {
    refreshStats();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAction = (action) => {
    showNotification('success', `${action} completed successfully`);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Handler to remove a donation
  const handleRemoveDonation = async (donationId) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/donations/${donationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      showNotification('success', 'Donation removed successfully');
      refreshStats();
    } catch (error) {
      showNotification('error', 'Failed to remove donation');
    }
  };

  // Function to refresh all stats and data automatically
  const refreshStats = async () => {
    try {
      const usersCountResponse = await fetchUsersCount();
      const totalUsersCount = usersCountResponse.data;

      const donationsCountResponse = await fetchDonationsCount();
      const totalDonationsCount = donationsCountResponse.data;

      const pickupsCountResponse = await fetchPickupsCount();
      const totalPickupsCount = pickupsCountResponse.data;

      const usersResponse = await fetchUsers();
      const usersData = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : usersResponse.data.users || [];
      setUsers(usersData);

      const donationsResponse = await fetchDonations();
      const rawDonationsData = Array.isArray(donationsResponse.data)
        ? donationsResponse.data
        : donationsResponse.data.donations || [];
      const donationsData = rawDonationsData.map((donation) => ({
        id: donation.id,
        name: donation.foodItem ? donation.foodItem.name : 'Unknown',
        donor: donation.donor ? donation.donor.name || donation.donor.username : 'Unknown',
        quantity: donation.foodItem ? donation.foodItem.quantity : 'N/A',
        location: donation.foodItem ? donation.foodItem.pickupLocation : 'Unknown',
        status: donation.claimedAt ? 'claimed' : 'available',
        foodItemId: donation.foodItem ? donation.foodItem.id : null
      }));
      setDonations(donationsData);

      const pickupsResponse = await fetchPickups();
      const pickupsData = Array.isArray(pickupsResponse.data)
        ? pickupsResponse.data
        : pickupsResponse.data.pickups || [];
      setPickups(pickupsData);

      setStats({
        totalUsers: totalUsersCount,
        totalDonations: totalDonationsCount,
        totalPickups: totalPickupsCount
      });

      showNotification('success', 'Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing stats:', error);
      showNotification('error', 'Failed to refresh data');
    }
  };

  const [settings, setSettings] = useState({
    database: { backup: false, clearCache: true, reset: false },
    notifications: { email: false, sms: true, reports: false },
    security: { twoFactor: true, autoLogout: true, ipWhitelist: false }
  });

  const toggleSetting = (category, key) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        [key]: !prevSettings[category][key]
      }
    }));
  };

  return (
    <div className="admin-dashboard">
      {/* Notification System */}
      {notification && (
        <motion.div
          className={`notification ${notification.type}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {notification.message}
        </motion.div>
      )}

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage and monitor the SustainShare platform</p>
          </div>
          <button className="refresh-button" onClick={refreshStats}>
            <FaSync /> Refresh Data
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaChartLine /> Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUsers /> Users
        </button>
        <button
          className={`tab-button ${activeTab === 'donations' ? 'active' : ''}`}
          onClick={() => setActiveTab('donations')}
        >
          <FaUtensils /> Donations
        </button>
        <button
          className={`tab-button ${activeTab === 'pickups' ? 'active' : ''}`}
          onClick={() => setActiveTab('pickups')}
        >
          <FaTruck /> Pickups
        </button>
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FaCog /> Settings
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
              <div className="stat-card">
                <h3>{stats.totalDonations}</h3>
                <p>Food Donations</p>
              </div>
              <div className="stat-card">
                <h3>{stats.totalPickups}</h3>
                <p>Scheduled Pickups</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="users-management">
            <h2>User Management</h2>
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="users-list">
              {filteredUsers.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-info">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                  </div>
                  <div className="user-actions">
                    <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                    <button className="view-button">
                      <FaEye /> View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'donations' && (
          <div className="donations-management">
            <h2>Donation Management</h2>
            <div className="donations-list">
              {donations.map((donation) => (
                <div key={donation.id} className="donation-card">
                  <div className="donation-status">
                    <span className="status-badge">{donation.status}</span>
                  </div>
                  <div className="donation-info">
                    <h4>{donation.name}</h4>
                    <p>Donor: {donation.donor}</p>
                    <p>Quantity: {donation.quantity} servings</p>
                    <p>Location: {donation.location}</p>
                  </div>
                  <div className="donation-actions">
                    <button className="view-button">
                      <FaEye /> View
                    </button>
                    <button
                      className="remove-button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveDonation(donation.id);
                      }}
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pickups' && (
          <div className="pickups-management">
            <h2>Pickup Management</h2>
            <div className="pickups-list">
              {Array.isArray(pickups) ? (
                pickups.map((pickup) => {
                  // If pickup.food or pickup.charity is an object, display a string property
                  const foodName = typeof pickup.food === 'object' && pickup.food !== null ? (pickup.food.name || pickup.food.foodName || 'Unknown') : pickup.food;
                  const charityName = typeof pickup.charity === 'object' && pickup.charity !== null ? (pickup.charity.name || pickup.charity.username || 'Unknown') : pickup.charity;
                  const scheduled = pickup.scheduled || pickup.scheduledTime || pickup.time || 'Unknown';
                  const location = pickup.location || (pickup.food && pickup.food.pickupLocation) || 'Unknown';
                  return (
                    <div key={pickup.id} className="pickup-card">
                      <div className="pickup-info">
                        <h4>{foodName}</h4>
                        <p>Charity: {charityName}</p>
                        <p>Scheduled: {scheduled}</p>
                        <p>Location: {location}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No pickups available</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-management">
            <h2>Platform Settings</h2>
            <div className="settings-section">
              <h3>Database Management</h3>
              <div className="setting-item">
                <input type="checkbox" checked={settings.database.backup} readOnly />
                <label>Backup Database</label>
              </div>
              <div className="setting-item">
                <input type="checkbox" checked={settings.database.clearCache} readOnly />
                <label>Clear Cache</label>
              </div>
              <div className="setting-item">
                <input type="checkbox" checked={settings.database.reset} readOnly />
                <label>Reset Platform</label>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
