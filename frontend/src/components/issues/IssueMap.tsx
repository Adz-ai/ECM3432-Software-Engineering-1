// src/components/issues/IssueMap.tsx

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { issuesService, Issue } from '../../services/api';
import { IssueType } from '../../utils/constants';
import IssueStatusBadge from './IssueStatusBadge';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';

// Material UI imports
import {
  Build as PotholeIcon,
  WbIncandescent as StreetLightIcon,
  Brush as GraffitiIcon,
  NoiseAware as AntiSocialIcon,
  Delete as FlyTippingIcon,
  Water as BlockedDrainIcon
} from '@mui/icons-material';
import { Checkbox, FormControlLabel, Paper } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

// Fix for marker icons in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Create Material UI Icon Markers
const createMaterialIconMarker = (IconComponent: SvgIconComponent, color: string): L.DivIcon => {
  const iconHtml = renderToString(
    <div style={{
      color,
      background: 'white',
      borderRadius: '50%',
      padding: '6px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px'
    }}>
      <IconComponent style={{ fontSize: '24px' }} />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'material-icon-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

// Custom marker icons for different issue types
const issueIcons: Record<IssueType, L.DivIcon> = {
  POTHOLE: createMaterialIconMarker(PotholeIcon, '#ff5722'),
  STREET_LIGHT: createMaterialIconMarker(StreetLightIcon, '#ffc107'),
  GRAFFITI: createMaterialIconMarker(GraffitiIcon, '#9c27b0'),
  ANTI_SOCIAL: createMaterialIconMarker(AntiSocialIcon, '#f44336'),
  FLY_TIPPING: createMaterialIconMarker(FlyTippingIcon, '#4caf50'),
  BLOCKED_DRAIN: createMaterialIconMarker(BlockedDrainIcon, '#2196f3'),
};

const IssueMap: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState<boolean>(false);
  const navigate = useNavigate();

  // Exeter city center coordinates
  const defaultCenter: [number, number] = [50.7184, -3.5339];
  const defaultZoom = 13;

  useEffect(() => {
    const fetchMapIssues = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await issuesService.getMapIssues();
        console.log('Map issues response:', response.data);

        // Ensure we have an array of issues with IDs
        if (Array.isArray(response.data)) {
          setIssues(response.data as Issue[]);
        } else {
          console.warn('Unexpected map issues response format:', response.data);
          setIssues([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load issues for the map';
        setError(errorMessage);
        console.error('Error fetching map issues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMapIssues();
  }, []);

  const handleViewDetails = (issueId: number): void => {
    console.log('Navigating to issue details with ID:', issueId);

    // Only navigate if we have a valid ID
    if (issueId) {
      navigate(`/issues/${issueId}`);
    } else {
      console.error('Attempted to navigate to issue details with undefined ID');
    }
  };

  const getMarkerIcon = (issueType: IssueType): L.Icon | L.DivIcon => {
    return issueIcons[issueType] || new L.Icon.Default();
  };

  const formatIssueType = (type: IssueType): string => {
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
      {/* Add a toggle control for showing/hiding resolved issues */}
      <Paper 
        elevation={3} 
        className="map-controls" 
        sx={{ 
          padding: '8px 16px', 
          borderRadius: '24px',
          display: 'inline-flex',
          alignItems: 'center',
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={showResolved}
              onChange={() => setShowResolved(!showResolved)}
              color="primary"
              size="small"
            />
          }
          label="Resolved Issues"
        />
      </Paper>

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

        {issues.map((issue: Issue, index: number) => {
          // Skip markers with invalid location data
          if (!issue.location || !issue.location.latitude || !issue.location.longitude) {
            console.warn('Issue missing valid location data:', issue);
            return null;
          }

          // Skip resolved issues unless showResolved is true
          if (issue.status === 'RESOLVED' && !showResolved) {
            return null;
          }

          // Use a different style for resolved issues (more transparent markers)
          const isResolved = issue.status === 'RESOLVED';
          const markerIcon = getMarkerIcon(issue.type);

          // Create a modified icon for resolved issues with reduced opacity
          const iconToUse = markerIcon;
          if (isResolved) {
            // This is a simplified approach - ideally we'd modify the icon directly
            // but for now we'll just use a visual indicator in the popup
          }

          return (
            <Marker
              key={issue.id || `marker-${index}`}
              position={[issue.location.latitude, issue.location.longitude]}
              icon={iconToUse}
              opacity={isResolved ? 0.6 : 1}
            >
              <Popup>
                <div className={`issue-popup ${isResolved ? 'resolved-issue' : ''}`}>
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

      <style>{`
        .issue-map-container {
          position: relative;
        }
        
        .map-controls {
          position: absolute;
          top: 10px;
          right: 10px;
          /* Use a lower z-index to ensure it stays below the header/navigation */
          z-index: 999;
          background-color: white;
          padding: 10px;
          border-radius: 4px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          pointer-events: auto;
        }
        
        .resolved-toggle {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;
          cursor: pointer;
        }
        
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
        
        .resolved-issue {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

export default IssueMap;
