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

  // Debug display to show authentication state
  const showDebugInfo = process.env.NODE_ENV === 'development';

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

      {/* Debug info section - Only shown in development */}
      {showDebugInfo && (
        <div className="debug-info">
          <details>
            <summary>Debug Auth Info</summary>
            <pre>
              {JSON.stringify({
                currentUser,
                isStaff: isStaff(),
                hasToken: !!localStorage.getItem('token')
              }, null, 2)}
            </pre>
          </details>
          <style jsx>{`
            .debug-info {
              background-color: #f8f9fa;
              border-top: 1px solid #dee2e6;
              padding: 0.5rem 1rem;
              font-size: 0.875rem;
              color: #6c757d;
            }

            .debug-info summary {
              cursor: pointer;
              user-select: none;
            }

            .debug-info pre {
              margin-top: 0.5rem;
              white-space: pre-wrap;
              word-break: break-all;
            }
          `}</style>
        </div>
      )}
    </header>
  );
};

export default Header;
