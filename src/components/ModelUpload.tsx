import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  LinearProgress,
  Alert,
  TextField,
  Fade,
  Zoom,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { modelService } from '../services/api';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const ModelUpload: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const acceptedFormats = ['glb', 'gltf', 'obj', 'fbx'];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension && acceptedFormats.includes(fileExtension)) {
        setFile(selectedFile);
        if (!name) {
          setName(selectedFile.name.replace(/\.[^/.]+$/, ''));
        }
        setMessage(null);
      } else {
        setMessage({
          type: 'error',
          text: `Please select a valid 3D model file (${acceptedFormats.join(', ').toUpperCase()})`
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !name) {
      setMessage({ type: 'error', text: 'Please provide a file and name' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    const formData = new FormData();
    formData.append('model_file', file);
    formData.append('name', name);
    if (description) {
      formData.append('description', description);
    }

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 100);

      const response = await modelService.uploadModel(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      setMessage({ type: 'success', text: 'Model uploaded successfully!' });
      setFile(null);
      setName('');
      setDescription('');
      setUploadProgress(0);
      
      // Store the uploaded model info for AR view
      localStorage.setItem('lastUploadedModel', JSON.stringify(response));
      
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload model. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Fade in={true} timeout={800}>
          <Box mb={4} textAlign="center">
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              sx={{ 
                mb: 3,
                color: '#718096',
                '&:hover': {
                  background: 'rgba(113, 128, 150, 0.1)',
                  transform: 'translateX(-5px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Back to Home
            </Button>
            
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 300,
                fontSize: { xs: '2rem', md: '2.5rem' },
                color: '#2d3748',
                mb: 2,
                letterSpacing: '-0.02em'
              }}
            >
              Upload 3D Model
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#718096',
                fontWeight: 400,
                maxWidth: '500px',
                mx: 'auto',
                lineHeight: 1.6,
                mb: 4
              }}
            >
              Add your 3D models to experience them in augmented reality
            </Typography>
          </Box>
        </Fade>

        <Zoom in={true} timeout={1000}>
          <Box
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box mb={3}>
              <input
                accept=".glb,.gltf,.obj,.fbx"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon sx={{ fontSize: 28 }} />}
                  fullWidth
                  sx={{ 
                    py: 3, 
                    mb: 2,
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    border: '2px dashed #cbd5e0',
                    borderRadius: 3,
                    color: '#718096',
                    background: 'rgba(113, 128, 150, 0.05)',
                    '&:hover': {
                      background: 'rgba(113, 128, 150, 0.1)',
                      borderColor: '#a0aec0',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Choose 3D Model File
                </Button>
              </label>
              
              {file && (
                <Fade in={true}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      background: 'rgba(102, 126, 234, 0.1)',
                      borderRadius: 2,
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <CheckCircleIcon sx={{ color: '#667eea', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#667eea', fontWeight: 500 }}>
                      Selected: {file.name}
                    </Typography>
                  </Box>
                </Fade>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              {acceptedFormats.map((format) => (
                <Chip 
                  key={format}
                  label={format.toUpperCase()}
                  size="small"
                  sx={{
                    background: 'rgba(113, 128, 150, 0.1)',
                    color: '#718096',
                    border: '1px solid rgba(113, 128, 150, 0.2)',
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
              ))}
            </Box>

            <TextField
              fullWidth
              label="Model Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(113, 128, 150, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(113, 128, 150, 0.6)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#667eea',
                },
              }}
            />

            <TextField
              fullWidth
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(113, 128, 150, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(113, 128, 150, 0.6)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#667eea',
                },
              }}
            />

            {uploading && (
              <Fade in={true}>
                <Box mt={2}>
                  <Typography 
                    variant="body2" 
                    gutterBottom
                    sx={{ 
                      color: '#667eea',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}
                  >
                    Uploading... {uploadProgress}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      background: 'rgba(102, 126, 234, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </Fade>
            )}

            {message && (
              <Fade in={true}>
                <Box mt={2}>
                  <Alert 
                    severity={message.type}
                    icon={message.type === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
                    sx={{
                      background: message.type === 'success' 
                        ? 'rgba(102, 126, 234, 0.1)' 
                        : 'rgba(240, 147, 251, 0.1)',
                      border: `1px solid ${message.type === 'success' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(240, 147, 251, 0.3)'}`,
                      color: '#2d3748',
                      '& .MuiAlert-icon': {
                        color: message.type === 'success' ? '#667eea' : '#f093fb',
                      },
                    }}
                  >
                    {message.text}
                  </Alert>
                </Box>
              </Fade>
            )}

            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!file || !name || uploading}
              fullWidth
              sx={{ 
                mt: 3,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 3,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                },
                '&:disabled': {
                  background: 'rgba(113, 128, 150, 0.3)',
                  color: 'rgba(255, 255, 255, 0.6)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Model'}
            </Button>
          </Box>
        </Zoom>

        <Fade in={true} timeout={1500}>
          <Box 
            mt={3}
            sx={{
              p: 2,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center'
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#718096',
                fontWeight: 500
              }}
            >
              📁 Supported: GLB, GLTF, OBJ, FBX • 📏 Max size: 10MB
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default ModelUpload;
