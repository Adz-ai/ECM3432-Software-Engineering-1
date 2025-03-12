// src/pages/ReportIssuePage.jsx

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import IssueForm from '../components/issues/IssueForm';
import { motion } from 'framer-motion';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  useTheme,
  alpha
} from '@mui/material';

// Define reusable motion components
const MotionBox = motion(Box);
const MotionContainer = motion(Container);
const MotionTypography = motion(Typography);
const MotionPaper = motion(Paper);
const MotionGrid = motion(Grid);

const ReportIssuePage = () => {
  const { currentUser } = useContext(AuthContext);
  const theme = useTheme();

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };

  const slideInFromLeft = {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const popUp = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
    hover: { scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', transition: { duration: 0.3 } }
  };

  // If not logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: '/report' }} />;
  }

  return (
    <MotionBox 
      sx={{ 
        minHeight: 'calc(100vh - 64px - 80px)', // Adjust based on header and footer height
        background: 'linear-gradient(to bottom, #f9f9f9 0%, #ffffff 100%)'
      }}
      initial="hidden"
      animate="visible"
    >
      <MotionContainer maxWidth="lg" sx={{ py: 6 }}>
        {/* Header Section */}
        <MotionBox 
          sx={{ textAlign: 'center', mb: 6 }}
          variants={fadeIn}
        >
          <MotionTypography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              position: 'relative',
              display: 'inline-block'
            }}
          >
            Report an Issue
            <MotionBox
              sx={{
                position: 'absolute',
                bottom: 0,
                left: '10%',
                width: '80%',
                height: '4px',
                background: 'linear-gradient(90deg, transparent, rgba(66, 165, 245, 0.5), transparent)',
                borderRadius: '2px',
              }}
              animate={{
                width: ['0%', '80%'],
                left: ['50%', '10%'],
                opacity: [0, 1]
              }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
            />
          </MotionTypography>
          <MotionTypography 
            variant="h6" 
            sx={{ color: 'text.secondary', maxWidth: '800px', mx: 'auto' }}
            variants={fadeIn}
          >
            Help improve your community by reporting issues you've found.
          </MotionTypography>
        </MotionBox>

        {/* Instructions Section */}
        <MotionBox 
          sx={{ mb: 6 }}
          variants={staggerContainer}
        >
          <MotionGrid container spacing={3}>
            {[
              {
                number: 1,
                title: 'Select Issue Type',
                description: 'Choose the category that best describes the issue you\'ve found.'
              },
              {
                number: 2,
                title: 'Describe the Problem',
                description: 'Provide as much detail as possible about the issue.'
              },
              {
                number: 3,
                title: 'Mark the Location',
                description: 'Click on the map to pinpoint exactly where the issue is located.'
              },
              {
                number: 4,
                title: 'Add Photos (Optional)',
                description: 'Upload images to help our team better understand the issue.'
              }
            ].map((step, index) => (
              <MotionGrid item xs={12} sm={6} md={3} key={index} variants={popUp}>
                <MotionPaper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                    background: alpha(theme.palette.primary.light, 0.03),
                    transition: '0.3s all ease-in-out',
                    '&:hover': {
                      background: alpha(theme.palette.primary.light, 0.05),
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                    }
                  }}
                  whileHover={{
                    y: -5,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    transition: { duration: 0.3 }
                  }}
                >
                  <MotionBox
                    sx={{
                      position: 'absolute',
                      top: '-10px',
                      right: '-10px',
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: alpha(theme.palette.primary.main, 0.05),
                      zIndex: 0
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 0.9, 0.7]  
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: 'loop',
                      ease: 'easeInOut'
                    }}
                  />
                  
                  <MotionBox 
                    sx={{ 
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      mb: 2,
                      position: 'relative',
                      zIndex: 1,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {step.number}
                  </MotionBox>
                  <MotionTypography 
                    variant="h6" 
                    component="h3" 
                    sx={{ fontWeight: 600, mb: 1, position: 'relative', zIndex: 1 }}
                  >
                    {step.title}
                  </MotionTypography>
                  <MotionTypography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ position: 'relative', zIndex: 1 }}
                  >
                    {step.description}
                  </MotionTypography>
                </MotionPaper>
              </MotionGrid>
            ))}
          </MotionGrid>
        </MotionBox>

        {/* Form Section */}
        <MotionPaper 
          elevation={0}
          sx={{ 
            p: { xs: 2, sm: 4 },
            borderRadius: 2,
            background: '#fff',
            boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}
          variants={fadeIn}
        >
          {/* Background decoration */}
          <MotionBox
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(66, 165, 245, 0.05) 0%, rgba(66, 165, 245, 0) 70%)',
              zIndex: 0
            }}
          />
          <MotionBox
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(66, 165, 245, 0.05) 0%, rgba(66, 165, 245, 0) 70%)',
              zIndex: 0
            }}
          />

          <MotionBox sx={{ position: 'relative', zIndex: 1 }}>
            <IssueForm />
          </MotionBox>
        </MotionPaper>
      </MotionContainer>
    </MotionBox>
  );
};

export default ReportIssuePage;
