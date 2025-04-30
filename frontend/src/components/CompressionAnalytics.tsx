import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

interface AnalyticsData {
  _id: string;
  filename: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  algorithm: string;
  timestamp: string;
}

const CompressionAnalytics: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const token = await user?.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const data = await response.json();
        setAnalyticsData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Compression Analytics
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary Statistics */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Summary Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" color="text.secondary">
                  Total Files Compressed
                </Typography>
                <Typography variant="h4">{analyticsData.length}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" color="text.secondary">
                  Average Compression Ratio
                </Typography>
                <Typography variant="h4">
                  {analyticsData.length > 0
                    ? `${(
                        analyticsData.reduce(
                          (acc, curr) => acc + curr.compressionRatio,
                          0
                        ) / analyticsData.length
                      ).toFixed(2)}%`
                    : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" color="text.secondary">
                  Total Space Saved
                </Typography>
                <Typography variant="h4">
                  {analyticsData.length > 0
                    ? formatBytes(
                        analyticsData.reduce(
                          (acc, curr) => acc + (curr.originalSize - curr.compressedSize),
                          0
                        )
                      )
                    : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Compression Ratio Trend */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              height: '400px',
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Compression Ratio Trend
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Compression Ratio']}
                  labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="compressionRatio"
                  stroke={theme.palette.primary.main}
                  name="Compression Ratio"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* File Size Comparison */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              height: '400px',
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" gutterBottom>
              File Size Comparison
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="filename"
                  tickFormatter={(name) => name.substring(0, 10) + '...'}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [formatBytes(value as number), 'Size']}
                />
                <Legend />
                <Bar
                  dataKey="originalSize"
                  fill={theme.palette.error.main}
                  name="Original Size"
                />
                <Bar
                  dataKey="compressedSize"
                  fill={theme.palette.success.main}
                  name="Compressed Size"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CompressionAnalytics; 