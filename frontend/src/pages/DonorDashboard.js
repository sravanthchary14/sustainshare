import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaUtensils, FaChartLine, FaMapMarkerAlt, FaSignOutAlt, FaUser, FaChevronDown, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import './DonorDashboard.css';
import { AuthContext } from '../contexts/AuthContext';

const DonorDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('post');
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [donations, setDonations] = useState(() => {
    // Load donations from localStorage on initial render
    const savedDonations = localStorage.getItem("donations");
    return savedDonations ? JSON.parse(savedDonations) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // State for stats counters
  const [stats, setStats] = useState({
    totalDonations: 0,
    peopleHelped: 0,
    foodSaved: 0
  });

  // Function to update stats based on donations
  const updateStats = (donationsList) => {
    const totalDonations = donationsList.length;
    const peopleHelped = donationsList.length; // Assuming 1 person helped per donation, adjust as needed
    const foodSaved = donationsList.reduce((sum, donation) => sum + Number(donation.quantity || 0), 0);

    setStats({
      totalDonations,
      peopleHelped,
      foodSaved
    });
  };

  useEffect(() => {
    updateStats(donations);
  }, [donations]);

  // Listen for claim notifications written by CharityDashboard
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const raw = localStorage.getItem('claimNotifications');
        if (!raw) return;
        const claims = JSON.parse(raw);
        if (!Array.isArray(claims) || !claims.length) return;

        const myDonorId = currentUser?.id || null;
        let changed = false;
    for (const c of claims) {
          if (c.displayed) continue;
          // Show only if matches this donor (fallback to show if donorId unknown)
          if (!c.donorId || (myDonorId && String(c.donorId) === String(myDonorId))) {
      const msg = `Food '${c.foodName}' is claimed by ${c.charityName}. Location: ${c.charityLocation}. Phone: ${c.charityPhone}`;
      toast.info(msg, { autoClose: 4000 });
            c.displayed = true;
            changed = true;

            // Persist charity info onto the donor's local donations list
            setDonations(prev => {
              const updated = prev.map(d =>
                String(d.id) === String(c.donationId)
                  ? {
                      ...d,
                      status: 'claimed',
                      charityLocation: c.charityLocation,
                      charityPhone: c.charityPhone,
                      claimedByName: c.charityName
                    }
                  : d
              );
              try { localStorage.setItem('donations', JSON.stringify(updated)); } catch {}
              return updated;
            });
          }
        }
        if (changed) {
          localStorage.setItem('claimNotifications', JSON.stringify(claims));
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const [foodForm, setFoodForm] = useState({
    foodName: '',
    quantity: '',
    location: '',
    expiryTime: '',
    donorId: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFoodForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
  const donorIdVal = foodForm.donorId ? Number(foodForm.donorId) : (currentUser?.id || null);
      // Prompt for phone number verification
      // const enteredPhone = window.prompt("Please enter your phone number for verification:");
      // if (!enteredPhone || enteredPhone.trim() === "") {
      //   alert("Phone number is required for verification.");
      //   setIsSubmitting(false);
      //   return;
      // }

      // Validate phone number against current user
      // Normalize phone numbers by removing spaces, dashes, parentheses, and plus signs
      const normalizePhone = (phone) => phone.replace(/[\s\-()+]/g, '');

      // Remove usage of enteredPhone since prompt is disabled
      // if (normalizePhone(enteredPhone.trim()) !== normalizePhone(currentUser?.phone || '')) {
      //   alert("Phone number does not match our records. Please enter the correct phone number.");
      //   setIsSubmitting(false);
      //   return;
      // }

      // Create food item first
      const foodItem = {
        name: foodForm.foodName,
        quantity: Number(foodForm.quantity),
        pickupLocation: foodForm.location,
        expiryTime: foodForm.expiryTime,
  donorId: donorIdVal,
        donorPhone: currentUser?.phone
      };

      // Save food item to backend
      const foodResponse = await axios.post('http://localhost:8080/api/food', foodItem);
      const savedFoodItem = foodResponse.data;

      // Create donation log entry
      const donationLog = {
  donor: { id: donorIdVal || 1 }, // fallback to 1 if not provided
        charity: null, // No charity assigned yet
        foodItem: savedFoodItem,
        donatedAt: new Date().toISOString()
      };

      // Save donation log to backend
      await axios.post('http://localhost:8080/api/donations', donationLog);

      // Create local donation for UI display
      const newDonation = {
        ...foodForm,
        location: foodForm.location,
        id: savedFoodItem.id,
  date: new Date().toLocaleDateString(),
  bestBefore: foodForm.expiryTime,
        status: 'available',
  donorId: donorIdVal || 1 // Add donorId for reference
      };

      const updatedDonations = [...donations, newDonation];
      setDonations(updatedDonations);

      // 🔹 Save to localStorage so CharityDashboard can read it
      localStorage.setItem("donations", JSON.stringify(updatedDonations));

      setFoodForm({
        foodName: '',
        quantity: '',
        location: '',
        expiryTime: '',
        donorId: ''
      });
      setShowFoodForm(false);
      setActiveTab('manage');

      // Show success message
      // alert('Food donation posted successfully!');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error posting donation:', error);
      alert('Failed to post donation. Please try again.');
      setIsSubmitting(false);
    }
  };

  // 🔹 Navigate to map with donor location
  const handleViewLocation = (donorLocation, charityLocation = null) => {
    if (!donorLocation || donorLocation.trim() === '') {
      alert('Donor location is missing or invalid.');
      return;
    }
    if (charityLocation && charityLocation.trim() === '') {
      charityLocation = null;
    }
    navigate("/mapview", {
      state: {
        donorLocation: donorLocation,
        charityLocation: charityLocation || "Charity location not available"
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    window.location.href = '/login';
  };

  // Add a button to navigate to charity dashboard map view for donor
  const handleViewCharityLocation = () => {
    navigate("/mapview", {
      state: {
        donorLocation: "Your Location", // or some default donor location
        charityLocation: "Charity location not available - select a specific donation to view distance"
      }
    });
  };

  const filteredDonations = donations.filter(donation =>
    donation.foodName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const claimedDonations = donations.filter(d => d.status === 'claimed' || d.charityPhone || d.claimedByName);

  const handleDeleteDonation = (id) => {
    if (window.  confirm("Are you sure you want to delete this donation?")) {
      const updatedDonations = donations.filter(donation => donation.id !== id);
      setDonations(updatedDonations);
      localStorage.setItem("donations", JSON.stringify(updatedDonations));
    }
  };

  return (
    <div className="donor-dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Welcome back, Donor!</h1>
            <p>Make a difference today by sharing surplus food with those in need</p>
          </div>
          {/* Removed profile section as per user request */}
        </div>
      </header>

      {/* Stats Overview */}
      <section className="stats-overview">
        <div className="stat-card">
          <h3>{stats.totalDonations}</h3>
          <p>Total Donations</p>
        </div>
        <div className="stat-card">
          <h3>{stats.peopleHelped}</h3>
          <p>People Helped</p>
        </div>
        <div className="stat-card">
          <h3>{stats.foodSaved}</h3>
          <p>Qty Saved</p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'post' ? 'active' : ''}`}
          onClick={() => setActiveTab('post')}
        >
          <FaPlus /> Post Food
        </button>
        <button
          className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          <FaUtensils /> Manage Donations
        </button>
        <button
          className={`tab-button ${activeTab === 'claimed' ? 'active' : ''}`}
          onClick={() => setActiveTab('claimed')}
        >
          <FaCheckCircle /> Claimed Food
        </button>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FaChartLine /> Analytics
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {activeTab === 'post' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="post-food-section"
          >
            <h2>Sustainability</h2>
            <form onSubmit={handleSubmitDonation} className="food-form">
              <div className="form-group">
                <input
                  type="text"
                  name="foodName"
                  placeholder="Food name"
                  value={foodForm.foodName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="quantity"
                  placeholder="Quantity"
                  value={foodForm.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="location"
                  placeholder="Pickup Location"
                  value={foodForm.location}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="datetime-local"
                  name="expiryTime"
                  placeholder="Expiry Time"
                  value={foodForm.expiryTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="donorId"
                  placeholder="Donor ID"
                  value={foodForm.donorId}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Post Food'}
              </button>
            </form>
          </motion.div>
        )}

      {activeTab === 'manage' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="manage-donations"
          >
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search your donations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredDonations.length > 0 ? (
              <div className="donations-list">
                <h3>Active Donations</h3>
                {filteredDonations.map(donation => (
                  <div key={donation.id} className="donation-card">
                <div className="donation-info">
                  <h4>{donation.foodName}</h4>
                  <p><strong>Quantity:</strong> {donation.quantity} servings</p>
                  <p><strong>Pickup Location:</strong> {donation.location}</p>
                  <p><strong>Best Before:</strong> {donation.bestBefore}</p>
                  <p><strong>Donor ID:</strong> {donation.donorId || 'N/A'}</p>
                  {donation.claimedByName && (
                    <p><strong>Claimed By:</strong> {donation.claimedByName}</p>
                  )}
                  {donation.charityLocation && (
                    <p><strong>Charity Location:</strong> {donation.charityLocation}</p>
                  )}
                  {donation.charityPhone && (
                    <p><strong>Charity Phone:</strong> {donation.charityPhone}</p>
                  )}
                </div>
                <div className="donation-actions">
                  <button
                    className="view-button"
                    onClick={() => handleViewLocation(donation.location, donation.charityLocation)}
                  >
                    <FaMapMarkerAlt /> View Location
                  </button>
                  <button className="delete-button" onClick={() => handleDeleteDonation(donation.id)}>Delete</button>
                </div>
                  </div>
                ))}
                <button
                  className="view-charity-button"
                  onClick={handleViewCharityLocation}
                >
                  <FaMapMarkerAlt /> View Charity Location
                </button>
              </div>
            ) : (
              <div className="empty-state">
                <h3>No donations found</h3>
                <p>Start by posting your first food donation!</p>
                <button
                  className="post-food-button"
                  onClick={() => setActiveTab('post')}
                >
                  <FaPlus /> Post Food
                </button>
              </div>
            )}
          </motion.div>
        )}

      {activeTab === 'claimed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="manage-donations"
          >
            <div className="donations-list">
              <h3>Claimed Donations</h3>
              {claimedDonations.length > 0 ? (
                claimedDonations.map(donation => (
                  <div key={donation.id} className="donation-card">
                    <div className="donation-info">
                      <h4>{donation.foodName}</h4>
                      <p><strong>Quantity:</strong> {donation.quantity} servings</p>
                      <p><strong>Pickup Location:</strong> {donation.location}</p>
                      {donation.bestBefore && (
                        <p><strong>Best Before:</strong> {donation.bestBefore}</p>
                      )}
                      {donation.claimedByName && (
                        <p><strong>Claimed By:</strong> {donation.claimedByName}</p>
                      )}
                      {donation.charityLocation && (
                        <p><strong>Charity Location:</strong> {donation.charityLocation}</p>
                      )}
                      {donation.charityPhone && (
                        <p><strong>Charity Phone:</strong> {donation.charityPhone}</p>
                      )}
                    </div>
                    <div className="donation-actions">
                      <button
                        className="view-button"
                        onClick={() => handleViewLocation(donation.location, donation.charityLocation)}
                      >
                        <FaMapMarkerAlt /> View Location
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No claimed donations yet</h3>
                  <p>Charity claims will appear here with their contact details.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="analytics-section"
          >
            <h2>Your Impact Analytics</h2>
            <div className="analytics-cards">
              <div className="analytics-card">
                <h3>Total Donations</h3>
                <p>{stats.totalDonations}</p>
              </div>
              <div className="analytics-card">
                <h3>People Helped</h3>
                <p>{stats.peopleHelped}</p>
              </div>
              <div className="analytics-card">
                <h3>Food Saved</h3>
                <p>{stats.foodSaved} kg</p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default DonorDashboard;
