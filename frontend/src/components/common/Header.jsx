// src/components/common/Header.jsx

import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import Navbar from './Navbar';

const Header = () => {
  const { currentUser, logout, isStaff } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="navbar">
        <Link to="/" className="logo">
          Chalkstone Council
        </Link>

        <Navbar />

        <div className="auth-buttons">
          {!currentUser ? (
            <>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          ) : (
            <div className="user-menu">
              <span className="username">
                Welcome, {currentUser.username}
                {isStaff() && <span className="staff-badge">Staff</span>}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
