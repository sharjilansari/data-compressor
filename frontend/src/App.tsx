import { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container, Box, Typography } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Navbar from './components/Navbar';
import FileUpload from './components/FileUpload';
import CompressionStats from './components/CompressionStats';
import LandingPage from './components/LandingPage';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import theme from './theme';
import ProtectedRoute from './components/ProtectedRoute';
import CompressionAnalytics from './components/CompressionAnalytics';
import './firebase'; // Fixed import path

interface CompressionData {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  algorithm: string;
  timestamp: number;
}

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [compressionData, setCompressionData] = useState<CompressionData[]>([]);

  const currentTheme = useMemo(
    () =>
      createTheme({
        ...theme,
        palette: {
          ...theme.palette,
          mode,
        },
      }),
    [mode],
  );

  const handleCompressionComplete = (data: CompressionData) => {
    setCompressionData(prev => [...prev, data]);
  };

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar mode={mode} onToggleColorMode={toggleColorMode} />
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: '100vh', 
              width: '100%',
              color: 'text.primary',
              bgcolor: 'background.default'
            }}
          >
            <Box 
              component="main" 
              sx={{ 
                flex: 1, 
                width: '100%',
                color: 'text.primary',
                bgcolor: 'background.default'
              }}
            >
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/auth/google/callback" element={<div>Processing Google authentication...</div>} />
                <Route
                  path="/compress"
                  element={
                    <ProtectedRoute>
                      <Box 
                        sx={{ 
                          width: '100%', 
                          display: 'flex', 
                          justifyContent: 'center',
                          minHeight: '100vh',
                          background: currentTheme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)'
                            : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                          py: 8,
                          color: 'text.primary'
                        }}
                      >
                        <Container maxWidth="lg" sx={{ py: 4, width: '100%' }}>
                          <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                          >
                            <Typography 
                              variant="h3" 
                              component="h1" 
                              gutterBottom 
                              align="center"
                              sx={{
                                fontWeight: 'bold',
                                background: currentTheme.palette.mode === 'dark'
                                  ? 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                                  : 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 4,
                              }}
                            >
                              NetCompress
                            </Typography>
                            <Typography 
                              variant="h6" 
                              align="center" 
                              color="text.secondary" 
                              sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
                            >
                              Advanced Network Data Compression for Optimized Performance
                            </Typography>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          >
                            <FileUpload onCompressionComplete={handleCompressionComplete} />
                          </motion.div>

                          {compressionData.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.8, delay: 0.4 }}
                            >
                              <CompressionStats data={compressionData} />
                            </motion.div>
                          )}
                        </Container>
                      </Box>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stats"
                  element={
                    <ProtectedRoute>
                      <CompressionStats data={compressionData} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <CompressionAnalytics />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
