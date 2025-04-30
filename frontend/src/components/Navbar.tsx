import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  useTheme,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.jpeg';

interface NavbarProps {
  mode: 'light' | 'dark';
  onToggleColorMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ mode, onToggleColorMode }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const textColor = theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: theme.palette.mode === 'dark' 
          ? 'rgba(0, 0, 0, 0.9)' 
          : 'rgba(255, 255, 255, 0.8)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease-in-out',
        borderRadius: 0,
        '& .MuiButton-root': {
          borderRadius: 0,
        },
      }}
    >
      <Toolbar sx={{ minHeight: '64px' }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            gap: 1,
          }}
        >
          <img 
            src={logo} 
            alt="NetCompress Logo" 
            style={{ 
              height: '40px', 
              width: 'auto',
              borderRadius: '4px',
            }} 
          />
          <Typography
            variant="h4"
            sx={{
              color: textColor,
              fontWeight: 'bold',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            NetCompress
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
          <IconButton
            onClick={onToggleColorMode}
            sx={{
              color: textColor,
              transition: 'all 0.3s ease-in-out',
              borderRadius: 0,
              '&:hover': {
                opacity: 0.8,
                backgroundColor: 'transparent',
              },
            }}
          >
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          {user ? (
            <>
              <Button
                component={RouterLink}
                to="/compress"
                sx={{
                  color: textColor,
                  borderColor: textColor,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    opacity: 0.8,
                    backgroundColor: 'transparent',
                    borderColor: textColor,
                    color: textColor,
                  },
                }}
                variant="outlined"
              >
                Compress
              </Button>
              <Button
                onClick={handleLogout}
                sx={{
                  color: textColor,
                  borderColor: textColor,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    opacity: 0.8,
                    backgroundColor: 'transparent',
                    borderColor: textColor,
                    color: textColor,
                  },
                }}
                variant="outlined"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                component={RouterLink}
                to="/login"
                sx={{
                  color: textColor,
                  borderColor: textColor,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    opacity: 0.8,
                    backgroundColor: 'transparent',
                    borderColor: textColor,
                    color: textColor,
                  },
                }}
                variant="outlined"
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/signup"
                sx={{
                  color: textColor,
                  borderColor: textColor,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    opacity: 0.8,
                    backgroundColor: 'transparent',
                    borderColor: textColor,
                    color: textColor,
                  },
                }}
                variant="outlined"
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 