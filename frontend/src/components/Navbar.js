import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaHome } from 'react-icons/fa';
import './Navbar.css';
import { AuthContext } from '../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { currentUser, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);

  // Check if on a dashboard route or mapview route
  const isDashboardOrMap = location.pathname.includes('/donor') ||
                     location.pathname.includes('/charity') ||
                     location.pathname.includes('/admin') ||
                     location.pathname === '/mapview';

  const handleMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => setShowDropdown(false), 300);
    setDropdownTimeout(timeout);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="brand-link">
          <img
            src="/logo.png"
            alt="SustainShare Logo"
            className="logo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/logo.jpg"; // Fallback to JPG if PNG not found
            }}
          />
          <span className="brand-name">SustainShare</span>
        </Link>
      </div>

      <div className="navbar-right">
        {!isDashboardOrMap ? (
          <>
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              <FaHome className="nav-icon" /> Home
            </Link>
            <Link to="/signup" className={`nav-link ${location.pathname === '/signup' ? 'active' : ''}`}>
              <FaUserPlus className="nav-icon" /> Sign Up
            </Link>
            <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
              <FaSignInAlt className="nav-icon" /> Login
            </Link>
          </>
        ) : (
          <>
            <div
              className="profile-menu"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="profile-icon">
                <FaUser />
              </div>
              {showDropdown && (
                <div
                  className="dropdown-menu"
                  style={{ right: 0, left: 'auto' }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="dropdown-item user-id-display">
                    User ID: {currentUser ? currentUser.id : 'N/A'}
                  </div>
                  <button
                    className="dropdown-item logout-button"
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                      window.location.href = '/login';
                    }}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
