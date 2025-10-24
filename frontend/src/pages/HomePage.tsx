// src/pages/HomePage.jsx

import React, { useContext, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import IssueMap from '../components/issues/IssueMap';

// Material UI imports
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

// Animation imports
import { motion } from 'framer-motion';

// Icons
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BuildIcon from '@mui/icons-material/Build';
import WbIncandescentIcon from '@mui/icons-material/WbIncandescent';
import BrushIcon from '@mui/icons-material/Brush';
import NoiseAwareIcon from '@mui/icons-material/NoiseAware';
import DeleteIcon from '@mui/icons-material/Delete';
import WaterIcon from '@mui/icons-material/Water';
// import InfoIcon from '@mui/icons-material/Info';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import PublicIcon from '@mui/icons-material/Public';

// Create motion components
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);
const MotionCard = motion(Card);
const MotionPaper = motion(Paper);
const MotionContainer = motion(Container);

const HomePage = () => {
  const { currentUser } = useContext(AuthContext);

  // Debug log to check authentication state
  useEffect(() => {
    console.log('HomePage - Current user:', currentUser);
  }, [currentUser]);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const popUp = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 10 
      } 
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };
  
  const slideInFromLeft = {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 10 } }
  };
  
  const slideInFromRight = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 10 } }
  };
  
  const heroTextContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const buttonHover = {
    scale: 1.05,
    transition: { duration: 0.2 }
  };

  // Issue types data
  const issueTypes = [
    { icon: <BuildIcon fontSize="large" />, title: 'Potholes', description: 'Report road damage and potholes that need repair.' },
    { icon: <WbIncandescentIcon fontSize="large" />, title: 'Street Lighting', description: 'Report broken or malfunctioning street lights.' },
    { icon: <BrushIcon fontSize="large" />, title: 'Graffiti', description: 'Report unwanted graffiti on public property.' },
    { icon: <NoiseAwareIcon fontSize="large" />, title: 'Anti-Social Behavior', description: 'Report instances of anti-social behavior in your area.' },
    { icon: <DeleteIcon fontSize="large" />, title: 'Fly-Tipping', description: 'Report illegal dumping of waste or rubbish.' },
    { icon: <WaterIcon fontSize="large" />, title: 'Blocked Drains', description: 'Report blocked drains causing flooding or water issues.' },
  ];

  // Info cards data
  const infoCards = [
    { 
      icon: <ReportProblemIcon />, 
      title: 'Report Issues', 
      description: 'Spotted something that needs fixing? Report it to us and we\'ll make sure it gets taken care of.',
      link: currentUser ? '/report' : '/login',
      linkText: currentUser ? 'Report Now' : 'Login to Report'
    },
    { 
      icon: <TrackChangesIcon />, 
      title: 'Track Progress', 
      description: 'Follow the status of your reported issues and see when they\'re resolved.',
      link: '/about#how-it-works',
      linkText: 'How It Works'
    },
    { 
      icon: <PublicIcon />, 
      title: 'Community Impact', 
      description: 'Together we can make Chalkstone a better place to live, work, and visit.',
      link: '/about',
      linkText: 'Learn More'
    },
  ];

  // Stats data
  const stats = [
    { value: '850+', label: 'Issues Reported' },
    { value: '720+', label: 'Issues Resolved' },
    { value: '26', label: 'Days Avg. Resolution Time' },
    { value: '500+', label: 'Active Users' },
  ];

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Hero Section */}
      <MotionPaper 
        elevation={0}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        sx={{ 
          position: 'relative',
          backgroundColor: 'primary.dark',
          color: 'white',
          mb: 6,
          py: { xs: 6, md: 12 },
          borderRadius: 0,
          backgroundImage: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
          overflow: 'hidden'
        }}
      >
        {/* Animated background elements */}
        <MotionBox
          sx={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.03)',
            top: '-50px',
            right: '10%',
          }}
          animate={{
            y: [0, 20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <MotionBox
          sx={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            bottom: '-30px',
            left: '5%',
          }}
          animate={{
            y: [0, -15, 0],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <Container maxWidth="lg">
          <MotionBox 
            sx={{ maxWidth: { xs: '100%', md: '60%' } }}
            variants={heroTextContainer}
          >
            <MotionTypography 
              variant="h2" 
              component="h1" 
              variants={slideInFromLeft}
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                background: 'linear-gradient(90deg, #ffffff 0%, #e3f2fd 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              Chalkstone Council Issue Reporting
            </MotionTypography>
            <MotionTypography 
              variant="h6" 
              variants={slideInFromLeft}
              sx={{ 
                mb: 4, 
                fontWeight: 400,
                opacity: 0.9,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Help improve your community by reporting issues such as potholes,
              street lighting problems, graffiti, and more.
            </MotionTypography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <MotionButton 
                variant="contained" 
                size="large"
                component={RouterLink} 
                to={currentUser ? "/report" : "/login"}
                endIcon={<ArrowForwardIcon />}
                variants={fadeIn}
                whileHover={buttonHover}
                whileTap={{ scale: 0.95 }}
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.dark',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}
              >
                {currentUser ? "Report an Issue" : "Login to Report an Issue"}
              </MotionButton>
              <MotionButton 
                variant="outlined" 
                size="large"
                component={RouterLink} 
                to="/about"
                variants={fadeIn}
                whileHover={buttonHover}
                whileTap={{ scale: 0.95 }}
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  '&:hover': {
                    borderColor: 'grey.300',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  backdropFilter: 'blur(4px)'
                }}
              >
                Learn More
              </MotionButton>
            </Stack>
          </MotionBox>
        </Container>
        
        {/* Dynamic decorative elements */}
        <MotionBox 
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: { xs: '100%', md: '40%' },
            height: '100%',
            background: 'radial-gradient(circle at 70% 50%, rgba(66, 165, 245, 0.4) 0%, rgba(25, 118, 210, 0) 70%)',
            display: { xs: 'none', md: 'block' },
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </MotionPaper>

      {/* Map Section */}
      <MotionContainer 
        maxWidth="lg" 
        sx={{ mb: 8 }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
      >
        <MotionTypography 
          variant="h4" 
          component="h2" 
          variants={fadeIn}
          sx={{ 
            fontWeight: 700, 
            mb: 1,
            textAlign: 'center'
          }}
        >
          Current Issues in the Area
        </MotionTypography>
        <MotionTypography 
          variant="subtitle1" 
          variants={fadeIn}
          sx={{ 
            mb: 4, 
            color: 'text.secondary',
            textAlign: 'center'
          }}
        >
          Explore the map to see reported issues in Chalkstone. Click on markers for more details.
        </MotionTypography>
        <MotionPaper 
          elevation={3} 
          variants={popUp}
          whileHover={{
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          }}
          sx={{ 
            borderRadius: 2, 
            overflow: 'hidden', 
            height: 500 
          }}
        >
          <IssueMap />
        </MotionPaper>
      </MotionContainer>

      {/* Issue Types Section */}
      <MotionBox 
        sx={{ py: 8, bgcolor: 'grey.50', position: 'relative', overflow: 'hidden' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        {/* Decorative elements */}
        <MotionBox
          sx={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0) 70%)',
            borderRadius: '50%',
            top: '10%',
            left: '5%',
            zIndex: 0
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <MotionBox
          sx={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(25, 118, 210, 0.03) 0%, rgba(25, 118, 210, 0) 70%)',
            borderRadius: '50%',
            bottom: '5%',
            right: '10%',
            zIndex: 0
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <MotionTypography 
            variant="h4" 
            component="h2" 
            variants={fadeIn}
            sx={{ 
              fontWeight: 700, 
              mb: 1,
              textAlign: 'center'
            }}
          >
            Types of Issues You Can Report
          </MotionTypography>
          <MotionTypography 
            variant="subtitle1" 
            variants={fadeIn}
            sx={{ 
              mb: 6, 
              color: 'text.secondary',
              textAlign: 'center'
            }}
          >
            We handle a variety of community issues to keep Chalkstone clean and safe
          </MotionTypography>
          <MotionBox
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <Grid container spacing={3}>
              {issueTypes.map((issue, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <MotionCard 
                    elevation={0} 
                    variants={popUp}
                    whileHover="hover"
                    sx={{ 
                      height: '100%', 
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <MotionBox 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          mb: 2,
                          color: 'primary.main'
                        }}
                        whileHover={{ 
                          rotate: [0, -10, 10, -10, 0],
                          transition: { duration: 0.5 }
                        }}
                      >
                        {issue.icon}
                      </MotionBox>
                      <MotionTypography 
                        variant="h5" 
                        component="h3" 
                        variants={fadeIn}
                        sx={{ 
                          fontWeight: 600, 
                          mb: 1,
                          textAlign: 'center'
                        }}
                      >
                        {issue.title}
                      </MotionTypography>
                      <MotionTypography 
                        variant="body2" 
                        variants={fadeIn}
                        sx={{ 
                          color: 'text.secondary',
                          textAlign: 'center'
                        }}
                      >
                        {issue.description}
                      </MotionTypography>
                    </CardContent>
                  </MotionCard>
                </Grid>
              ))}
            </Grid>
          </MotionBox>
        </Container>
      </MotionBox>

      {/* Info Section */}
      <MotionContainer 
        maxWidth="lg" 
        sx={{ py: 8 }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <Grid container spacing={4}>
          {infoCards.map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              <MotionCard 
                elevation={2} 
                variants={popUp}
                whileHover="hover"
                sx={{ 
                  height: '100%', 
                  borderRadius: 2,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <MotionBox 
                    sx={{ 
                      color: 'primary.main', 
                      mb: 2,
                      display: 'inline-block'
                    }}
                    whileHover={{ 
                      rotate: 360,
                      scale: 1.2,
                      transition: { duration: 0.6, ease: 'easeInOut' } 
                    }}
                  >
                    {card.icon}
                  </MotionBox>
                  <MotionTypography 
                    variant="h5" 
                    component="h3" 
                    variants={fadeIn}
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    {card.title}
                  </MotionTypography>
                  <MotionTypography 
                    variant="body1" 
                    variants={fadeIn}
                    sx={{ mb: 3, color: 'text.secondary' }}
                  >
                    {card.description}
                  </MotionTypography>
                  <MotionBox
                    component={RouterLink}
                    to={card.link}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      fontWeight: 600,
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.dark',
                      }
                    }}
                  >
                    {card.linkText} <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                  </MotionBox>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </MotionContainer>

      {/* Stats Section */}
      <MotionBox 
        sx={{ 
          bgcolor: 'primary.main',
          color: 'white', 
          py: 8,
          position: 'relative',
          backgroundImage: 'linear-gradient(135deg, #2196f3 0%, #0d47a1 100%)',
          overflow: 'hidden'
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Animated particles */}
        {[...Array(10)].map((_, i) => (
          <MotionBox
            key={i}
            sx={{
              position: 'absolute',
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.03)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              zIndex: 0
            }}
            animate={{
              y: [0, Math.random() * 40 - 20],
              x: [0, Math.random() * 40 - 20],
              scale: [1, Math.random() * 0.5 + 0.8, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <MotionTypography 
            variant="h4" 
            component="h2" 
            variants={fadeIn}
            sx={{ 
              fontWeight: 700, 
              mb: 6,
              textAlign: 'center',
              color: 'white'
            }}
          >
            Making a Difference Together
          </MotionTypography>
          <MotionBox
            variants={staggerContainer}
          >
            <Grid container spacing={4} justifyContent="center">
              {stats.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <MotionBox 
                    variants={popUp}
                    whileHover={{ 
                      y: -5,
                      boxShadow: '0 15px 30px rgba(0,0,0,0.2)'
                    }}
                    sx={{ 
                      textAlign: 'center',
                      p: 2,
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <MotionTypography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 1,
                        color: 'white'
                      }}
                      animate={{ 
                        scale: [1, 1.05, 1],
                        transition: { 
                          duration: 2, 
                          repeat: Infinity,
                          repeatType: 'mirror' 
                        } 
                      }}
                    >
                      {stat.value}
                    </MotionTypography>
                    <MotionTypography 
                      variant="subtitle1" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)'
                      }}
                    >
                      {stat.label}
                    </MotionTypography>
                  </MotionBox>
                </Grid>
              ))}
            </Grid>
          </MotionBox>
        </Container>
      </MotionBox>

      {/* CTA Section */}
      <MotionBox 
        sx={{ 
          py: 8, 
          bgcolor: 'grey.50', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
      >
        {/* Background gradient */}
        <MotionBox
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(66, 165, 245, 0.05) 0%, rgba(66, 165, 245, 0) 70%)',
            zIndex: 0
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <MotionTypography 
            variant="h3" 
            component="h2" 
            variants={slideInFromLeft}
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Ready to improve your community?
          </MotionTypography>
          <MotionTypography 
            variant="h6" 
            variants={slideInFromRight}
            sx={{ 
              mb: 4, 
              color: 'text.secondary',
              fontWeight: 400
            }}
          >
            Join our efforts to make Chalkstone a better place for everyone.
          </MotionTypography>
          <MotionBox variants={fadeIn}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2}
              justifyContent="center"
            >
              {!currentUser ? (
                <>
                  <MotionButton 
                    variant="contained" 
                    size="large"
                    component={RouterLink} 
                    to="/register"
                    whileHover={buttonHover}
                    whileTap={{ scale: 0.95 }}
                    sx={{ 
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}
                  >
                    Create an Account
                  </MotionButton>
                  <MotionButton 
                    variant="outlined" 
                    size="large"
                    component={RouterLink} 
                    to="/login"
                    whileHover={buttonHover}
                    whileTap={{ scale: 0.95 }}
                    sx={{ 
                      px: 4,
                      py: 1.5,
                      fontWeight: 600
                    }}
                  >
                    Login
                  </MotionButton>
                </>
              ) : (
                <MotionButton 
                  variant="contained" 
                  size="large"
                  component={RouterLink} 
                  to="/report"
                  startIcon={<ReportProblemIcon />}
                  whileHover={buttonHover}
                  whileTap={{ scale: 0.95 }}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                  }}
                >
                  Report an Issue
                </MotionButton>
              )}
            </Stack>
          </MotionBox>
        </Container>
      </MotionBox>
    </MotionBox>
  );
};

export default HomePage;
