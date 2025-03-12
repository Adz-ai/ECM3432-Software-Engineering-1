// src/pages/IssueDetailPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issuesService, engineersService } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import IssueStatusBadge from '../components/issues/IssueStatusBadge';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Material UI imports
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EngineeringIcon from '@mui/icons-material/Engineering';
import UpdateIcon from '@mui/icons-material/Update';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';

// Animation imports
import { motion } from 'framer-motion';

const IssueDetailPage = () => {
  const { id } = useParams();
  const { isStaff } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
  const [engineers, setEngineers] = useState([]);
  const [loadingEngineers, setLoadingEngineers] = useState(false);

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
  
  // Fetch engineers for staff users
  useEffect(() => {
    const fetchEngineers = async () => {
      if (!isStaff()) return;
      
      try {
        setLoadingEngineers(true);
        console.log('Fetching engineers list');
        const response = await engineersService.getAllEngineers();
        console.log('Engineers response:', response.data);
        setEngineers(response.data);
      } catch (err) {
        console.error('Error fetching engineers:', err);
        // Don't set error here to avoid breaking the main issue view
      } finally {
        setLoadingEngineers(false);
      }
    };

    fetchEngineers();
  }, [isStaff]);

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

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3 }}>Loading issue details...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          icon={<ErrorOutlineIcon fontSize="inherit" />}
        >
          <Typography variant="h6">Error</Typography>
          <Typography variant="body1">{error}</Typography>
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!issue) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="h6">Not Found</Typography>
          <Typography variant="body1">The requested issue could not be found.</Typography>
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Container>
    );
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          {/* Fullscreen image overlay */}
          {isFullscreen && hasImages && (
            <Box 
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0, 0, 0, 0.9)',
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onClick={toggleFullscreen}
            >
              <Box 
                sx={{
                  position: 'relative',
                  width: '90%',
                  height: '90%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {!imageError[activeImageIndex] ? (
                  <Box 
                    component="img"
                    src={issue.images[activeImageIndex]}
                    alt={`Issue ${activeImageIndex + 1} fullscreen`}
                    sx={{
                      maxWidth: '90%',
                      maxHeight: '80vh',
                      objectFit: 'contain'
                    }}
                    onError={() => handleImageError(activeImageIndex)}
                  />
                ) : (
                  <Box sx={{
                    bgcolor: '#f8d7da',
                    color: '#721c24',
                    p: 4,
                    borderRadius: 2,
                    textAlign: 'center',
                    maxWidth: '80%'
                  }}>
                    <Typography variant="h6">Failed to load image</Typography>
                    <Typography variant="caption" display="block">{issue.images[activeImageIndex]}</Typography>
                  </Box>
                )}
                <IconButton 
                  sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    color: 'white',
                    fontSize: 40
                  }}
                  onClick={toggleFullscreen}
                  aria-label="Close fullscreen"
                >
                  <CloseIcon fontSize="large" />
                </IconButton>

                {issue.images.length > 1 && (
                  <Box sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <IconButton
                      onClick={handlePrevImage}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                      }}
                    >
                      <ArrowBackIosIcon />
                    </IconButton>
                    <Chip 
                      label={`${activeImageIndex + 1} / ${issue.images.length}`}
                      sx={{ bgcolor: 'rgba(0, 0, 0, 0.5)', color: 'white' }}
                    />
                    <IconButton
                      onClick={handleNextImage}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                      }}
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mr: 2 }}
              >
                Back
              </Button>
              <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
                {getIssueTypeName(issue.type)} Issue
              </Typography>
              <Box>
                <IssueStatusBadge status={issue.status} />
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Left column - Issue details */}
          <Grid item xs={12} md={7}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoIcon sx={{ mr: 1 }} /> 
                  Issue Details
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={4} sm={3}>
                    <Typography variant="body2" color="text.secondary">ID:</Typography>
                  </Grid>
                  <Grid item xs={8} sm={9}>
                    <Typography variant="body1">{issue.id}</Typography>
                  </Grid>
                  
                  <Grid item xs={4} sm={3}>
                    <Typography variant="body2" color="text.secondary">Reported By:</Typography>
                  </Grid>
                  <Grid item xs={8} sm={9}>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                      {issue.reported_by}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4} sm={3}>
                    <Typography variant="body2" color="text.secondary">Assigned To:</Typography>
                  </Grid>
                  <Grid item xs={8} sm={9}>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <EngineeringIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                      {issue.assigned_to || 'Unassigned'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4} sm={3}>
                    <Typography variant="body2" color="text.secondary">Reported On:</Typography>
                  </Grid>
                  <Grid item xs={8} sm={9}>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarTodayIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                      {formatDate(issue.created_at)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4} sm={3}>
                    <Typography variant="body2" color="text.secondary">Last Updated:</Typography>
                  </Grid>
                  <Grid item xs={8} sm={9}>
                    <Typography variant="body1">{formatDate(issue.updated_at)}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {issue.description}
                </Typography>
              </CardContent>
            </Card>

            {isStaff() && (
                <Card sx={{ mt: 3, mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <UpdateIcon sx={{ mr: 1 }} />
                      Update Issue
                    </Typography>
                    
                    {updateError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {updateError}
                      </Alert>
                    )}
                    
                    <form onSubmit={handleUpdateSubmit}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="status-label">Status</InputLabel>
                            <Select
                              labelId="status-label"
                              id="status"
                              name="status"
                              value={updateData.status}
                              onChange={handleUpdateChange}
                              label="Status"
                              required
                            >
                              <MenuItem value="NEW">New</MenuItem>
                              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                              <MenuItem value="RESOLVED">Resolved</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="assigned-to-label">Assign Engineer</InputLabel>
                            <Select
                              labelId="assigned-to-label"
                              id="assigned_to"
                              name="assigned_to"
                              value={updateData.assigned_to}
                              onChange={handleUpdateChange}
                              label="Assign Engineer"
                              disabled={loadingEngineers}
                              startAdornment={loadingEngineers ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                            >
                              <MenuItem value="">None (Unassigned)</MenuItem>
                              {engineers.map(engineer => (
                                <MenuItem key={engineer.id} value={engineer.id}>
                                  {engineer.name} ({engineer.username})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={updating}
                            startIcon={updating ? <CircularProgress size={20} /> : <UpdateIcon />}
                          >
                            {updating ? 'Updating...' : 'Update Issue'}
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </CardContent>
                </Card>
            )}
          </Grid>

          <Grid item xs={12} md={5}>
            {/* Location section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ mr: 1 }} />
                  Location
                </Typography>
                
                <Box sx={{ mt: 2, borderRadius: 1, overflow: 'hidden' }}>
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
                    <Box
                      sx={{
                        height: 300,
                        bgcolor: 'background.default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                        borderRadius: 1
                      }}
                    >
                      Location information not available
                    </Box>
                  )}
                </Box>
                
                {issue.location && issue.location.latitude && issue.location.longitude && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Coordinates:
                    </Typography>
                    <Chip
                      label={`${issue.location.latitude.toFixed(6)}, ${issue.location.longitude.toFixed(6)}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Images section */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <FullscreenIcon sx={{ mr: 1 }} />
                  Images
                </Typography>
                
                {hasImages ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box
                      sx={{
                        position: 'relative',
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        overflow: 'hidden',
                        minHeight: 200,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      {!imageError[activeImageIndex] ? (
                        <Box
                          component="img"
                          src={issue.images[activeImageIndex]}
                          alt={`Issue ${activeImageIndex + 1}`}
                          sx={{
                            maxWidth: '100%',
                            maxHeight: 400,
                            objectFit: 'contain',
                            cursor: 'pointer'
                          }}
                          onError={() => handleImageError(activeImageIndex)}
                          onClick={toggleFullscreen}
                        />
                      ) : (
                        <Alert severity="error" sx={{ m: 2 }}>
                          <Typography variant="body1">Failed to load image</Typography>
                          <Typography variant="caption" display="block">
                            {issue.images[activeImageIndex]}
                          </Typography>
                        </Alert>
                      )}

                      {issue.images.length > 1 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 0.5
                          }}
                        >
                          <IconButton
                            onClick={handlePrevImage}
                            size="small"
                            sx={{ color: 'white' }}
                          >
                            <ArrowBackIosIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="body2">
                            {activeImageIndex + 1} / {issue.images.length}
                          </Typography>
                          <IconButton
                            onClick={handleNextImage}
                            size="small"
                            sx={{ color: 'white' }}
                          >
                            <ArrowForwardIosIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>

                    {issue.images.length > 1 && (
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 0.5,
                          overflowX: 'auto',
                          pb: 0.5
                        }}
                      >
                        {issue.images.map((image, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: 1,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              opacity: idx === activeImageIndex ? 1 : 0.7,
                              transition: 'opacity 0.2s',
                              border: idx === activeImageIndex ? 2 : 0,
                              borderColor: 'primary.main',
                              '&:hover': { opacity: 0.9 }
                            }}
                            onClick={() => setActiveImageIndex(idx)}
                          >
                            {!imageError[idx] ? (
                              <Box
                                component="img"
                                src={image}
                                alt={`Thumbnail ${idx + 1}`}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onError={() => handleImageError(idx)}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: '#f8d7da',
                                  color: '#721c24'
                                }}
                              >
                                !
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      textAlign: 'center',
                      color: 'text.secondary'
                    }}
                  >
                    No images available
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
          </Paper>
        </motion.div>
      </Container>
  );
};

export default IssueDetailPage;