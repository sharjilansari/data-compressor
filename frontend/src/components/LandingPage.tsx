import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  useTheme,
  Grid,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import { motion } from 'framer-motion';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
  borderRadius: '20px',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string 
}) => {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <StyledPaper>
        <Box sx={{ mb: 2, color: theme.palette.primary.main }}>
          {icon}
        </Box>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color={theme.palette.mode === 'dark' ? 'text.secondary' : 'text.primary'}>
          {description}
        </Typography>
      </StyledPaper>
    </motion.div>
  );
};

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 8,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container maxWidth={false} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h2"
            component="h1"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                : 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 4,
            }}
          >
            NetCompress
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Typography
            variant="h5"
            align="center"
            color={theme.palette.mode === 'dark' ? 'text.secondary' : 'text.primary'}
            sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
          >
            Advanced Network Data Compression for Optimized Performance
          </Typography>
        </motion.div>

        <Grid container spacing={4} sx={{ mb: 8, flex: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard
              icon={<SpeedIcon sx={{ fontSize: 40 }} />}
              title="High Performance"
              description="Advanced compression algorithms for maximum efficiency and speed."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard
              icon={<SecurityIcon sx={{ fontSize: 40 }} />}
              title="Secure"
              description="Enterprise-grade security with end-to-end encryption."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard
              icon={<StorageIcon sx={{ fontSize: 40 }} />}
              title="Optimized Storage"
              description="Reduce storage requirements while maintaining data integrity."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard
              icon={<CloudUploadIcon sx={{ fontSize: 40 }} />}
              title="Easy Integration"
              description="Simple API integration for seamless implementation."
            />
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<CloudUploadIcon />}
              onClick={() => navigate('/compress')}
              sx={{
                px: 4,
                py: 2,
                borderRadius: '50px',
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                  : 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
                '&:hover': {
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, #1976d2 30%, #1E88E5 90%)'
                    : 'linear-gradient(45deg, #1565C0 30%, #1E88E5 90%)',
                },
              }}
            >
              Start Compressing
            </Button>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
