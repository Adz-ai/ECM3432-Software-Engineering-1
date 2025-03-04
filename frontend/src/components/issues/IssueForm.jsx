// src/components/issues/IssueForm.jsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { issuesService } from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const issueTypes = [
  { value: 'POTHOLE', label: 'Pothole' },
  { value: 'STREET_LIGHT', label: 'Street Light' },
  { value: 'GRAFFITI', label: 'Graffiti' },
  { value: 'ANTI_SOCIAL', label: 'Anti-Social Behavior' },
  { value: 'FLY_TIPPING', label: 'Fly Tipping' },
  { value: 'BLOCKED_DRAIN', label: 'Blocked Drain' },
];

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click: (e) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const IssueForm = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: '',
    description: '',
  });

  const [files, setFiles] = useState([]);
  const [position, setPosition] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);

  // Exeter city center coordinates
  const defaultCenter = [50.7184, -3.5339];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    setUploading(true);
    const selectedFiles = Array.from(e.target.files);

    // Store the selected files for submission
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);

    // Create preview URLs for the UI only
    const newPreviewImages = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPreviewImages(prev => [...prev, ...newPreviewImages]);
    setUploading(false);
  };

  const removeImage = (index) => {
    // Remove from preview
    const updatedPreviews = [...previewImages];

    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(updatedPreviews[index].preview);

    updatedPreviews.splice(index, 1);
    setPreviewImages(updatedPreviews);

    // Remove from files array
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!position) {
      setError('Please select a location on the map');
      return;
    }

    if (!formData.type) {
      setError('Please select an issue type');
      return;
    }

    if (!formData.description) {
      setError('Please provide a description');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      console.log('Submitting issue with form data:', formData);

      // Create a FormData object instead of JSON
      const formDataToSubmit = new FormData();

      // Add text fields
      formDataToSubmit.append('type', formData.type);
      formDataToSubmit.append('description', formData.description);
      formDataToSubmit.append('latitude', position[0]);
      formDataToSubmit.append('longitude', position[1]);

      // Add image files
      files.forEach(file => {
        formDataToSubmit.append('images', file);
      });

      console.log('Submitting FormData with files:', files.length);

      const response = await issuesService.createIssueWithImages(formDataToSubmit);

      console.log('Issue creation response:', response);

      // On successful submission, navigate to the home page or issue detail
      navigate('/');

    } catch (err) {
      console.error('Error creating issue:', err);
      setError(err.response?.data?.message || 'Failed to submit issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="issue-form-container">
        <h2>Report an Issue</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="type">Issue Type</label>
            <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
            >
              <option value="">Select an issue type</option>
              {issueTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Please describe the issue in detail..."
                required
            />
          </div>

          <div className="form-group">
            <label htmlFor="images">Upload Images</label>
            <input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
            />
            {uploading && <p>Uploading...</p>}

            <div className="image-preview-container">
              {previewImages.map((image, index) => (
                  <div key={index} className="image-preview">
                    <img src={image.preview} alt={`Preview ${index}`} />
                    <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-image-btn"
                    >
                      &times;
                    </button>
                  </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Select Location on Map (Click to place marker)</label>
            <div className="map-container">
              <MapContainer
                  center={defaultCenter}
                  zoom={13}
                  style={{ height: '400px', width: '100%' }}
              >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
            {position && (
                <p className="selected-location">
                  Selected Location: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </p>
            )}
          </div>

          <div className="form-actions">
            <button
                type="button"
                onClick={() => navigate('/')}
                className="cancel-btn"
            >
              Cancel
            </button>
            <button
                type="submit"
                disabled={submitting || !position}
                className="submit-btn"
            >
              {submitting ? 'Submitting...' : 'Submit Issue'}
            </button>
          </div>
        </form>
      </div>
  );
};

export default IssueForm;