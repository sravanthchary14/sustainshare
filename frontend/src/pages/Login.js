import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import { loginUser } from '../services/authService';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);

    // Trim email and password before sending
    const trimmedFormData = {
      email: formData.email.trim(),
      password: formData.password.trim()
    };

    try {
      const response = await loginUser(trimmedFormData);
      setIsLoading(false);
      console.log(response.data);
      if (response && response.data) {
        const userData = response.data;
        login(userData); // store user data in context
        setNotification({
          type: 'success',
          message: 'Login successful! Redirecting...'
        });
        // Redirect based on role
        const role = userData.role.toLowerCase();
        let redirectPath = '/donor-dashboard'; // default
        if (role === 'charity') {
          redirectPath = '/charity-dashboard';
        } else if (role === 'admin') {
          redirectPath = '/admin-dashboard';
        }
        setTimeout(() => {
          navigate(redirectPath);
        }, 1000);
      } else {
        setNotification({
          type: 'error',
          message: 'Login failed. Please check your credentials.'
        });
      }
    } catch (error) {
      setIsLoading(false);
      setNotification({
        type: 'error',
        message: 'Login failed. Please check your credentials.'
      });
    }
  };

  const handleDemoLogin = (role) => {
    // Fill in the email and password fields automatically for demo
    const demoCredentials = {
      donor: { email: 'donor@example.com', password: 'donorpass' },
      charity: { email: 'charity@example.com', password: 'charitypass' },
      admin: { email: 'admin@example.com', password: 'adminpass' }
    };
    const creds = demoCredentials[role.toLowerCase()];
    if (creds) {
      setFormData({ email: creds.email, password: creds.password });
      setDemoMode(true);
      setShowPassword(false);
      setNotification({
        type: 'info',
        message: `Credentials filled for ${role} demo. Please click Sign In to proceed.`
      });
    } else {
      setNotification({
        type: 'error',
        message: `No demo credentials found for role: ${role}`
      });
    }
  };

  return (
    <div className="login-container">
      {/* Notification System */}
      {notification && (
        <motion.div
          className={`notification ${notification.type}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          onAnimationComplete={() => {
            setTimeout(() => {
              setNotification(null);
            }, 3000);
          }}
        >
          {notification.message}
        </motion.div>
      )}

      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue your journey with SustainShare</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type={demoMode ? "password" : (showPassword ? "text" : "password")}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : '+ Sign In'}
          </button>
        </form>

        <div className="demo-access">
          <p>Quick Demo Access</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-button"
              onClick={() => handleDemoLogin('donor')}
            >
              Try as Donor
            </button>
            <button
              type="button"
              className="demo-button"
              onClick={() => handleDemoLogin('charity')}
            >
              Try as Charity
            </button>
            <button
              type="button"
              className="demo-button"
              onClick={() => handleDemoLogin('admin')}
            >
              Try as Admin
            </button>
          </div>
        </div>

        <div className="login-footer">
          <div className="footer-links">
            <Link to="/signup">Don't have an account? Create one here</Link>
            <Link to="/forgot-password">Forgot your password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;