// src/pages/HomePage.jsx

import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import IssueMap from '../components/issues/IssueMap';

const HomePage = () => {
  const { currentUser } = useContext(AuthContext);

  // Debug log to check authentication state
  useEffect(() => {
    console.log('HomePage - Current user:', currentUser);
  }, [currentUser]);

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Chalkstone Council Issue Reporting</h1>
          <p>
            Help improve your community by reporting issues such as potholes,
            street lighting problems, graffiti, and more.
          </p>
          <div className="hero-buttons">
            {currentUser ? (
              <Link to="/report" className="btn btn-primary">
                Report an Issue
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Login to Report an Issue
              </Link>
            )}
            <Link to="/about" className="btn btn-secondary">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section className="map-section">
        <h2>Current Issues in the Area</h2>
        <p className="map-description">
          Explore the map to see reported issues in Chalkstone. Click on markers for more details.
        </p>
        <IssueMap />
      </section>

      <section className="issue-types-section">
        <h2>Types of Issues You Can Report</h2>
        <div className="issue-types-grid">
          <div className="issue-type-card">
            <div className="issue-icon pothole"></div>
            <h3>Potholes</h3>
            <p>Report road damage and potholes that need repair.</p>
          </div>
          <div className="issue-type-card">
            <div className="issue-icon street-light"></div>
            <h3>Street Lighting</h3>
            <p>Report broken or malfunctioning street lights.</p>
          </div>
          <div className="issue-type-card">
            <div className="issue-icon graffiti"></div>
            <h3>Graffiti</h3>
            <p>Report unwanted graffiti on public property.</p>
          </div>
          <div className="issue-type-card">
            <div className="issue-icon anti-social"></div>
            <h3>Anti-Social Behavior</h3>
            <p>Report instances of anti-social behavior in your area.</p>
          </div>
          <div className="issue-type-card">
            <div className="issue-icon fly-tipping"></div>
            <h3>Fly-Tipping</h3>
            <p>Report illegal dumping of waste or rubbish.</p>
          </div>
          <div className="issue-type-card">
            <div className="issue-icon blocked-drain"></div>
            <h3>Blocked Drains</h3>
            <p>Report blocked drains causing flooding or water issues.</p>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="info-card">
          <h3>Report Issues</h3>
          <p>
            Spotted something that needs fixing? Report it to us and we'll
            make sure it gets taken care of.
          </p>
          {currentUser ? (
            <Link to="/report" className="card-link">Report Now →</Link>
          ) : (
            <Link to="/login" className="card-link">Login to Report →</Link>
          )}
        </div>
        <div className="info-card">
          <h3>Track Progress</h3>
          <p>
            Follow the status of your reported issues and see when they're
            resolved.
          </p>
          <Link to="/help" className="card-link">How It Works →</Link>
        </div>
        <div className="info-card">
          <h3>Community Impact</h3>
          <p>
            Together we can make Chalkstone a better place to live, work,
            and visit.
          </p>
          <Link to="/about" className="card-link">Learn More →</Link>
        </div>
      </section>

      <section className="stats-section">
        <h2>Making a Difference Together</h2>
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-value">850+</div>
            <div className="stat-label">Issues Reported</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">720+</div>
            <div className="stat-label">Issues Resolved</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">15</div>
            <div className="stat-label">Days Avg. Resolution Time</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">500+</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to improve your community?</h2>
          <p>Join our efforts to make Chalkstone a better place for everyone.</p>
          {!currentUser && (
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary">Create an Account</Link>
              <Link to="/login" className="btn btn-secondary">Login</Link>
            </div>
          )}
          {currentUser && (
            <div className="cta-buttons">
              <Link to="/report" className="btn btn-primary">Report an Issue</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
