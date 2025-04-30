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
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('');  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

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
    if (!selectedFile || !selectedAlgorithm) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('algorithm', selectedAlgorithm);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/compress`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Compression failed');
      }

      const result = await response.json();
      
      const compressionRatio = selectedFile.size / result.compressedSize;
      
      if (result.downloadUrl) {
        setDownloadUrl(result.downloadUrl);
      }
      
      onCompressionComplete({
        originalSize: selectedFile.size,
        compressedSize: result.compressedSize,
        compressionRatio: Number(compressionRatio.toFixed(2)),
        algorithm: result.algorithm,
        timestamp: Date.now(),
        downloadUrl: result.downloadUrl,
      });

      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during compression');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            background: 'transparent',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : theme.palette.divider}`,
            borderRadius: 2,
            transition: 'all 0.3s ease',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                  disabled={isUploading}
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
                  disabled={isUploading}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    alignSelf: 'flex-start',
                    color: theme.palette.mode === 'dark' ? 'white' : 'initial',
                  }}
                >
                  {isUploading ? (
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
    </Box>
  );
};

export default FileUpload;
