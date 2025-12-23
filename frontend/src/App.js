import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DonorDashboard from './pages/DonorDashboard';
import CharityDashboard from './pages/CharityDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TrackPickup from './pages/TrackPickup';
import 'leaflet/dist/leaflet.css';
import { AuthProvider } from './contexts/AuthContext';
import Signup from './pages/Signup';
import Login from './pages/Login';
import AvailableFood from './pages/AvailableFood';
import FoodList from './components/FoodList';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MapView from './components/MapView';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DonorDashboard />} />
          <Route path="/donor-dashboard" element={<DonorDashboard />} />
          <Route path="/charity-dashboard" element={<CharityDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/available-food" element={<AvailableFood />} />
          <Route path="/foodlist" element={<FoodList />} />
          <Route path="/track/:donationId" element={<TrackPickup />} />
          <Route path="/mapview" element={<MapView />} />
        </Routes>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
