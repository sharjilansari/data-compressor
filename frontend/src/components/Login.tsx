import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  useTheme,
  Link,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import GoogleIcon from '@mui/icons-material/Google';

const Login: React.FC = () => {
  const { login, googleSignIn, error, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/compress');
    } catch (error) {
      // Handle error in UI (already managed by error state)
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleSignIn();
      navigate('/compress');
    } catch (error) {
      // Handle error in UI (already managed by error state)
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 8,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.8)' 
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: 0,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                mb: 3,
                color: theme.palette.text.primary,
                fontWeight: 'bold',
              }}
            >
              Welcome Back
            </Typography>
            
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{
                mb: 3,
                py: 1.5,
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
                borderRadius: 0,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: 'transparent',
                  color: theme.palette.text.primary,
                },
              }}
            >
              Continue with Google
            </Button>

            <Divider sx={{ width: '100%', mb: 3 }} />

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 0,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                  },
                }}
              >
                Sign In
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link 
                  component={RouterLink} 
                  to="/signup" 
                  variant="body2"
                  sx={{
                    color: theme.palette.text.primary,
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {"Don't have an account? Sign Up"}
                </Link>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
