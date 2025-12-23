import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaClock, FaCheckCircle, FaSignOutAlt, FaUser, FaChevronDown, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import './CharityDashboard.css';

import { AuthContext } from '../contexts/AuthContext';

const CharityDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [donations, setDonations] = useState([]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sample stats data
  const stats = {
    totalClaimed: 4,
    completed: 3,
    peopleServed: 15,
    activePickups: 4
  };

  // Helper to attach donor username/name using donation logs (preferred) and donorId lookup (fallback)
  const enrichDonorInfo = async (items) => {
    try {
      const list = Array.isArray(items) ? items : [];
      // 1) Use donation logs to map foodItem.id -> donor user
      let logs = [];
      try {
        const logsRes = await axios.get('http://localhost:8080/api/donations');
        logs = Array.isArray(logsRes.data) ? logsRes.data : [];
      } catch {}
      const foodIdToDonor = new Map();
      for (const l of logs) {
        if (l && l.foodItem && l.foodItem.id && l.donor) {
          foodIdToDonor.set(l.foodItem.id, l.donor);
        }
      }

      // 2) Collect donorIds still missing from logs for direct user fetch
      const missingIds = new Set(
        list
          .filter(it => !foodIdToDonor.has(it.id) && it.donorId)
          .map(it => it.donorId)
      );
      const fetchedUsers = new Map();
      if (missingIds.size) {
        const requests = Array.from(missingIds).map(id => axios.get(`http://localhost:8080/api/users/${id}`).catch(() => null));
        const responses = await Promise.all(requests);
        responses.forEach(r => {
          if (r && r.data && r.data.id) fetchedUsers.set(r.data.id, r.data);
        });
      }

      // 3) Build enriched items
      return list.map(it => {
        const userFromLog = foodIdToDonor.get(it.id);
        const userFromId = it.donorId ? fetchedUsers.get(it.donorId) : null;
        const u = userFromLog || userFromId || null;
        return {
          ...it,
          donorUsername: u?.username || null,
          donorName: u?.name || null,
        };
      });
    } catch {
      return items;
    }
  };

  // Load available donations from backend
  const loadAvailable = async () => {
    setIsLoading(true);
    try {
      // Preferred: ask backend for already-filtered available items
      const res = await axios.get('http://localhost:8080/api/food/available');
      let items = (res.data || []).map(fi => ({
        id: fi.id,
        foodName: fi.name,
        quantity: fi.quantity,
        location: fi.pickupLocation,
        bestBefore: fi.expiryTime,
        status: 'available',
        donorId: fi.donorId || null,
      }));
      
      // If server returns empty but there are actually items, compute availability client-side
      if (!items.length) {
        try {
          const [foodRes, logsRes] = await Promise.all([
            axios.get('http://localhost:8080/api/food'),
            axios.get('http://localhost:8080/api/donations')
          ]);
          const claimedIds = new Set(
            (logsRes.data || [])
              .filter(l => l.foodItem && l.charity && l.claimedAt)
              .map(l => l.foodItem.id)
          );
          items = (foodRes.data || [])
            .filter(fi => !claimedIds.has(fi.id))
            .map(fi => ({
              id: fi.id,
              foodName: fi.name,
              quantity: fi.quantity,
              location: fi.pickupLocation,
              bestBefore: fi.expiryTime,
              status: 'available',
              donorId: fi.donorId || null,
            }));
        } catch (subErr) {
          console.warn('Fallback load from /api/food failed', subErr);
        }
      }

      // Final fallback: merge in any locally stored donations (in case backend is down or delayed)
      try {
        const local = JSON.parse(localStorage.getItem('donations') || '[]');
        if (Array.isArray(local) && local.length) {
          const localMapped = local.map(d => ({
            id: d.id,
            foodName: d.foodName || d.name,
            quantity: Number(d.quantity) || 0,
            location: d.location || d.pickupLocation,
            bestBefore: d.bestBefore || d.expiryTime || null,
            status: d.status || 'available',
            donorId: d.donorId || null,
          }));
          // De-duplicate by id, preferring backend items over local ones
          const byId = new Map();
          for (const it of [...items, ...localMapped]) {
            if (!byId.has(it.id)) byId.set(it.id, it);
          }
          items = Array.from(byId.values());
        }
      } catch (e) {
        // ignore localStorage parse errors
      }
      const enriched = await enrichDonorInfo(items);
      setDonations(enriched);
    } catch (e1) {
      console.warn('Available endpoint failed, falling back to /api/food + client-side filter', e1);
      try {
        const [foodRes, logsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/food'),
          axios.get('http://localhost:8080/api/donations')
        ]);
        const claimedIds = new Set(
          (logsRes.data || [])
            .filter(l => l.foodItem && l.charity && l.claimedAt)
            .map(l => l.foodItem.id)
        );
        let items = (foodRes.data || [])
          .filter(fi => !claimedIds.has(fi.id))
          .map(fi => ({
            id: fi.id,
            foodName: fi.name,
            quantity: fi.quantity,
            location: fi.pickupLocation,
            bestBefore: fi.expiryTime,
            status: 'available',
            donorId: fi.donorId || null,
          }));
        // As above, include localStorage as a last resort and de-dupe
        let finalItems = items;
        try {
          const local = JSON.parse(localStorage.getItem('donations') || '[]');
          if (Array.isArray(local) && local.length) {
            const localMapped = local.map(d => ({
              id: d.id,
              foodName: d.foodName || d.name,
              quantity: Number(d.quantity) || 0,
              location: d.location || d.pickupLocation,
              bestBefore: d.bestBefore || d.expiryTime || null,
              status: d.status || 'available',
              donorId: d.donorId || null,
            }));
            const byId = new Map();
            for (const it of [...items, ...localMapped]) {
              if (!byId.has(it.id)) byId.set(it.id, it);
            }
            finalItems = Array.from(byId.values());
          }
        } catch {}
        const enriched = await enrichDonorInfo(finalItems);
        setDonations(enriched);
      } catch (e2) {
        console.error('Failed to load food from backend', e2);
        // Even if backend fails totally, try to show localStorage donations so page isn't empty
        try {
          const local = JSON.parse(localStorage.getItem('donations') || '[]');
          const localMapped = (local || []).map(d => ({
            id: d.id,
            foodName: d.foodName || d.name,
            quantity: Number(d.quantity) || 0,
            location: d.location || d.pickupLocation,
            bestBefore: d.bestBefore || d.expiryTime || null,
            status: d.status || 'available',
            donorId: d.donorId || null,
          }));
          const enriched = await enrichDonorInfo(localMapped);
          setDonations(enriched);
        } catch {
          setDonations([]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load donations only once when the page loads
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await loadAvailable();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // New function to create PickupSchedule
  const createPickupSchedule = async (pickupSchedule) => {
    try {
      const response = await axios.post('http://localhost:8080/api/pickups', pickupSchedule);
      return response.data;
    } catch (error) {
      console.error('Error creating pickup schedule:', error);
      setNotification({
        type: 'error',
        message: 'Failed to create pickup schedule. Please try again.'
      });
      setTimeout(() => setNotification(null), 3000);
      throw error;
    }
  };

  const handleClaimDonation = async (id) => {
    try {
      // Prompt user for user ID and location
      const enteredUserId = window.prompt("Enter your user ID:");
      if (!enteredUserId || enteredUserId.trim() === "") {
        alert("User ID is required to claim donation.");
        return;
      }
      const enteredLocation = window.prompt("Enter your location:");
      if (!enteredLocation || enteredLocation.trim() === "") {
        alert("Location is required to claim donation.");
        return;
      }
      const enteredPhone = window.prompt("Enter your phone number:");
      if (!enteredPhone || enteredPhone.trim() === "") {
        alert("Phone number is required to claim donation.");
        return;
      }

      // Validate user ID by calling backend API
      const userResponse = await axios.get(`http://localhost:8080/api/users/${enteredUserId}`);
      const userData = userResponse.data;
      if (!userData) {
        alert("Invalid user ID. Please enter a valid user ID.");
        return;
      }

      // Validate phone number matches backend user record
      const normalizePhone = (p) => (p || '').replace(/[^0-9]/g, '');
      if (normalizePhone(enteredPhone) !== normalizePhone(userData.phone)) {
        alert("Phone number does not match our records. Please enter the correct phone number.");
        return;
      }

      // Find the donation being claimed
      const donation = donations.find(d => d.id === id);
      if (!donation) return;

      // Use backend claim endpoint which enforces single-claim semantics
      try {
        await axios.post(`http://localhost:8080/api/donations/claim/${donation.id}`, { charityId: parseInt(enteredUserId) });
      } catch (err) {
        if (err.response && err.response.status === 409) {
          setNotification({ type: 'error', message: 'This food has already been claimed by another charity.' });
          setTimeout(() => setNotification(null), 3000);
          return;
        }
        throw err;
      }

      // Create PickupSchedule entry
      const pickupSchedule = {
        scheduledTime: new Date().toISOString(),
        status: 'Scheduled',
        foodItem: { id: donation.id },
        charity: { id: parseInt(enteredUserId) }
      };
      await createPickupSchedule(pickupSchedule);

      setNotification({ type: 'success', message: 'Donation claimed and pickup scheduled successfully!' });

      // Notify donor via localStorage so DonorDashboard can show a toast
      try {
        const claim = {
          id: `${donation.id}-${Date.now()}`,
          type: 'food_claimed',
          donationId: donation.id,
          foodName: donation.foodName,
          donorId: donation.donorId || null,
          charityId: parseInt(enteredUserId),
          charityName: userData.name || userData.username || `User ${enteredUserId}`,
          charityLocation: enteredLocation,
          charityPhone: enteredPhone,
          timestamp: new Date().toISOString(),
          displayed: false
        };
        const existing = JSON.parse(localStorage.getItem('claimNotifications') || '[]');
        existing.push(claim);
        localStorage.setItem('claimNotifications', JSON.stringify(existing));
      } catch {}

      // Update the local state to reflect the claimed status
      setDonations(prevDonations => 
        prevDonations.map(d => 
          d.id === id ? { ...d, status: 'claimed' } : d
        )
      );
      
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error claiming donation:', error);
      setNotification({
        type: 'error',
        message: 'Failed to claim donation. Please try again.'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleUnclaimDonation = async (id) => {
    try {
      // Find the donation being unclaimed
      const donation = donations.find(d => d.id === id);
      if (!donation) return;

      // Find the existing donation log for this food item
      const donationLogs = await axios.get('http://localhost:8080/api/donations');
      const existingLog = donationLogs.data.find(log =>
        log.foodItem && log.foodItem.id === donation.id
      );

      if (existingLog) {
        // Update existing log to remove charity and claimedAt
        const updatedLog = {
          ...existingLog,
          charity: null,
          claimedAt: null
        };
        await axios.put(`http://localhost:8080/api/donations/${existingLog.id}`, updatedLog);
      } else {
        // No existing log found, nothing to unclaim
        setNotification({
          type: 'error',
          message: 'No existing claim found to unclaim.'
        });
        setTimeout(() => setNotification(null), 3000);
        return;
      }

      setNotification({
        type: 'success',
        message: 'Donation unclaimed successfully!'
      });

      // Update the local state to reflect the available status
      setDonations(prevDonations => 
        prevDonations.map(d => 
          d.id === id ? { ...d, status: 'available' } : d
        )
      );
      
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error unclaiming donation:', error);
      setNotification({
        type: 'error',
        message: 'Failed to unclaim donation. Please try again.'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleRemoveDonation = async (id) => {
    if (window.confirm("Are you sure you want to remove this donation?")) {
      try {
        // Delete from backend
        await axios.delete(`http://localhost:8080/api/food/${id}`);

        // Update the local state to remove the donation
        setDonations(prevDonations =>
          prevDonations.filter(donation => donation.id !== id)
        );

        setNotification({
          type: 'success',
          message: 'Donation removed successfully!'
        });
        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        console.error('Error removing donation:', error);
        setNotification({
          type: 'error',
          message: 'Failed to remove donation. Please try again.'
        });
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    window.location.href = '/login';
  };

  // Filter donations based on search query
  const filteredDonations = donations.filter(donation =>
    (donation.foodName && donation.foodName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (donation.location && donation.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Navigate to map with donor location and charity location
  const handleViewLocation = (donorLocation, charityLocation) => {
    if (!donorLocation || donorLocation.trim() === '') {
      alert('Donor location is missing or invalid.');
      return;
    }
    navigate("/mapview", { 
      state: { 
        donorLocation: donorLocation,
        charityLocation: charityLocation || "Charity location not available"
      } 
    });
  };

  return (
    <div className="charity-dashboard">
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

      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Welcome, {currentUser ? currentUser.name : 'Charity User'}!</h1>
            <p>Help distribute food to those who need it most in your community</p>
          </div>
          {/* Removed profile section as per user request */}
        </div>
      </header>

      {/* Stats Overview */}
      <section className="stats-overview">
        <div className="stat-card">
          <h3>{stats.totalClaimed}</h3>
          <p>Total Claimed</p>
        </div>
        <div className="stat-card">
          <h3>{stats.completed}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-card">
          <h3>{stats.peopleServed}</h3>
          <p>People Served</p>
        </div>
        <div className="stat-card">
          <h3>{stats.activePickups}</h3>
          <p>Active Pickups</p>
        </div>
      </section>

      {/* Available Donations */}
      <section className="donations-section">
        <h2>Available Food Donations</h2>
        
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search food or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="loading-state">
            <p>Loading donations...</p>
          </div>
        ) : (
          <div className="donations-list">
            {filteredDonations.length > 0 ? (
              filteredDonations.map(donation => (
                <div key={donation.id} className="donation-card">
                  <div className="donation-info">
                    <h4>{donation.foodName}</h4>
                    <p className="quantity">Quantity: {donation.quantity}</p>
                    <p className="donor">Donor: {donation.donorUsername || donation.donorName || 'Unknown'}</p>
                    <p className="location">
                      <FaMapMarkerAlt /> {donation.location}
                    </p>
                    <p className="time">
                      <FaClock /> Best before {donation.bestBefore && !isNaN(Date.parse(donation.bestBefore)) ? new Date(donation.bestBefore).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="donation-actions">
                    {donation.status === 'available' ? (
                      <>
                        <button
                          className="claim-button"
                          onClick={() => handleClaimDonation(donation.id)}
                        >
                          <FaCheckCircle /> Claim
                        </button>
                        <button
                          className="remove-button"
                          onClick={() => handleRemoveDonation(donation.id)}
                        >
                          <FaTrash /> Remove
                        </button>
                      </>
                    ) : donation.status === 'claimed' ? (
                      <>
                        <button
                          className="unclaim-button"
                          onClick={() => handleUnclaimDonation(donation.id)}
                        >
                          Unclaim
                        </button>
                        <button
                          className="remove-button"
                          onClick={() => handleRemoveDonation(donation.id)}
                        >
                          <FaTrash /> Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="claimed-button" disabled>
                          Claimed
                        </button>
                        <button
                          className="remove-button"
                          onClick={() => handleRemoveDonation(donation.id)}
                        >
                          <FaTrash /> Remove
                        </button>
                      </>
                    )}
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
                <p>No available donations matching your search</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default CharityDashboard;