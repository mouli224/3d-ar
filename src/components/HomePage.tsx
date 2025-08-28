import React, { useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Fade,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Upload3DIcon from '@mui/icons-material/ViewInAr';
import { initializeSampleModels } from '../services/sampleModelsService';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize sample models on app start
    initializeSampleModels();
  }, []);

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
      <Container maxWidth="md">
        <Fade in={true} timeout={1200}>
          <Box textAlign="center">
            {/* Hero Section */}
            <Box mb={8}>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 300,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  color: '#2d3748',
                  mb: 2,
                  letterSpacing: '-0.02em'
                }}
              >
                AR 3D Viewer
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#718096',
                  fontWeight: 400,
                  maxWidth: '600px',
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Experience augmented reality with interactive 3D models.
                Upload your own models or explore our sample collection.
              </Typography>
            </Box>

            {/* Action Cards */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, justifyContent: 'center', mb: 8 }}>
              <Box
                onClick={() => navigate('/ar')}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  minWidth: 280,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    background: 'rgba(255, 255, 255, 0.95)',
                  }
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                  }}
                >
                  <CameraAltIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#2d3748',
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  Launch AR
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#718096',
                    lineHeight: 1.5
                  }}
                >
                  Start the AR experience with your device camera
                </Typography>
              </Box>

              <Box
                onClick={() => navigate('/upload')}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  minWidth: 280,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    background: 'rgba(255, 255, 255, 0.95)',
                  }
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                  }}
                >
                  <Upload3DIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#2d3748',
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  Upload Model
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#718096',
                    lineHeight: 1.5
                  }}
                >
                  Add your own 3D models (.glb/.gltf files)
                </Typography>
              </Box>
            </Box>

            {/* Features */}
            <Box>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, justifyContent: 'center' }}>
                {[
                  { title: 'Mobile First', desc: 'Optimized for mobile browsers' },
                  { title: 'No Backend', desc: 'Everything runs in your browser' },
                  { title: 'Private', desc: 'Your data stays on your device' }
                ].map((feature, index) => (
                  <Box key={index} textAlign="center">
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#2d3748',
                        fontWeight: 600,
                        mb: 0.5
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#718096'
                      }}
                    >
                      {feature.desc}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default HomePage;