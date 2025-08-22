import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
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
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Fade in={true} timeout={800}>
        <Box mb={3} className="slide-in-down">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ 
              mb: 2,
              color: '#00e5ff',
              '&:hover': {
                background: 'rgba(0, 229, 255, 0.1)',
                transform: 'translateX(-5px)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            Back to Home
          </Button>
          
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontFamily: 'Orbitron, monospace',
              color: '#00e5ff',
              textShadow: '0 0 20px rgba(0, 229, 255, 0.5)',
              fontWeight: 700
            }}
          >
            UPLOAD 3D MODEL
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            paragraph
            sx={{ 
              color: '#b3e5fc',
              fontSize: '1.1rem'
            }}
          >
            Upload your 3D models to experience them in Augmented Reality
          </Typography>
        </Box>
      </Fade>

      <Zoom in={true} timeout={1000}>
        <Card className="ar-card scale-in" sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardContent sx={{ p: 3 }}>
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
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    border: '2px dashed #00e5ff',
                    borderRadius: 4,
                    background: 'rgba(0, 229, 255, 0.05)',
                    '&:hover': {
                      background: 'rgba(0, 229, 255, 0.1)',
                      borderColor: '#64ffda',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 229, 255, 0.2)',
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
                      background: 'rgba(100, 255, 218, 0.1)',
                      borderRadius: 2,
                      border: '1px solid rgba(100, 255, 218, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <CheckCircleIcon sx={{ color: '#64ffda', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#64ffda' }}>
                      Selected: {file.name}
                    </Typography>
                  </Box>
                </Fade>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {acceptedFormats.map((format) => (
                <Chip 
                  key={format}
                  label={format.toUpperCase()}
                  size="small"
                  sx={{
                    background: 'linear-gradient(45deg, rgba(0, 229, 255, 0.2), rgba(255, 110, 199, 0.2))',
                    color: '#ffffff',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    fontWeight: 600
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
                    borderColor: 'rgba(0, 229, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 229, 255, 0.6)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00e5ff',
                    boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#00e5ff',
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
                    borderColor: 'rgba(0, 229, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 229, 255, 0.6)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00e5ff',
                    boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#00e5ff',
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
                      color: '#00e5ff',
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
                      background: 'rgba(0, 229, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(45deg, #00e5ff, #64ffda)',
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
                        ? 'rgba(100, 255, 218, 0.1)' 
                        : 'rgba(255, 110, 199, 0.1)',
                      border: `1px solid ${message.type === 'success' ? 'rgba(100, 255, 218, 0.3)' : 'rgba(255, 110, 199, 0.3)'}`,
                      color: '#ffffff',
                      '& .MuiAlert-icon': {
                        color: message.type === 'success' ? '#64ffda' : '#ff6ec7',
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
                background: 'linear-gradient(45deg, #00e5ff, #64ffda)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #64ffda, #00e5ff)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 229, 255, 0.3)',
                },
                '&:disabled': {
                  background: 'rgba(100, 100, 100, 0.3)',
                  color: 'rgba(255, 255, 255, 0.5)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              {uploading ? 'UPLOADING...' : 'UPLOAD MODEL'}
            </Button>
          </CardContent>
        </Card>
      </Zoom>

      <Fade in={true} timeout={1500}>
        <Box 
          mt={3}
          sx={{
            p: 2,
            borderRadius: 3,
            background: 'rgba(255, 110, 199, 0.1)',
            border: '1px solid rgba(255, 110, 199, 0.2)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#ffb3ff',
              fontWeight: 500
            }}
          >
            📁 Supported: GLB, GLTF, OBJ, FBX • 📏 Max size: 10MB
          </Typography>
        </Box>
      </Fade>
    </Container>
  );
};

export default ModelUpload;
