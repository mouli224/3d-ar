import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Fab,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import CloseIcon from '@mui/icons-material/Close';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { modelService, Model3D } from '../services/api';

const ARView: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const animationIdRef = useRef<number | null>(null);

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<Model3D[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [isARActive, setIsARActive] = useState(false);

  // Camera setup
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current?.play();
        });
        
        // Ensure video plays
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Video play failed:', error);
          });
        }
      }
      setCameraStream(stream);
      setError(null);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  // Three.js scene setup
  const initThreeJS = () => {
    if (!canvasRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 3);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add a test cube if no model is loaded
    if (!modelRef.current) {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x00ff88,
        transparent: true,
        opacity: 0.8
      });
      const testCube = new THREE.Mesh(geometry, material);
      testCube.position.set(0, 0, -2);
      scene.add(testCube);
      modelRef.current = testCube;
    }

    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Controls setup
    setupControls();
  };

  // Touch and mouse controls
  const setupControls = () => {
    if (!canvasRef.current || !modelRef.current) return;

    let isMouseDown = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      isMouseDown = true;
      const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
      const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
      previousMousePosition = { x: clientX, y: clientY };
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isMouseDown || !modelRef.current) return;

      const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
      const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;

      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;

      modelRef.current.rotation.y += deltaX * 0.01;
      modelRef.current.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: clientX, y: clientY };
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const canvas = canvasRef.current;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleMouseDown);
    canvas.addEventListener('touchmove', handleMouseMove);
    canvas.addEventListener('touchend', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleMouseDown);
      canvas.removeEventListener('touchmove', handleMouseMove);
      canvas.removeEventListener('touchend', handleMouseUp);
    };
  };

  // Load 3D model
  const loadModel = async (model: Model3D) => {
    if (!sceneRef.current) return;

    setIsLoading(true);
    try {
      const loader = new GLTFLoader();
      // For client-side storage, model.model_file is already a blob URL
      const modelUrl = model.model_file;
      
      loader.load(
        modelUrl,
        (gltf) => {
          // Remove previous model
          if (modelRef.current && sceneRef.current) {
            sceneRef.current.remove(modelRef.current);
          }

          const loadedModel = gltf.scene;
          loadedModel.scale.setScalar(0.5);
          loadedModel.position.set(0, 0, 0);
          
          // Enable shadows
          loadedModel.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          sceneRef.current?.add(loadedModel);
          modelRef.current = loadedModel;
          setSelectedModel(model);
          setIsLoading(false);
          setupControls();
        },
        (progress) => {
          console.log('Loading progress:', progress);
        },
        (error) => {
          console.error('Model loading error:', error);
          setError('Failed to load 3D model');
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.error('Model loading error:', err);
      setError('Failed to load 3D model');
      setIsLoading(false);
    }
  };

  // Fetch available models
  const fetchModels = async () => {
    try {
      const models = await modelService.getModels();
      setModels(models);
    } catch (err) {
      console.error('Failed to fetch models:', err);
      setError('Failed to fetch models');
    }
  };

  // Animation loop
  const animate = () => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    animationIdRef.current = requestAnimationFrame(animate);
  };

  // Screenshot functionality
  const captureScreenshot = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Create temporary canvas for combining video and 3D
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    
    if (ctx) {
      // Draw video background
      ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
      
      // Draw 3D canvas on top
      ctx.drawImage(canvas, 0, 0);
      
      // Download screenshot
      const link = document.createElement('a');
      link.download = `ar-screenshot-${Date.now()}.png`;
      link.href = tempCanvas.toDataURL();
      link.click();
    }
  };

  // Control functions
  const zoomIn = () => {
    if (modelRef.current) {
      modelRef.current.scale.multiplyScalar(1.1);
    }
  };

  const zoomOut = () => {
    if (modelRef.current) {
      modelRef.current.scale.multiplyScalar(0.9);
    }
  };

  const resetRotation = () => {
    if (modelRef.current) {
      modelRef.current.rotation.set(0, 0, 0);
    }
  };

  // Initialize on mount
  useEffect(() => {
    fetchModels();
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [cameraStream]);

  // Start AR
  const startAR = async () => {
    await initCamera();
    initThreeJS();
    animate();
    setIsARActive(true);
    
    // Load selected model
    if (selectedModel) {
      loadModel(selectedModel);
    }
  };

  // Stop AR
  const stopAR = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    setIsARActive(false);
  };

  if (!isARActive) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ 
            mb: 3,
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
            background: 'linear-gradient(45deg, #00e5ff, #ff6ec7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            textShadow: '0 0 30px rgba(0, 229, 255, 0.5)'
          }}
        >
          AR 3D VIEWER
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          paragraph
          sx={{ 
            color: '#b3e5fc',
            fontSize: '1.1rem',
            mb: 4
          }}
        >
          Enter AR mode to view and interact with 3D models in your environment
        </Typography>

        {models.length > 0 && (
          <Box 
            mb={3}
            className="ar-card"
            sx={{ 
              p: 3,
              borderRadius: 3,
              background: 'rgba(15, 15, 25, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 229, 255, 0.2)'
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setShowModelSelector(true)}
              sx={{ 
                mb: 2,
                borderColor: '#00e5ff',
                color: '#00e5ff',
                fontSize: '1.1rem',
                py: 1.5,
                '&:hover': {
                  borderColor: '#64ffda',
                  background: 'rgba(0, 229, 255, 0.1)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              🎯 Select 3D Model ({models.length} available)
            </Button>
            {selectedModel && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64ffda',
                  fontWeight: 600,
                  textShadow: '0 0 10px rgba(100, 255, 218, 0.5)'
                }}
              >
                ✅ Selected: {selectedModel.name}
              </Typography>
            )}
          </Box>
        )}

        <Button
          variant="contained"
          size="large"
          startIcon={<ViewInArIcon sx={{ fontSize: 32 }} />}
          onClick={startAR}
          disabled={!selectedModel}
          className="pulse-button"
          sx={{ 
            py: 3,
            px: 4,
            fontSize: '1.3rem',
            fontWeight: 700,
            background: 'linear-gradient(45deg, #ff6ec7, #ffb3ff)',
            '&:hover': {
              background: 'linear-gradient(45deg, #ffb3ff, #ff6ec7)',
              transform: 'translateY(-3px) scale(1.05)',
              boxShadow: '0 15px 40px rgba(255, 110, 199, 0.4)',
            },
            '&:disabled': {
              background: 'rgba(100, 100, 100, 0.3)',
              color: 'rgba(255, 255, 255, 0.5)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: 6
          }}
        >
          🚀 START AR EXPERIENCE
        </Button>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2,
              background: 'rgba(255, 110, 199, 0.1)',
              border: '1px solid rgba(255, 110, 199, 0.3)',
              color: '#ffffff',
              '& .MuiAlert-icon': {
                color: '#ff6ec7',
              },
            }}
          >
            {error}
          </Alert>
        )}

        {/* Model Selector Dialog */}
        <Dialog 
          open={showModelSelector} 
          onClose={() => setShowModelSelector(false)}
          PaperProps={{
            sx: {
              background: 'rgba(15, 15, 25, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              borderRadius: 4,
              minWidth: 300
            }
          }}
        >
          <DialogTitle
            sx={{ 
              textAlign: 'center',
              color: '#00e5ff',
              fontFamily: 'Orbitron, monospace',
              fontWeight: 700,
              fontSize: '1.4rem'
            }}
          >
            🎮 SELECT 3D MODEL
            <IconButton
              aria-label="close"
              onClick={() => setShowModelSelector(false)}
              sx={{ 
                position: 'absolute', 
                right: 8, 
                top: 8,
                color: '#ff6ec7',
                '&:hover': {
                  background: 'rgba(255, 110, 199, 0.2)',
                  transform: 'rotate(90deg)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {models.map((model) => (
              <Button
                key={model.id}
                variant={selectedModel?.id === model.id ? "contained" : "outlined"}
                onClick={() => {
                  setSelectedModel(model);
                  setShowModelSelector(false);
                }}
                fullWidth
                sx={{ 
                  mb: 2,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderColor: selectedModel?.id === model.id ? '#64ffda' : '#00e5ff',
                  color: selectedModel?.id === model.id ? '#000' : '#00e5ff',
                  background: selectedModel?.id === model.id 
                    ? 'linear-gradient(45deg, #00e5ff, #64ffda)' 
                    : 'transparent',
                  '&:hover': {
                    background: selectedModel?.id === model.id 
                      ? 'linear-gradient(45deg, #64ffda, #00e5ff)' 
                      : 'rgba(0, 229, 255, 0.1)',
                    transform: 'translateY(-2px)',
                    borderColor: '#64ffda',
                  },
                  transition: 'all 0.3s ease',
                  borderRadius: 3
                }}
              >
                {selectedModel?.id === model.id ? '✅ ' : '📦 '}{model.name}
              </Button>
            ))}
          </DialogContent>
        </Dialog>
      </Container>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Camera Video */}
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1
        }}
        playsInline
        muted
        autoPlay
      />

      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'auto'
        }}
      />

      {/* Modern AR Controls */}
      <Box 
        className="ar-controls"
        sx={{ 
          position: 'absolute', 
          top: 20, 
          left: 20, 
          zIndex: 3,
          borderRadius: 5,
          p: 2,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 229, 255, 0.3)'
        }}
      >
        <Button
          variant="contained"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={stopAR}
          sx={{
            background: 'linear-gradient(45deg, #ff6ec7, #ffb3ff)',
            color: '#000',
            fontWeight: 700,
            '&:hover': {
              background: 'linear-gradient(45deg, #ffb3ff, #ff6ec7)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
            borderRadius: 3
          }}
        >
          EXIT AR
        </Button>
      </Box>

      {/* Screenshot Button */}
      <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 3 }}>
        <Fab
          color="primary"
          size="medium"
          onClick={captureScreenshot}
          sx={{
            background: 'linear-gradient(45deg, #00e5ff, #64ffda)',
            '&:hover': {
              background: 'linear-gradient(45deg, #64ffda, #00e5ff)',
              transform: 'scale(1.1) rotate(5deg)',
              boxShadow: '0 8px 25px rgba(0, 229, 255, 0.4)',
            },
            transition: 'all 0.3s ease',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <CameraAltIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Box>

      {/* Model Controls */}
      <Box 
        className="ar-controls"
        sx={{ 
          position: 'absolute', 
          bottom: 30, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 3, 
          display: 'flex', 
          gap: 2,
          p: 2,
          borderRadius: 5,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 229, 255, 0.3)'
        }}
      >
        <Fab 
          size="medium" 
          onClick={zoomOut}
          sx={{
            background: 'linear-gradient(45deg, #ff6ec7, #ffb3ff)',
            '&:hover': {
              background: 'linear-gradient(45deg, #ffb3ff, #ff6ec7)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          <ZoomOutIcon />
        </Fab>
        <Fab 
          size="medium" 
          onClick={resetRotation}
          sx={{
            background: 'linear-gradient(45deg, #00e5ff, #64ffda)',
            '&:hover': {
              background: 'linear-gradient(45deg, #64ffda, #00e5ff)',
              transform: 'scale(1.1) rotate(180deg)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          <RotateLeftIcon />
        </Fab>
        <Fab 
          size="medium" 
          onClick={zoomIn}
          sx={{
            background: 'linear-gradient(45deg, #ff6ec7, #ffb3ff)',
            '&:hover': {
              background: 'linear-gradient(45deg, #ffb3ff, #ff6ec7)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          <ZoomInIcon />
        </Fab>
      </Box>

      {/* AR Status Indicator */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 90, 
          left: 20, 
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.5,
          borderRadius: 3,
          background: 'rgba(0, 229, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 229, 255, 0.5)'
        }}
      >
        <Box 
          sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            background: '#00ff00',
            boxShadow: '0 0 10px #00ff00',
            animation: 'pulse 2s infinite'
          }} 
        />
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#00e5ff', 
            fontWeight: 700,
            fontSize: '0.8rem',
            textShadow: '0 0 5px rgba(0, 229, 255, 0.8)'
          }}
        >
          AR ACTIVE
        </Typography>
      </Box>

      {/* Loading Indicator */}
      {isLoading && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            zIndex: 4,
            textAlign: 'center',
            p: 3,
            borderRadius: 4,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 229, 255, 0.3)'
          }}
        >
          <CircularProgress 
            sx={{ 
              color: '#00e5ff',
              mb: 2,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }} 
          />
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#00e5ff', 
              fontWeight: 600,
              textShadow: '0 0 10px rgba(0, 229, 255, 0.8)'
            }}
          >
            🚀 Loading 3D Model...
          </Typography>
        </Box>
      )}

      {/* Error Alert */}
      {error && (
        <Box sx={{ position: 'absolute', bottom: 140, left: 16, right: 16, zIndex: 3 }}>
          <Alert 
            severity="error"
            sx={{
              background: 'rgba(255, 110, 199, 0.2)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 110, 199, 0.5)',
              color: '#ffffff',
              borderRadius: 3,
              '& .MuiAlert-icon': {
                color: '#ff6ec7',
              },
            }}
          >
            {error}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default ARView;
