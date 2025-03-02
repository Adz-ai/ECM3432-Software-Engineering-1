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
        setIssues(response.data);
      } catch (err) {
        setError('Failed to load issues for the map');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMapIssues();
  }, []);

  const handleViewDetails = (issueId) => {
    navigate(`/issues/${issueId}`);
  };

  const getMarkerIcon = (issueType) => {
    return issueIcons[issueType] || new L.Icon.Default();
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

        {issues.map((issue, index) => (
          <Marker
            key={index}
            position={[issue.location.latitude, issue.location.longitude]}
            icon={getMarkerIcon(issue.type)}
          >
            <Popup>
              <div className="issue-popup">
                <h3>{issue.type.replace('_', ' ')}</h3>
                <IssueStatusBadge status={issue.status} />
                <button
                  className="view-details-btn"
                  onClick={() => handleViewDetails(issue.id)}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default IssueMap;
