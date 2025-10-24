// src/components/common/Footer.jsx

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  Stack,
  IconButton,
  useTheme,
} from '@mui/material';

// Icons
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const theme = useTheme();

  return (
    <Box 
      component="footer" 
      sx={{
        bgcolor: theme.palette.grey[900],
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and Tagline */}
          <Grid item xs={12} md={4}>
            <Typography variant="h5" fontWeight="bold" color="primary.light" gutterBottom>
              Chalkstone Council
            </Typography>
            <Typography variant="body2" color="grey.400" mb={2}>
              Working together for a better community
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton aria-label="facebook" size="small" sx={{ color: '#4267B2' }}>
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton aria-label="twitter" size="small" sx={{ color: '#1DA1F2' }}>
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton aria-label="instagram" size="small" sx={{ color: '#E1306C' }}>
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton aria-label="linkedin" size="small" sx={{ color: '#0077B5' }}>
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>

          {/* Links */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="primary.light" gutterBottom>
              Services
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/" color="grey.400" underline="hover">
                  Home
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/report" color="grey.400" underline="hover">
                  Report Issue
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/about" color="grey.400" underline="hover">
                  About
                </Link>
              </Box>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="primary.light" gutterBottom>
              Contact Us
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'grey.400' }} />
                <Typography variant="body2" color="grey.400">
                  123 Main Street<br />
                  Chalkstone, EX1 1AA
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon fontSize="small" sx={{ mr: 1, color: 'grey.400' }} />
                <Link href="mailto:info@chalkstone.gov.uk" color="grey.400" underline="hover">
                  info@chalkstone.gov.uk
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'grey.400' }} />
                <Link href="tel:+441234567890" color="grey.400" underline="hover">
                  +44 (0)1234 567890
                </Link>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'grey.800' }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="grey.500">
            &copy; {currentYear} Chalkstone Council. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
