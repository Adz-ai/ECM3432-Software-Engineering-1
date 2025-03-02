// src/components/issues/IssueMap.jsx

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { issuesService } from '../../services/api';
import IssueStatusBadge from './IssueStatusBadge';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icons for different issue types
const issueIcons = {
  POTHOLE: new L.Icon({
    iconUrl: '/assets/markers/pothole.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  STREET_LIGHT: new L.Icon({
    iconUrl: '/assets/markers/street_light.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  GRAFFITI: new L.Icon({
    iconUrl: '/assets/markers/graffiti.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  ANTI_SOCIAL: new L.Icon({
    iconUrl: '/assets/markers/anti_social.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  FLY_TIPPING: new L.Icon({
    iconUrl: '/assets/markers/fly_tipping.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  BLOCKED_DRAIN: new L.Icon({
    iconUrl: '/assets/markers/blocked_drain.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
};

const IssueMap = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Exeter city center coordinates
  const defaultCenter = [50.7184, -3.5339];
  const defaultZoom = 13;

  useEffect(() => {
    const fetchMapIssues = async () => {
      try {
        setLoading(true);
        const response = await issuesService.getMapIssues();
        console.log('Map issues response:', response.data);

        // Ensure we have an array of issues with IDs
        if (Array.isArray(response.data)) {
          setIssues(response.data);
        } else {
          console.warn('Unexpected map issues response format:', response.data);
          setIssues([]);
        }
      } catch (err) {
        setError('Failed to load issues for the map');
        console.error('Error fetching map issues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMapIssues();
  }, []);

  const handleViewDetails = (issueId) => {
    console.log('Navigating to issue details with ID:', issueId);

    // Only navigate if we have a valid ID
    if (issueId) {
      navigate(`/issues/${issueId}`);
    } else {
      console.error('Attempted to navigate to issue details with undefined ID');
    }
  };

  const getMarkerIcon = (issueType) => {
    return issueIcons[issueType] || new L.Icon.Default();
  };

  const formatIssueType = (type) => {
    return type ? type.replace(/_/g, ' ') : 'Unknown';
  };

  if (loading) {
    return <div className="map-loading">Loading issue map...</div>;
  }

  if (error) {
    return <div className="map-error">{error}</div>;
  }

  return (
    <div className="issue-map-container">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '600px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {issues.length === 0 && (
          <div className="no-issues-overlay">No issues reported in this area</div>
        )}

        {issues.map((issue, index) => {
          // Skip markers with invalid location data
          if (!issue.location || !issue.location.latitude || !issue.location.longitude) {
            console.warn('Issue missing valid location data:', issue);
            return null;
          }

          return (
            <Marker
              key={issue.id || `marker-${index}`}
              position={[issue.location.latitude, issue.location.longitude]}
              icon={getMarkerIcon(issue.type)}
            >
              <Popup>
                <div className="issue-popup">
                  <h3>{formatIssueType(issue.type)}</h3>
                  {issue.status && <IssueStatusBadge status={issue.status} />}
                  {issue.id ? (
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewDetails(issue.id)}
                    >
                      View Details
                    </button>
                  ) : (
                    <p className="error-message">Cannot view details (missing ID)</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style jsx>{`
        .no-issues-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(255, 255, 255, 0.8);
          padding: 1rem;
          border-radius: 4px;
          z-index: 1000;
          text-align: center;
          font-weight: bold;
        }

        .issue-popup h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
        }

        .view-details-btn {
          display: block;
          width: 100%;
          padding: 0.5rem;
          margin-top: 0.5rem;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .error-message {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default IssueMap;
