// src/components/issues/IssueForm.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { issuesService } from '../../services/api';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import L from 'leaflet';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Alert, 
  Paper, 
  Stack, 
  Grid, 
  Chip, 
  useTheme, 
  alpha,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  ControlPoint as UploadIcon,
  PinDrop as LocationIcon,
  Description as DescriptionIcon,
  Category as TypeIcon,
  Cancel as CancelIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  PhotoCamera as CameraIcon
} from '@mui/icons-material';

// Import icons for issue types
import { 
  Construction as PotholeIcon, 
  Lightbulb as StreetLightIcon,
  Brush as GraffitiIcon, 
  Report as AntiSocialIcon,
  Delete as FlyTippingIcon,
  WaterDrop as BlockedDrainIcon
} from '@mui/icons-material';

// Define reusable motion components
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);
const MotionPaper = motion(Paper);

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const issueTypes = [
  { value: 'POTHOLE', label: 'Pothole', icon: <PotholeIcon /> },
  { value: 'STREET_LIGHT', label: 'Street Light', icon: <StreetLightIcon /> },
  { value: 'GRAFFITI', label: 'Graffiti', icon: <GraffitiIcon /> },
  { value: 'ANTI_SOCIAL', label: 'Anti-Social Behavior', icon: <AntiSocialIcon /> },
  { value: 'FLY_TIPPING', label: 'Fly Tipping', icon: <FlyTippingIcon /> },
  { value: 'BLOCKED_DRAIN', label: 'Blocked Drain', icon: <BlockedDrainIcon /> },
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
  const navigate = useNavigate();
  const theme = useTheme();

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

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

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

      const response = await issuesService.createIssueWithImages(formDataToSubmit);

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
    <MotionBox 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <MotionTypography 
        variant="h5" 
        component="h2" 
        sx={{ 
          mb: 4, 
          fontWeight: 600,
          position: 'relative',
          display: 'inline-block',
          '&:after': {
            content: '""',
            position: 'absolute',
            width: '40px',
            height: '3px',
            background: theme.palette.primary.main,
            bottom: '-8px',
            left: 0,
            borderRadius: '2px'
          }
        }}
        variants={slideUp}
      >
        Fill in the details below
      </MotionTypography>

      {error && (
        <MotionBox 
          sx={{ mb: 3 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert severity="error" variant="filled" onClose={() => setError(null)}>
            {error}
          </Alert>
        </MotionBox>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          {/* Issue Type Selection */}
          <MotionBox variants={slideUp}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="issue-type-label" sx={{ display: 'flex', alignItems: 'center' }}>
                <TypeIcon sx={{ mr: 1, fontSize: 20 }} /> Issue Type
              </InputLabel>
              <Select
                labelId="issue-type-label"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                label="Issue Type"
                required
                sx={{
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                  }
                }}
              >
                <MenuItem value="" disabled>
                  <em>Select an issue type</em>
                </MenuItem>
                {issueTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ mr: 1, color: 'primary.main' }}>{type.icon}</Box>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MotionBox>

          {/* Description */}
          <MotionBox variants={slideUp}>
            <TextField
              id="description"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Please describe the issue in detail..."
              variant="outlined"
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <DescriptionIcon sx={{ mr: 1, color: 'action.active' }} />
                ),
              }}
            />
          </MotionBox>

          {/* Image Upload */}
          <MotionBox variants={slideUp}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                fontWeight: 500 
              }}
            >
              <CameraIcon sx={{ mr: 1, color: 'primary.main' }} /> Upload Images
            </Typography>
            <Box sx={{ mb: 2 }}>
              <MotionButton
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
                sx={{ mb: 2 }}
                disabled={uploading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Choose Files
                <input
                  type="file"
                  id="images"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  hidden
                />
              </MotionButton>
              {uploading && (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="body2">Uploading...</Typography>
                </Box>
              )}
            </Box>

            {previewImages.length > 0 && (
              <MotionPaper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  background: alpha(theme.palette.primary.light, 0.05),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
                variants={fadeIn}
              >
                <Grid container spacing={2}>
                  {previewImages.map((image, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <MotionBox 
                        sx={{ 
                          position: 'relative',
                          height: 140,
                          borderRadius: 1,
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <img 
                          src={image.preview} 
                          alt={`Preview ${index}`} 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }} 
                        />
                        <Tooltip title="Remove image">
                          <MotionButton
                            size="small"
                            color="error"
                            sx={{ 
                              position: 'absolute', 
                              top: 5, 
                              right: 5,
                              minWidth: 'auto',
                              width: 32,
                              height: 32,
                              p: 0,
                              background: 'rgba(255,255,255,0.8)'
                            }}
                            onClick={() => removeImage(index)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </MotionButton>
                        </Tooltip>
                      </MotionBox>
                    </Grid>
                  ))}
                </Grid>
              </MotionPaper>
            )}
          </MotionBox>

          {/* Map */}
          <MotionBox variants={slideUp}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                fontWeight: 500 
              }}
            >
              <LocationIcon sx={{ mr: 1, color: 'primary.main' }} /> Select Location on Map
            </Typography>
            <MotionPaper 
              elevation={0}
              sx={{ 
                borderRadius: 2, 
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                height: 400, 
                width: '100%',
                position: 'relative'
              }}
              whileHover={{ boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}
            >
              <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10, 
                  zIndex: 1000,
                  background: 'white',
                  p: 1,
                  borderRadius: 1,
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  fontSize: '12px'
                }}
              >
                Click to place marker
              </Box>
            </MotionPaper>
            {position && (
              <MotionBox 
                sx={{ 
                  mt: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'flex-end'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Chip 
                  icon={<LocationIcon fontSize="small" />} 
                  label={`${position[0].toFixed(6)}, ${position[1].toFixed(6)}`} 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                />
              </MotionBox>
            )}
          </MotionBox>

          {/* Form Actions */}
          <MotionBox 
            sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              mt: 4, 
              gap: 2 
            }}
            variants={slideUp}
          >
            <MotionButton
              type="button"
              variant="outlined"
              color="secondary"
              onClick={() => navigate('/')}
              startIcon={<CancelIcon />}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </MotionButton>
            <MotionButton
              type="submit"
              variant="contained"
              disabled={submitting || !position}
              color="primary"
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              whileHover={!submitting && position ? { scale: 1.05, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' } : {}}
              whileTap={!submitting && position ? { scale: 0.95 } : {}}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </MotionButton>
          </MotionBox>
        </Stack>
      </form>
    </MotionBox>
  );
};

export default IssueForm;