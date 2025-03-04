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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Invalid issue ID');
      setLoading(false);
      return;
    }

    const fetchIssueDetail = async () => {
      try {
        setLoading(true);
        console.log('Fetching issue details for ID:', id);
        const response = await issuesService.getIssueById(id);
        console.log('Issue details response:', response.data);

        setIssue(response.data);
        setUpdateData({
          status: response.data.status,
          assigned_to: response.data.assigned_to || '',
        });
      } catch (err) {
        console.error('Error fetching issue details:', err);
        setError('Failed to load issue details');
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

  const handleImageError = (index) => {
    setImageError(prev => ({ ...prev, [index]: true }));
    console.error(`Failed to load image at index ${index}`);
  };

  const handleNextImage = () => {
    if (issue?.images?.length > 0) {
      setActiveImageIndex((prevIndex) =>
          prevIndex === issue.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (issue?.images?.length > 0) {
      setActiveImageIndex((prevIndex) =>
          prevIndex === 0 ? issue.images.length - 1 : prevIndex - 1
      );
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString; // Fallback to showing the raw string
    }
  };

  // Get issue type name with spaces instead of underscores
  const getIssueTypeName = (type) => {
    return type ? type.replace(/_/g, ' ') : 'Unknown';
  };

  // Check if issue has valid images
  const hasImages = Array.isArray(issue.images) && issue.images.length > 0;

  return (
      <div className="issue-detail-container">
        {/* Fullscreen image overlay */}
        {isFullscreen && hasImages && (
            <div className="fullscreen-overlay" onClick={toggleFullscreen}>
              <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
                {!imageError[activeImageIndex] ? (
                    <img
                        src={issue.images[activeImageIndex]}
                        alt={`Issue ${activeImageIndex + 1} fullscreen`}
                        className="fullscreen-image"
                        onError={() => handleImageError(activeImageIndex)}
                    />
                ) : (
                    <div className="fullscreen-error">
                      <p>Failed to load image</p>
                      <small>{issue.images[activeImageIndex]}</small>
                    </div>
                )}
                <button className="close-fullscreen" onClick={toggleFullscreen}>×</button>

                {issue.images.length > 1 && (
                    <div className="fullscreen-nav">
                      <button onClick={handlePrevImage} className="nav-btn prev">&larr;</button>
                      <span className="image-counter">{activeImageIndex + 1} / {issue.images.length}</span>
                      <button onClick={handleNextImage} className="nav-btn next">&rarr;</button>
                    </div>
                )}
              </div>
            </div>
        )}

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
                {issue.location && issue.location.latitude && issue.location.longitude ? (
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
                ) : (
                    <div className="no-map-data">Location information not available</div>
                )}
              </div>
              {issue.location && issue.location.latitude && issue.location.longitude && (
                  <div className="detail-row">
                    <span className="detail-label">Coordinates:</span>
                    <span className="detail-value">
                  {issue.location.latitude.toFixed(6)}, {issue.location.longitude.toFixed(6)}
                </span>
                  </div>
              )}
            </div>

            <div className="detail-section">
              <h2>Images</h2>
              <div className="issue-images">
                {hasImages ? (
                    <div className="image-gallery">
                      <div className="main-image-container">
                        {!imageError[activeImageIndex] ? (
                            <img
                                src={issue.images[activeImageIndex]}
                                alt={`Issue ${activeImageIndex + 1}`}
                                className="main-image"
                                onError={() => handleImageError(activeImageIndex)}
                                onClick={toggleFullscreen}
                                style={{ cursor: 'pointer' }}
                            />
                        ) : (
                            <div className="image-error">
                              <p>Failed to load image</p>
                              <small>{issue.images[activeImageIndex]}</small>
                            </div>
                        )}

                        {issue.images.length > 1 && (
                            <div className="image-nav">
                              <button onClick={handlePrevImage} className="nav-button prev">&larr;</button>
                              <span>{activeImageIndex + 1} / {issue.images.length}</span>
                              <button onClick={handleNextImage} className="nav-button next">&rarr;</button>
                            </div>
                        )}
                      </div>

                      {issue.images.length > 1 && (
                          <div className="thumbnail-container">
                            {issue.images.map((image, idx) => (
                                <div
                                    key={idx}
                                    className={`thumbnail ${idx === activeImageIndex ? 'active' : ''}`}
                                    onClick={() => setActiveImageIndex(idx)}
                                >
                                  {!imageError[idx] ? (
                                      <img
                                          src={image}
                                          alt={`Thumbnail ${idx + 1}`}
                                          onError={() => handleImageError(idx)}
                                      />
                                  ) : (
                                      <div className="thumb-error">!</div>
                                  )}
                                </div>
                            ))}
                          </div>
                      )}
                    </div>
                ) : (
                    <p>No images available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
        .image-gallery {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .main-image-container {
          position: relative;
          background-color: #f8f9fa;
          border-radius: 8px;
          overflow: hidden;
          min-height: 200px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .main-image {
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
        }
        
        .image-nav {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
        }
        
        .nav-button {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
        }
        
        .thumbnail-container {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }
        
        .thumbnail {
          width: 60px;
          height: 60px;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
          border: 2px solid transparent;
        }
        
        .thumbnail.active {
          opacity: 1;
          border-color: var(--primary-color);
        }
        
        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .image-error {
          background-color: #f8d7da;
          color: #721c24;
          padding: 1rem;
          border-radius: 4px;
          text-align: center;
          width: 100%;
        }
        
        .image-error small {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          word-break: break-all;
        }
        
        .thumb-error {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .no-map-data {
          background-color: #f8f9fa;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
          border-radius: 8px;
        }
        
        /* Fullscreen overlay styles */
        .fullscreen-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.9);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .fullscreen-content {
          position: relative;
          width: 90%;
          height: 90%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .fullscreen-image {
          max-width: 90%;
          max-height: 80vh;
          object-fit: contain;
        }
        
        .fullscreen-error {
          background-color: #f8d7da;
          color: #721c24;
          padding: 2rem;
          border-radius: 8px;
          text-align: center;
          max-width: 80%;
        }
        
        .close-fullscreen {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          color: white;
          font-size: 40px;
          cursor: pointer;
          z-index: 10000;
        }
        
        .fullscreen-nav {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
        }
        
        .nav-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 24px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .image-counter {
          background: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
        }
      `}</style>
      </div>
  );
};

export default IssueDetailPage;