// src/pages/AboutPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Stack
} from '@mui/material';

// Import icons
import {
  Lightbulb as MissionIcon,
  Build as PotholeIcon,
  WbIncandescent as StreetLightIcon,
  Brush as GraffitiIcon,
  NoiseAware as AntiSocialIcon,
  Delete as FlyTippingIcon,
  Water as BlockedDrainIcon,
  People as TeamIcon,
  CheckCircle as CheckIcon,
  VolunteerActivism as GetInvolvedIcon
} from '@mui/icons-material';

// Create motion components
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);
const MotionGrid = motion(Grid);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

const AboutPage = () => {
  const theme = useTheme();
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };
  
  const slideUp = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
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
  
  return (
    <MotionContainer 
      maxWidth="lg" 
      sx={{ py: 6 }}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Header Section */}
      <MotionBox 
        sx={{ 
          mb: 6, 
          textAlign: 'center',
          position: 'relative' 
        }}
        variants={slideUp}
      >
        <MotionTypography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          About the Chalkstone Council Reports System
        </MotionTypography>
        <MotionTypography 
          variant="h5" 
          color="text.secondary"
          sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}
        >
          Connecting residents with council services to build a better community
        </MotionTypography>
        <Divider sx={{ width: '100px', mx: 'auto', borderWidth: 2, borderColor: theme.palette.primary.main, mb: 2 }} />
      </MotionBox>

      {/* Mission Section */}
      <MotionPaper 
        elevation={2} 
        sx={{ 
          p: 4, 
          mb: 6, 
          borderRadius: 3,
          background: alpha(theme.palette.primary.light, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
        variants={slideUp}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
            <Box 
              sx={{ 
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                background: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                mb: { xs: 2, md: 0 }
              }}
            >
              <MissionIcon sx={{ fontSize: 64 }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={10}>
            <MotionTypography 
              variant="h4" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                position: 'relative',
                display: 'inline-block',
                mb: 3,
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
            >
              Our Mission
            </MotionTypography>
            <MotionTypography variant="body1" paragraph>
              The Chalkstone Council Reports System is designed to empower residents to take an active role
              in improving their community. By providing an easy-to-use platform for reporting local issues,
              we aim to enhance the efficiency of council services and create a more responsive local government.
            </MotionTypography>
          </Grid>
        </Grid>
      </MotionPaper>

      {/* How It Works Section */}
      <MotionBox 
        id="how-it-works" 
        sx={{ mb: 8 }}
        variants={fadeIn}
      >
        <MotionTypography 
          variant="h3" 
          component="h2" 
          textAlign="center" 
          gutterBottom
          sx={{ 
            mb: 6,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          How It Works
        </MotionTypography>
        
        <MotionGrid 
          container 
          spacing={3}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <MotionGrid item xs={12} sm={6} md={3} variants={slideUp}>
            <MotionCard 
              sx={{ 
                height: '100%', 
                borderRadius: 3,
                position: 'relative',
                overflow: 'visible',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: -20, 
                  left: 'calc(50% - 20px)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.primary.main,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}
              >
                1
              </Box>
              <CardContent sx={{ pt: 4, px: 3, pb: 3, textAlign: 'center' }}>
                <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                  Report an Issue
                </Typography>
                <Typography variant="body2">
                  Use our platform to report issues such as potholes, street lighting problems,
                  graffiti, and more. Provide details, location, and photos to help our team
                  understand the problem.
                </Typography>
              </CardContent>
            </MotionCard>
          </MotionGrid>

          <MotionGrid item xs={12} sm={6} md={3} variants={slideUp}>
            <MotionCard 
              sx={{ 
                height: '100%', 
                borderRadius: 3,
                position: 'relative',
                overflow: 'visible',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: -20, 
                  left: 'calc(50% - 20px)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.primary.main,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}
              >
                2
              </Box>
              <CardContent sx={{ pt: 4, px: 3, pb: 3, textAlign: 'center' }}>
                <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                  Council Review
                </Typography>
                <Typography variant="body2">
                  Council staff review and validate the reported issues. Each report is categorized
                  and assigned to the appropriate department for resolution.
                </Typography>
              </CardContent>
            </MotionCard>
          </MotionGrid>

          <MotionGrid item xs={12} sm={6} md={3} variants={slideUp}>
            <MotionCard 
              sx={{ 
                height: '100%', 
                borderRadius: 3,
                position: 'relative',
                overflow: 'visible',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: -20, 
                  left: 'calc(50% - 20px)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.primary.main,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}
              >
                3
              </Box>
              <CardContent sx={{ pt: 4, px: 3, pb: 3, textAlign: 'center' }}>
                <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                  Resolution
                </Typography>
                <Typography variant="body2">
                  The responsible department takes action to resolve the issue. You'll receive
                  updates on the progress and can check the status of your report at any time.
                </Typography>
              </CardContent>
            </MotionCard>
          </MotionGrid>

          <MotionGrid item xs={12} sm={6} md={3} variants={slideUp}>
            <MotionCard 
              sx={{ 
                height: '100%', 
                borderRadius: 3,
                position: 'relative',
                overflow: 'visible',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: -20, 
                  left: 'calc(50% - 20px)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.primary.main,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}
              >
                4
              </Box>
              <CardContent sx={{ pt: 4, px: 3, pb: 3, textAlign: 'center' }}>
                <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                  Verification
                </Typography>
                <Typography variant="body2">
                  Once the issue is resolved, you'll be notified and have the opportunity to
                  provide feedback on the resolution.
                </Typography>
              </CardContent>
            </MotionCard>
          </MotionGrid>
        </MotionGrid>
      </MotionBox>

      {/* Types of Issues Section */}
      <MotionBox sx={{ mb: 8 }} variants={fadeIn}>
        <MotionTypography 
          variant="h3" 
          component="h2" 
          textAlign="center" 
          gutterBottom
          sx={{ 
            mb: 6,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Types of Issues We Handle
        </MotionTypography>

        <MotionGrid 
          container 
          spacing={3}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Potholes */}
          <MotionGrid item xs={12} sm={6} md={4} variants={slideUp}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%', 
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transform: 'translateY(-5px)' }
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  color: theme.palette.primary.main
                }}
              >
                <PotholeIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="h3" fontWeight={600}>
                  Potholes
                </Typography>
              </Box>
              <Typography variant="body2">
                Damage to road surfaces that can cause hazards for drivers and pedestrians.
              </Typography>
            </Paper>
          </MotionGrid>

          {/* Street Lighting */}
          <MotionGrid item xs={12} sm={6} md={4} variants={slideUp}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%', 
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transform: 'translateY(-5px)' }
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  color: theme.palette.primary.main
                }}
              >
                <StreetLightIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="h3" fontWeight={600}>
                  Street Lighting
                </Typography>
              </Box>
              <Typography variant="body2">
                Issues with street lamps, including those that are broken or malfunctioning.
              </Typography>
            </Paper>
          </MotionGrid>

          {/* Graffiti */}
          <MotionGrid item xs={12} sm={6} md={4} variants={slideUp}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%', 
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transform: 'translateY(-5px)' }
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  color: theme.palette.primary.main
                }}
              >
                <GraffitiIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="h3" fontWeight={600}>
                  Graffiti
                </Typography>
              </Box>
              <Typography variant="body2">
                Unauthorized painting, writing, or drawings on public or private property.
              </Typography>
            </Paper>
          </MotionGrid>

          {/* Anti-Social Behavior */}
          <MotionGrid item xs={12} sm={6} md={4} variants={slideUp}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%', 
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transform: 'translateY(-5px)' }
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  color: theme.palette.primary.main
                }}
              >
                <AntiSocialIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="h3" fontWeight={600}>
                  Anti-Social Behavior
                </Typography>
              </Box>
              <Typography variant="body2">
                Activities that cause harassment, alarm, or distress to community members.
              </Typography>
            </Paper>
          </MotionGrid>

          {/* Fly Tipping */}
          <MotionGrid item xs={12} sm={6} md={4} variants={slideUp}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%', 
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transform: 'translateY(-5px)' }
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  color: theme.palette.primary.main
                }}
              >
                <FlyTippingIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="h3" fontWeight={600}>
                  Fly Tipping
                </Typography>
              </Box>
              <Typography variant="body2">
                Illegal disposal of waste or rubbish on land not licensed to receive it.
              </Typography>
            </Paper>
          </MotionGrid>

          {/* Blocked Drains */}
          <MotionGrid item xs={12} sm={6} md={4} variants={slideUp}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%', 
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transform: 'translateY(-5px)' }
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  color: theme.palette.primary.main
                }}
              >
                <BlockedDrainIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="h3" fontWeight={600}>
                  Blocked Drains
                </Typography>
              </Box>
              <Typography variant="body2">
                Clogged drains or sewers causing water buildup or potential flooding.
              </Typography>
            </Paper>
          </MotionGrid>
        </MotionGrid>
      </MotionBox>

      {/* Our Team Section */}
      <MotionPaper 
        elevation={2} 
        sx={{ 
          p: 4, 
          mb: 6, 
          borderRadius: 3,
          background: alpha(theme.palette.primary.light, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
        variants={slideUp}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
            <Box 
              sx={{ 
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                background: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                mb: { xs: 2, md: 0 }
              }}
            >
              <TeamIcon sx={{ fontSize: 64 }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={10}>
            <MotionTypography 
              variant="h4" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                position: 'relative',
                display: 'inline-block',
                mb: 3,
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
            >
              Our Team
            </MotionTypography>
            <MotionTypography variant="body1" paragraph>
              The Chalkstone Council Reports System is managed by a dedicated team of council staff
              who are committed to maintaining high standards of public service. Our team includes:
            </MotionTypography>
            <List>
              {[
                'Customer service representatives who receive and process reports',
                'Field staff who investigate and resolve issues',
                'Supervisors who oversee the resolution process and ensure quality',
                'Analysts who study patterns and improve service efficiency'
              ].map((item, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: '36px', color: theme.palette.primary.main }}>
                    <CheckIcon />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </MotionPaper>

      {/* Get Involved Section */}
      <MotionPaper 
        elevation={3}
        sx={{ 
          p: { xs: 3, md: 5 }, 
          mb: 6, 
          borderRadius: 3,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 100%)`,
        }}
        variants={slideUp}
        whileHover={{ y: -5, transition: { duration: 0.3 } }}
      >
        <Box 
          sx={{ 
            mb: 2,
            p: 2,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <GetInvolvedIcon sx={{ fontSize: 64, color: theme.palette.primary.main }} />
        </Box>
        <MotionTypography variant="h3" component="h2" gutterBottom fontWeight={700}>
          Get Involved
        </MotionTypography>
        <MotionTypography variant="body1" paragraph sx={{ mb: 4, maxWidth: '700px', mx: 'auto' }}>
          Join our community effort to make Chalkstone a better place to live, work, and visit.
          Your reports help us identify issues quickly and address them efficiently.
        </MotionTypography>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          justifyContent="center"
        >
          <MotionButton 
            component={Link} 
            to="/register" 
            variant="contained" 
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5, 
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create an Account
          </MotionButton>
          <MotionButton 
            component={Link} 
            to="/report" 
            variant="outlined" 
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              borderWidth: 2
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Report an Issue
          </MotionButton>
        </Stack>
      </MotionPaper>

      {/* Closing MotionContainer tag to fix the lint error */}
    </MotionContainer>
  );
};

export default AboutPage;
