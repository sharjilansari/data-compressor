import React from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container,
} from '@mui/material';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SpeedIcon from '@mui/icons-material/Speed';
import StorageIcon from '@mui/icons-material/Storage';

interface CompressionData {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  algorithm: string;
  timestamp: number;
}

interface CompressionStatsProps {
  data: CompressionData[];
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const CompressionStats: React.FC<CompressionStatsProps> = ({ data }) => {
  const theme = useTheme();

  const calculateAverage = (key: 'originalSize' | 'compressedSize' | 'compressionRatio'): number => {
    const sum = data.reduce((acc, item) => acc + item[key], 0);
    return sum / data.length;
  };

  const averageCompressionRatio = calculateAverage('compressionRatio');
  const averageSizeReduction = (1 - calculateAverage('compressionRatio')) * 100;

  return (
    <Box sx={{ width: '100%' }}>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              background: 'transparent',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : theme.palette.divider}`,
              borderRadius: 2,
              mb: 4,
            }}
          >
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box
                sx={{
                  flex: 1,
                  minWidth: 200,
                  p: 3,
                  borderRadius: 2,
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(33, 150, 243, 0.1)'
                    : 'rgba(33, 150, 243, 0.05)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <TrendingDownIcon color="primary" />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: theme.palette.mode === 'dark' ? 'white' : 'primary.main',
                      fontWeight: 'bold'
                    }}
                  >
                    Average Size Reduction
                  </Typography>
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: theme.palette.mode === 'dark' ? 'white' : 'inherit'
                  }}
                >
                  {averageSizeReduction.toFixed(1)}%
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minWidth: 200,
                  p: 3,
                  borderRadius: 2,
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(76, 175, 80, 0.1)'
                    : 'rgba(76, 175, 80, 0.05)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <SpeedIcon color="success" />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: theme.palette.mode === 'dark' ? 'white' : 'success.main',
                      fontWeight: 'bold'
                    }}
                  >
                    Average Compression Ratio
                  </Typography>
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: theme.palette.mode === 'dark' ? 'white' : 'inherit'
                  }}
                >
                  {averageCompressionRatio.toFixed(2)}x
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minWidth: 200,
                  p: 3,
                  borderRadius: 2,
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(156, 39, 176, 0.1)'
                    : 'rgba(156, 39, 176, 0.05)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <StorageIcon color="secondary" />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: theme.palette.mode === 'dark' ? 'white' : 'secondary.main',
                      fontWeight: 'bold'
                    }}
                  >
                    Total Files Compressed
                  </Typography>
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: theme.palette.mode === 'dark' ? 'white' : 'inherit'
                  }}
                >
                  {data.length}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              background: 'transparent',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'inherit', fontWeight: 'bold' }}>File</TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'inherit', fontWeight: 'bold' }}>
                      Original Size
                    </TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'inherit', fontWeight: 'bold' }}>
                      Compressed Size
                    </TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'inherit', fontWeight: 'bold' }}>
                      Compression Ratio
                    </TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'inherit', fontWeight: 'bold' }}>
                      Algorithm
                    </TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'inherit', fontWeight: 'bold' }}>
                      Time
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        '&:hover': {
                          background: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.02)',
                        },
                      }}
                    >
                      <TableCell sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'inherit' }}>
                        File {index + 1}
                      </TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'inherit' }}>
                        {formatBytes(item.originalSize)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'inherit' }}>
                        {formatBytes(item.compressedSize)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'inherit' }}>
                        {item.compressionRatio.toFixed(2)}x
                      </TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'inherit' }}>
                        {item.algorithm.toUpperCase()}
                      </TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'inherit' }}>
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default CompressionStats;
