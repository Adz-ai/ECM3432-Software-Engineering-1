// src/pages/IssueDetailPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issuesService } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import IssueStatusBadge from '../components/issues/IssueStatusBadge';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const IssueDetailPage = () => {
  const { id } = useParams();
  // We're actually using isStaff which needs currentUser internally, so it's required
  const { isStaff } = useContext(AuthContext);
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    assigned_to: '',
  });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    const fetchIssueDetail = async () => {
      try {
        setLoading(true);
        const response = await issuesService.getIssueById(id);
        setIssue(response.data);
        setUpdateData({
          status: response.data.status,
          assigned_to: response.data.assigned_to || '',
        });
      } catch (err) {
        setError('Failed to load issue details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssueDetail();
  }, [id]);

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData({ ...updateData, [name]: value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateError(null);

    try {
      await issuesService.updateIssue(id, updateData);

      // Refresh issue data
      const response = await issuesService.getIssueById(id);
      setIssue(response.data);
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update issue');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading issue details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!issue) {
    return <div className="not-found">Issue not found</div>;
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get issue type name with spaces instead of underscores
  const getIssueTypeName = (type) => {
    return type.replace(/_/g, ' ');
  };

  return (
    <div className="issue-detail-container">
      <div className="issue-detail-header">
        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
        <h1>{getIssueTypeName(issue.type)} Issue</h1>
        <IssueStatusBadge status={issue.status} />
      </div>

      <div className="issue-detail-content">
        <div className="issue-detail-info">
          <div className="detail-section">
            <h2>Details</h2>
            <div className="detail-row">
              <span className="detail-label">ID:</span>
              <span className="detail-value">{issue.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Reported By:</span>
              <span className="detail-value">{issue.reported_by}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Assigned To:</span>
              <span className="detail-value">{issue.assigned_to || 'Unassigned'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Reported On:</span>
              <span className="detail-value">{formatDate(issue.created_at)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Last Updated:</span>
              <span className="detail-value">{formatDate(issue.updated_at)}</span>
            </div>
          </div>

          <div className="detail-section">
            <h2>Description</h2>
            <p className="issue-description">{issue.description}</p>
          </div>

          {isStaff() && (
            <div className="detail-section">
              <h2>Update Issue</h2>
              {updateError && <div className="error-message">{updateError}</div>}
              <form onSubmit={handleUpdateSubmit}>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={updateData.status}
                    onChange={handleUpdateChange}
                    required
                  >
                    <option value="NEW">New</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="assigned_to">Assign To Staff Member</label>
                  <input
                    type="text"
                    id="assigned_to"
                    name="assigned_to"
                    value={updateData.assigned_to}
                    onChange={handleUpdateChange}
                    placeholder="Enter staff username"
                  />
                </div>

                <button
                  type="submit"
                  className="update-button"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Issue'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="issue-detail-sidebar">
          <div className="detail-section">
            <h2>Location</h2>
            <div className="issue-map">
              <MapContainer
                center={[issue.location.latitude, issue.location.longitude]}
                zoom={15}
                style={{ height: '300px', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[issue.location.latitude, issue.location.longitude]} />
              </MapContainer>
            </div>
            <div className="detail-row">
              <span className="detail-label">Coordinates:</span>
              <span className="detail-value">
                {issue.location.latitude.toFixed(6)}, {issue.location.longitude.toFixed(6)}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h2>Images</h2>
            <div className="issue-images">
              {issue.images && issue.images.length > 0 ? (
                issue.images.map((image, index) => (
                  <div key={index} className="issue-image">
                    <img src={image} alt={`Issue ${index + 1}`} />
                  </div>
                ))
              ) : (
                <p>No images available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailPage;
