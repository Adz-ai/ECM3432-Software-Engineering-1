// src/components/common/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h3>Chalkstone Council</h3>
          <p>Working together for a better community</p>
        </div>

        <div className="footer-links">
          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/report">Report Issue</Link></li>
              <li><Link to="/about">About</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Us</h4>
            <ul>
              <li>Chalkstone Council</li>
              <li>123 Main Street</li>
              <li>Chalkstone, EX1 1AA</li>
              <li>Email: info@chalkstone.gov.uk</li>
              <li>Phone: +44 (0)1234 567890</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Chalkstone Council. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
