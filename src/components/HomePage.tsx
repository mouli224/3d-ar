import React, { useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Card, 
  CardContent,
  Fade,
  Zoom
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Upload3DIcon from '@mui/icons-material/ViewInAr';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { initializeSampleModels } from '../services/sampleModelsService';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize sample models on app start
    initializeSampleModels();
  }, []);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Fade in={true} timeout={1000}>
        <Box textAlign="center" mb={4} className="slide-in-down">
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 900,
              fontFamily: 'Orbitron, monospace',
              background: 'linear-gradient(45deg, #00e5ff, #ff6ec7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(0, 229, 255, 0.5)',
              mb: 2
            }}
          >
            AR 3D VIEWER
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <AutoAwesomeIcon 
              sx={{ 
                fontSize: 40, 
                color: '#00e5ff',
                animation: 'spin 3s linear infinite',
                filter: 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.8))'
              }} 
            />
          </Box>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            paragraph
            sx={{ 
              fontWeight: 300,
              lineHeight: 1.6,
              color: '#b3e5fc'
            }}
          >
            Experience the future of Augmented Reality. Upload, visualize, and interact with 3D models in your real environment.
          </Typography>
        </Box>
      </Fade>

      <Zoom in={true} timeout={1200}>
        <Card 
          className="ar-card holographic scale-in" 
          sx={{ 
            mb: 4, 
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ 
                fontFamily: 'Orbitron, monospace',
                color: '#00e5ff',
                textAlign: 'center',
                mb: 3
              }}
            >
              ✨ FEATURES
            </Typography>
            
            <Box sx={{ textAlign: 'left' }}>
              {[
                '🚀 Upload 3D models (GLB, GLTF, OBJ formats)',
                '📱 Mobile-optimized AR experience',
                '🎮 Intuitive touch controls',
                '📸 Capture & save AR moments',
                '⚡ Real-time rendering',
                '🌟 Immersive AR visualization'
              ].map((feature, index) => (
                <Fade in={true} timeout={1500 + index * 200} key={index}>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ 
                      fontSize: '1.1rem',
                      lineHeight: 1.8,
                      color: '#ffffff',
                      textShadow: '0 0 5px rgba(0, 229, 255, 0.3)'
                    }}
                  >
                    {feature}
                  </Typography>
                </Fade>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Zoom>

      <Box display="flex" flexDirection="column" gap={3} className="slide-in-up">
        <Zoom in={true} timeout={1800}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Upload3DIcon sx={{ fontSize: 28 }} />}
            onClick={() => navigate('/upload')}
            className="pulse-button"
            sx={{ 
              py: 2.5,
              fontSize: '1.2rem',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #00e5ff, #64ffda)',
              '&:hover': {
                background: 'linear-gradient(45deg, #64ffda, #00e5ff)',
                transform: 'translateY(-3px) scale(1.02)',
                boxShadow: '0 12px 30px rgba(0, 229, 255, 0.4)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            UPLOAD 3D MODEL
          </Button>
        </Zoom>
        
        <Zoom in={true} timeout={2000}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<CameraAltIcon sx={{ fontSize: 28 }} />}
            onClick={() => navigate('/ar')}
            className="pulse-button"
            sx={{ 
              py: 2.5,
              fontSize: '1.2rem',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #ff6ec7, #ffb3ff)',
              '&:hover': {
                background: 'linear-gradient(45deg, #ffb3ff, #ff6ec7)',
                transform: 'translateY(-3px) scale(1.02)',
                boxShadow: '0 12px 30px rgba(255, 110, 199, 0.4)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            ENTER AR MODE
          </Button>
        </Zoom>
      </Box>

      <Fade in={true} timeout={2500}>
        <Box 
          mt={4} 
          textAlign="center"
          sx={{
            p: 2,
            borderRadius: 3,
            background: 'rgba(0, 229, 255, 0.1)',
            border: '1px solid rgba(0, 229, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64ffda',
              fontWeight: 500,
              textShadow: '0 0 10px rgba(100, 255, 218, 0.5)'
            }}
          >
            💡 Best experienced on mobile devices with camera support
          </Typography>
        </Box>
      </Fade>
    </Container>
  );
};

export default HomePage;
