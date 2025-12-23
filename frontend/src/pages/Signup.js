import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { registerUser, loginUser } from '../services/authService';
import { AuthContext } from '../contexts/AuthContext';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    accountType: 'donor'
  });
  const [showNotification, setShowNotification] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isLoading, setIsLoading] = useState(false); // ADD LOADING STATE

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    const strength = password.length > 8 ? 'strong' : password.length > 5 ? 'medium' : 'weak';
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => { // MAKE ASYNC
    e.preventDefault();
    setIsLoading(true); // START LOADING
    
    // Map frontend accountType to backend role values if needed
    let roleValue = formData.accountType;
    if (formData.accountType === 'admin') {
      roleValue = 'admin'; // Confirm backend expects 'admin' string
    } else if (formData.accountType === 'donor') {
      roleValue = 'donor';
    } else if (formData.accountType === 'charity') {
      roleValue = 'charity';
    }

    const userData = {
      name: formData.fullName,
      username: formData.username || formData.id, // Use ID if username empty
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: roleValue
    };

    try {
      // SEND DATA TO BACKEND
      await registerUser(userData);

      // LOGIN AFTER SIGNUP
      const loginData = {
        email: formData.email,
        password: formData.password
      };
      const loginResponse = await loginUser(loginData);
      const userDataResponse = loginResponse.data || loginResponse; // Adjust for axios response structure
      setCurrentUser(userDataResponse);
      localStorage.setItem('authToken', userDataResponse.token);
      localStorage.setItem('userData', JSON.stringify(userDataResponse));

      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        // Fix: Check if role exists before using toLowerCase
        const roleRoute = userDataResponse && userDataResponse.role ? userDataResponse.role.toLowerCase() + '-dashboard' : 'donor-dashboard';
        navigate(`/${roleRoute}`);
      }, 3000);
    } catch (error) {
      console.error('Signup failed:', error);
      alert('Signup failed! Please check console for details.');
    } finally {
      setIsLoading(false); // STOP LOADING
    }
  };

  return (
    <div className="signup-container">
      {/* Notification */}
      {showNotification && (
        <motion.div 
          className="notification"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
        >
          <FaCheckCircle className="notification-icon" />
          <div>
            <h3>Account created successfully!</h3>
            <p>Welcome to SustainShare</p>
          </div>
        </motion.div>
      )}

      <div className="signup-header">
        <h1>Sustainability</h1>
        <h2>Create your account and start making a difference today</h2>
      </div>

      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <label htmlFor="id">Choose a unique ID</label>
          <div className="input-with-icon">
            <FaUser className="input-icon" />
            <input
              type="text"
              id="id"
              name="id"
              placeholder=" enter id "
              value={formData.id}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="fullName">Your full name</label>
          <div className="input-with-icon">
            <FaUser className="input-icon" />
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="your name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="username">Username (optional)</label>
          <div className="input-with-icon">
            <FaUser className="input-icon" />
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Will use ID if empty"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <div className="input-with-icon">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your mail"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <div className="input-with-icon">
            <FaPhone className="input-icon" />
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-with-icon">
            <FaLock className="input-icon" />
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {passwordStrength && (
            <div className={`password-strength ${passwordStrength}`}>
              Password strength: {passwordStrength}
            </div>
          )}
        </div>

        <div className="form-group account-type">
          <label>Account Type</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="accountType"
                value="donor"
                checked={formData.accountType === 'donor'}
                onChange={handleChange}
              />
              <span>Food Donor (Restaurant/Individual)</span>
            </label>
            <label>
              <input
                type="radio"
                name="accountType"
                value="charity"
                checked={formData.accountType === 'charity'}
                onChange={handleChange}
              />
              <span>Charity Organization</span>
            </label>
            <label>
      <input
        type="radio"
        name="accountType"
        value="admin"
        checked={formData.accountType === 'admin'}
        onChange={handleChange}
      />
      <span>Admin</span>
      </label>
          </div>
        </div>

        <div className="form-footer">
          <p>By signing up, you agree to help reduce food waste and fight hunger</p>
          <button 
            type="submit" 
            className="signup-button"
            disabled={isLoading} // DISABLE BUTTON WHEN LOADING
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          <p className="login-link">
            Already have an account? <a href="/login">Sign in here</a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;