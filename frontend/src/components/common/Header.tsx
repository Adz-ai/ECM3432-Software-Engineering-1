// src/components/common/Header.jsx

import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

// Material UI imports
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Header = () => {
  const { currentUser, logout, isStaff } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for handling mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);
  // State for user menu
  const [anchorElUser, setAnchorElUser] = useState(null);

  // Debug display to show authentication state
  const showDebugInfo = import.meta.env.DEV;

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Navigation items
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Report Issue', path: '/report', requiresAuth: true, icon: <ReportProblemIcon fontSize="small" /> },
    { label: 'Dashboard', path: '/dashboard', requiresStaff: true, icon: <DashboardIcon fontSize="small" /> },
  ];

  // Drawer content for mobile
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ 
          color: 'primary.main', 
          textDecoration: 'none',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
        }}>
          Chalkstone Council
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => {
          // Skip staff-only items for non-staff users
          if (item.requiresStaff && (!currentUser || !isStaff())) return null;
          // Skip auth-required items for non-logged in users
          if (item.requiresAuth && !currentUser) return null;
          
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton 
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.12)',
                    },
                  },
                }}
              >
                {item.icon && <Box sx={{ mr: 1.5 }}>{item.icon}</Box>}
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      {!currentUser ? (
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/login')}>
              <Box sx={{ mr: 1.5 }}><LoginIcon fontSize="small" /></Box>
              <ListItemText primary="Login" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/register')}>
              <Box sx={{ mr: 1.5 }}><PersonAddIcon fontSize="small" /></Box>
              <ListItemText primary="Register" />
            </ListItemButton>
          </ListItem>
        </List>
      ) : (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Logged in as: {currentUser.username}
            {isStaff() && (
              <Chip 
                size="small" 
                label="Staff" 
                color="primary" 
                sx={{ ml: 1, height: 20, fontSize: '0.625rem' }} 
              />
            )}
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            size="small"
            fullWidth 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" color="default" elevation={0} sx={{ 
        backgroundColor: 'white',
        borderBottom: 1, 
        borderColor: 'divider' 
      }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Mobile menu icon */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>
            
            {/* Logo */}
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'flex' },
                fontWeight: 700,
                color: 'primary.main',
                textDecoration: 'none',
                flexGrow: { xs: 1, md: 0 }
              }}
            >
              Chalkstone Council
            </Typography>

            {/* Desktop navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
              {navItems.map((item) => {
                // Skip staff-only items for non-staff users
                if (item.requiresStaff && (!currentUser || !isStaff())) return null;
                // Skip auth-required items for non-logged in users
                if (item.requiresAuth && !currentUser) return null;
                
                return (
                  <Button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      mx: 1,
                      color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      position: 'relative',
                      '&::after': location.pathname === item.path ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '3px',
                        backgroundColor: 'primary.main',
                        borderRadius: '3px 3px 0 0',
                      } : {},
                    }}
                    startIcon={item.icon}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>

            {/* Auth section */}
            <Box sx={{ display: 'flex' }}>
              {!currentUser ? (
                // Not logged in - show login/register buttons
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    component={RouterLink} 
                    to="/login"
                    startIcon={<LoginIcon />}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="contained" 
                    component={RouterLink} 
                    to="/register"
                    startIcon={<PersonAddIcon />}
                  >
                    Register
                  </Button>
                </Box>
              ) : (
                // Logged in - show user menu
                <Box sx={{ flexGrow: 0 }}>
                  <Tooltip title="Open user menu">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : <AccountCircleIcon />}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="subtitle2">
                        {currentUser.username}
                        {isStaff() && (
                          <Chip 
                            size="small" 
                            label="Staff" 
                            color="primary" 
                            sx={{ ml: 1, height: 20, fontSize: '0.625rem' }} 
                          />
                        )}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 250,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Debug info section - Only shown in development */}
      {showDebugInfo && (
        <Box sx={{ 
          bgcolor: '#f8f9fa', 
          borderTop: '1px solid #dee2e6',
          p: 1,
          fontSize: '0.875rem',
          color: '#6c757d',
        }}>
          <details>
            <summary style={{ cursor: 'pointer', userSelect: 'none' }}>Debug Auth Info</summary>
            <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {JSON.stringify({
                currentUser,
                isStaff: isStaff(),
                hasToken: !!localStorage.getItem('token')
              }, null, 2)}
            </pre>
          </details>
        </Box>
      )}
    </>
  );
};

export default Header;
