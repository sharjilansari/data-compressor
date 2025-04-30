import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  useTheme,
  CircularProgress,
  Link,
  Chip,
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Grid,
  Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useAuth } from '../contexts/AuthContext';

interface FileUploadProps {
  onCompressionComplete: (data: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    algorithm: string;
    timestamp: number;
    downloadUrl?: string;
  }) => void;
}

const getBestAlgorithm = (file: File): string => {
  const fileType = file.type;
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (fileType.includes('text') || ['txt', 'json', 'xml', 'html', 'css', 'js', 'ts'].includes(fileExtension || '')) {
    return 'brotli';
  }

  if (fileType.includes('image')) {
    return 'gzip';
  }

  if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(fileExtension || '')) {
    return 'deflate';
  }

  return 'gzip';
};

const FileUpload: React.FC<FileUploadProps> = ({ onCompressionComplete }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('');  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const MAX_FILE_SIZE = 100; // MB
  const supportedFileTypes = [
    { type: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'], icon: <ImageIcon /> },
    { type: 'Documents', extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx'], icon: <PictureAsPdfIcon /> },
    { type: 'Text Files', extensions: ['txt', 'json', 'xml', 'html', 'css', 'js', 'ts'], icon: <CodeIcon /> },
    { type: 'Other', extensions: ['zip', 'rar', '7z'], icon: <DescriptionIcon /> },
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setSelectedAlgorithm(getBestAlgorithm(file));
      setError(null);
      setDownloadUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setLoading(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/compression/compress`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Compression failed');
      }

      // Get the compressed file
      const compressedBlob = await response.blob();
      const compressedUrl = URL.createObjectURL(compressedBlob);
      setDownloadUrl(compressedUrl);

      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `compressed_${selectedFile.name}`;

      // Fetch compression metadata using the original filename
      const metadataResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/compression/metadata/${encodeURIComponent(selectedFile.name)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!metadataResponse.ok) {
        throw new Error('Failed to fetch compression metadata');
      }

      const metadata = await metadataResponse.json();

      // Call the callback with compression data
      onCompressionComplete({
        originalSize: metadata.data.originalSize,
        compressedSize: metadata.data.compressedSize,
        compressionRatio: metadata.data.compressionRatio,
        algorithm: metadata.data.algorithm,
        timestamp: new Date(metadata.data.timestamp).getTime(),
        downloadUrl: compressedUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during compression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 4,
          borderRadius: 2,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'background.paper',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : theme.palette.divider}`,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" color="text.primary">
              Supported File Types:
            </Typography>
            <Chip 
              label={`Max Size: ${MAX_FILE_SIZE}MB`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ 
                ml: 2,
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '& .MuiChip-label': {
                  fontWeight: 'bold'
                }
              }}
            />
          </Box>
          <Grid container spacing={1}>
            {supportedFileTypes.map((fileType) => (
              <Grid item key={fileType.type}>
                <Tooltip 
                  title={fileType.extensions.join(', ')}
                  arrow
                  placement="top"
                >
                  <Chip
                    icon={fileType.icon}
                    label={fileType.type}
                    size="small"
                    sx={{
                      mr: 1,
                      mb: 1,
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(0, 0, 0, 0.08)',
                      '& .MuiChip-icon': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                disabled={loading}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  color: theme.palette.mode === 'dark' ? 'white' : 'initial',
                }}
              >
                Select File
              </Button>
            </label>
            
            {selectedFile && (
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.main,
                }}
              >
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </Typography>
            )}
          </Box>

          {selectedFile && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Recommended Algorithm:
                </Typography>
                <Chip 
                  label={selectedAlgorithm.toUpperCase()} 
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 'bold',
                  }}
                />
              </Box>

              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={loading}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  alignSelf: 'flex-start',
                  color: theme.palette.mode === 'dark' ? 'white' : 'initial',
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Compressing...
                  </>
                ) : (
                  'Compress File'
                )}
              </Button>
            </Box>
          )}

          {error && (
            <Typography
              color="error"
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                background: theme.palette.mode === 'dark'
                  ? 'rgba(211, 47, 47, 0.1)'
                  : 'rgba(211, 47, 47, 0.05)',
              }}
            >
              {error}
            </Typography>
          )}

          {downloadUrl && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                background: theme.palette.mode === 'dark'
                  ? 'rgba(76, 175, 80, 0.1)'
                  : 'rgba(76, 175, 80, 0.05)',
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Download Compressed File:
              </Typography>
              <Link
                href={`${import.meta.env.VITE_API_URL}${downloadUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<DownloadIcon />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    color: theme.palette.mode === 'dark' ? 'white' : 'initial',
                  }}
                >
                  Download
                </Button>
              </Link>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default FileUpload;
