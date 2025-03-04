// src/components/common/Navbar.jsx

import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, isStaff } = useContext(AuthContext);

  return (
    <nav className="nav-links">
      <NavLink to="/" className="nav-link">
        Home
      </NavLink>

      {currentUser && (
        <NavLink to="/report" className="nav-link">
          Report Issue
        </NavLink>
      )}

      {currentUser && isStaff() && (
        <NavLink to="/dashboard" className="nav-link">
          Dashboard
        </NavLink>
      )}

      <NavLink to="/about" className="nav-link">
        About
      </NavLink>
    </nav>
  );
};

export default Navbar;

