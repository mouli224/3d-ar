import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  const [currentModel, setCurrentModel] = useState<THREE.Object3D | null>(null);

  // Camera setup
  const initCamera = async () => {
    try {
      console.log('🎥 Starting camera initialization...');
      console.log('📍 Location:', window.location.href);
      console.log('🔒 Protocol:', window.location.protocol);
      console.log('🌐 User Agent:', navigator.userAgent);
      
      // Check if we're in a secure context (required for camera access)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ Camera API not available');
        throw new Error('Camera API not available. Please use a modern browser with HTTPS.');
      }

      // Check if we're in a secure context  
      if (!window.isSecureContext) {
        console.error('❌ Not in secure context');
        throw new Error('Camera access requires HTTPS. Please ensure your site is served over HTTPS.');
      }
      
      console.log('✅ Security checks passed, requesting camera access...');
      
      // Try different camera configurations (mobile-friendly)
      const constraints = [
        // Mobile-optimized: Environment camera
        {
          video: { 
            facingMode: { exact: 'environment' },
            width: { ideal: 1280, min: 640, max: 1920 },
            height: { ideal: 720, min: 480, max: 1080 }
          }
        },
        // Fallback: Any environment camera
        {
          video: { 
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        },
        // Last resort: Any camera
        { video: true }
      ];

      let stream = null;
      for (const constraint of constraints) {
        try {
          console.log('🔄 Trying constraint:', constraint);
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          console.log('✅ Camera stream obtained with constraint:', constraint);
          break;
        } catch (err) {
          console.warn('Failed with constraint:', constraint, err);
        }
      }

      if (!stream) {
        throw new Error('Could not access camera with any configuration. Please check permissions and ensure camera is not in use by another application.');
      }
      
      if (videoRef.current) {
        console.log('Setting video source...');
        videoRef.current.srcObject = stream;
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        
        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          const video = videoRef.current!;
          
          const onLoadedMetadata = () => {
            console.log('Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            resolve(void 0);
          };
          
          const onError = (err: any) => {
            console.error('Video loading error:', err);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(err);
          };
          
          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);
        });
        
        // Play the video
        try {
          console.log('🎬 Attempting to play video...');
          await videoRef.current.play();
          console.log('✅ Video is now playing successfully');
        } catch (playError) {
          console.error('❌ Video play failed:', playError);
          // Try to play again after a short delay (sometimes needed on mobile)
          setTimeout(() => {
            console.log('🔄 Retrying video play...');
            videoRef.current?.play().catch((retryError) => {
              console.error('❌ Video retry failed:', retryError);
            });
          }, 500);
        }
      }
      
      setCameraStream(stream);
      setError(null);
      console.log('Camera initialization complete');
    } catch (err) {
      console.error('Camera access error:', err);
      
      let errorMessage = 'Unable to access camera. ';
      if (err instanceof Error) {
        if (err.message.includes('HTTPS')) {
          errorMessage = 'Camera access requires HTTPS. Please ensure your site is secure.';
        } else if (err.message.includes('Permission')) {
          errorMessage = 'Camera permission denied. Please allow camera access and refresh the page.';
        } else if (err.message.includes('not found') || err.message.includes('NotFoundError')) {
          errorMessage = 'No camera found. Please ensure a camera is connected to your device.';
        } else if (err.message.includes('in use') || err.message.includes('NotReadableError')) {
          errorMessage = 'Camera is already in use by another application. Please close other apps using the camera.';
        } else {
          errorMessage = `Camera error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
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

  // Create sample 3D models for immediate testing
  const createSampleModel = (type: 'cube' | 'sphere' | 'pyramid' = 'cube') => {
    if (!sceneRef.current) return;

    // Remove previous model
    if (currentModel) {
      sceneRef.current.remove(currentModel);
    }

    let geometry: THREE.BufferGeometry;
    let color: number;

    switch (type) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(1, 32, 32);
        color = 0x00e5ff; // Cyan
        break;
      case 'pyramid':
        geometry = new THREE.ConeGeometry(1, 2, 8);
        color = 0xff6ec7; // Pink
        break;
      case 'cube':
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
        color = 0x00ff88; // Green
        break;
    }

    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.1,
      metalness: 0.8,
      emissive: color,
      emissiveIntensity: 0.1,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, -2);

    sceneRef.current.add(mesh);
    setCurrentModel(mesh);
    modelRef.current = mesh;

    console.log(`Sample ${type} model created and added to scene`);
    setupControls();
  };

  // Load 3D model
  const loadModel = useCallback(async (model: Model3D) => {
    if (!sceneRef.current) return;

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading model:', model.name);

      // Handle sample models
      if (model.id >= 9999000) {
        const type = model.model_file.replace('sample-', '') as 'cube' | 'sphere' | 'pyramid';
        createSampleModel(type);
        setSelectedModel(model);
        setIsLoading(false);
        return;
      }

      // Handle uploaded models
      const loader = new GLTFLoader();
      let modelUrl = model.model_file;

      // If the model file is base64 data, convert to blob URL
      if (modelUrl.startsWith('data:')) {
        try {
          const response = await fetch(modelUrl);
          const blob = await response.blob();
          modelUrl = URL.createObjectURL(blob);
        } catch (e) {
          console.error('Failed to convert base64 to blob:', e);
          throw new Error('Invalid model file format');
        }
      }

      console.log('Loading model from URL:', modelUrl.substring(0, 50) + '...');

      loader.load(
        modelUrl,
        (gltf) => {
          // Remove previous model
          if (currentModel && sceneRef.current) {
            sceneRef.current.remove(currentModel);
          }

          const loadedModel = gltf.scene;
          
          // Scale the model appropriately
          const box = new THREE.Box3().setFromObject(loadedModel);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = maxDim > 0 ? 2 / maxDim : 1;
          loadedModel.scale.setScalar(scale);
          
          // Center the model
          loadedModel.position.sub(center.multiplyScalar(scale));
          loadedModel.position.z = -2; // Position in front of camera

          // Enable shadows
          loadedModel.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          sceneRef.current?.add(loadedModel);
          setCurrentModel(loadedModel);
          modelRef.current = loadedModel;
          setSelectedModel(model);
          setupControls();

          console.log('Model loaded successfully:', model.name);

          // Clean up blob URL if we created one
          if (modelUrl.startsWith('blob:') && modelUrl !== model.model_file) {
            URL.revokeObjectURL(modelUrl);
          }
        },
        (progress) => {
          console.log('Loading progress:', progress);
        },
        (error) => {
          console.error('Model loading error:', error);
          // Create fallback cube on error
          createSampleModel('cube');
          setError(`Failed to load ${model.name}. Showing test cube instead.`);
        }
      );
    } catch (err) {
      console.error('Model loading error:', err);
      createSampleModel('cube');
      setError(`Error loading model: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch available models
  const fetchModels = async () => {
    try {
      console.log('📦 Fetching models...');
      const userModels = await modelService.getModels();
      console.log('👤 User models loaded:', userModels.length);
      
      // Add sample models
      const sampleModels: Model3D[] = [
        {
          id: 9999001,
          name: 'Sample Cube',
          description: 'A test cube for AR demonstration',
          model_file: 'sample-cube',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          file_size: 1024,
        },
        {
          id: 9999002,
          name: 'Sample Sphere',
          description: 'A test sphere for AR demonstration',
          model_file: 'sample-sphere',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          file_size: 1024,
        },
        {
          id: 9999003,
          name: 'Sample Pyramid',
          description: 'A test pyramid for AR demonstration',
          model_file: 'sample-pyramid',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          file_size: 1024,
        },
      ];
      
      console.log('🎯 Sample models created:', sampleModels.length);
      setModels([...sampleModels, ...userModels]);
      console.log('📊 Total models available:', sampleModels.length + userModels.length);
      
      // Auto-select first model if none selected
      if (!selectedModel && sampleModels.length > 0) {
        console.log('🎯 Auto-selecting first model:', sampleModels[0].name);
        setSelectedModel(sampleModels[0]);
      } else {
        console.log('📊 Current selected model:', selectedModel?.name || 'none');
      }
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
    
    // Don't auto-start camera - wait for user interaction
    // This is required for browser security and works better on production
    console.log('ARView initialized. Waiting for user to start AR...');
    
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ensure video element gets the camera stream when AR becomes active
  useEffect(() => {
    if (isARActive && cameraStream && videoRef.current) {
      console.log('📸 Ensuring video element has camera stream...');
      if (videoRef.current.srcObject !== cameraStream) {
        videoRef.current.srcObject = cameraStream;
        console.log('✅ Video element assigned camera stream');
      }
    }
  }, [isARActive, cameraStream]);

  // Auto-load default model and start animation when models are available
  useEffect(() => {
    if (models.length > 0 && isARActive && !selectedModel) {
      console.log('Auto-loading first available model...');
      loadModel(models[0]);
      animate(); // Start the animation loop
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models, isARActive, selectedModel]); // Only run on mount

  // Load model when selectedModel changes
  useEffect(() => {
    if (selectedModel && isARActive) {
      console.log('Loading selected model:', selectedModel.name);
      loadModel(selectedModel);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel, isARActive]);

  // Start AR
  const startAR = async () => {
    try {
      console.log('🚀 Starting AR experience...');
      setIsLoading(true);
      setError(null);
      
      console.log('📸 Initializing camera...');
      await initCamera();
      
      console.log('🎮 Initializing Three.js...');
      initThreeJS();
      
      console.log('🎬 Starting animation loop...');
      animate();
      
      console.log('✅ Setting AR active...');
      setIsARActive(true);
      
      // Ensure video element gets the camera stream
      if (cameraStream && videoRef.current) {
        console.log('🔗 Ensuring video element has camera stream...');
        videoRef.current.srcObject = cameraStream;
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        try {
          await videoRef.current.play();
          console.log('✅ Video now playing with camera stream');
        } catch (playError) {
          console.error('❌ Video play failed:', playError);
        }
      }
      
      // Load selected model
      if (selectedModel) {
        console.log('📦 Loading selected model:', selectedModel.name);
        loadModel(selectedModel);
      } else {
        console.log('📦 No model selected, will auto-load first available');
      }
      
      console.log('🎉 AR initialization complete!');
    } catch (error) {
      console.error('❌ AR initialization failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to start AR experience');
    } finally {
      setIsLoading(false);
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
          <Box textAlign="center">
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              sx={{ 
                mb: 4,
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
              AR Experience
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#718096',
                fontWeight: 400,
                maxWidth: '500px',
                mx: 'auto',
                lineHeight: 1.6,
                mb: 6
              }}
            >
              Point your camera at your surroundings and interact with 3D models in augmented reality
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
          onClick={() => {
            console.log('🔘 Start AR button clicked!');
            console.log('📊 Current state - selectedModel:', selectedModel, 'models:', models.length);
            startAR();
          }}
          disabled={isLoading}
          className="pulse-button"
          sx={{ 
            py: 3,
            px: 4,
            fontSize: '1.1rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
            },
            '&:disabled': {
              background: 'rgba(100, 100, 100, 0.3)',
              color: 'rgba(255, 255, 255, 0.5)',
            },
            transition: 'all 0.3s ease',
            borderRadius: 3,
            textTransform: 'none'
          }}
        >
          🚀 Start AR Experience
        </Button>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 3,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 3,
              color: '#dc2626',
              '& .MuiAlert-icon': {
                color: '#dc2626',
              },
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
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
            </Box>
          </Container>
        </Box>
    );
  }

  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      backgroundColor: '#000' // Fallback color
    }}>
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
          zIndex: 1,
          display: cameraStream ? 'block' : 'none' // Only show when stream is available
        }}
        playsInline
        muted
        autoPlay
        onLoadedMetadata={() => {
          console.log('Video metadata loaded');
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.error('Video play error:', err);
            });
          }
        }}
        onPlay={() => console.log('Video started playing')}
        onError={(e) => console.error('Video error:', e)}
      />

      {/* Model Selector - Bottom Center */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
          p: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          maxWidth: '90vw',
          minWidth: '300px',
        }}
      >
        <Typography variant="h6" sx={{ color: '#2d3748', mb: 2, fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>
          Select 3D Model
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {models.map((model) => (
            <Button
              key={model.id}
              variant={selectedModel?.id === model.id ? 'contained' : 'outlined'}
              size="small"
              onClick={() => loadModel(model)}
              sx={{
                color: selectedModel?.id === model.id ? 'white' : '#667eea',
                borderColor: '#667eea',
                backgroundColor: selectedModel?.id === model.id ? '#667eea' : 'transparent',
                fontSize: '0.75rem',
                fontWeight: 500,
                borderRadius: 2,
                px: 2,
                py: 0.5,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: selectedModel?.id === model.id ? '#764ba2' : 'rgba(102, 126, 234, 0.1)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {model.name}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            backgroundColor: 'rgba(255, 87, 51, 0.9)',
            color: 'white',
            p: 2,
            borderRadius: 2,
            maxWidth: '80%',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2">{error}</Typography>
          <Button
            variant="contained"
            onClick={() => createSampleModel('cube')}
            sx={{ mt: 1, backgroundColor: '#ff6ec7', fontSize: '0.75rem' }}
            size="small"
          >
            Show Test Cube
          </Button>
        </Box>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#00e5ff',
            p: 3,
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <CircularProgress sx={{ color: '#00e5ff', mb: 1 }} size={30} />
          <Typography variant="body2">Loading 3D Model...</Typography>
        </Box>
      )}

      {/* Loading indicator when no camera stream */}
      {!cameraStream && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            zIndex: 1
          }}
        >
          <Typography color="white">Initializing camera...</Typography>
        </Box>
      )}

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

      {/* Modern AR Controls - Top Left */}
      <Box 
        className="ar-controls"
        sx={{ 
          position: 'absolute', 
          top: 20, 
          left: 20, 
          zIndex: 3,
          borderRadius: 3,
          p: 2,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Button
          variant="contained"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={stopAR}
          sx={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.8rem',
            '&:hover': {
              background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
            borderRadius: 2,
            textTransform: 'none'
          }}
        >
          Exit AR
        </Button>
      </Box>

      {/* Screenshot Button - Top Right */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        right: 20, 
        zIndex: 3,
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        p: 1
      }}>
        <Fab
          color="primary"
          size="medium"
          onClick={captureScreenshot}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.3s ease',
            boxShadow: 'none',
            width: 48,
            height: 48
          }}
        >
          <CameraAltIcon sx={{ fontSize: 24 }} />
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
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          alignItems: 'center'
        }}
      >
        <Fab 
          size="medium" 
          onClick={zoomOut}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.3s ease',
            boxShadow: 'none',
            width: 48,
            height: 48
          }}
        >
          <ZoomOutIcon />
        </Fab>
        <Fab 
          size="medium" 
          onClick={resetRotation}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              transform: 'scale(1.05) rotate(180deg)',
            },
            transition: 'all 0.3s ease',
            boxShadow: 'none',
            width: 48,
            height: 48
          }}
        >
          <RotateLeftIcon />
        </Fab>
        <Fab 
          size="medium" 
          onClick={zoomIn}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.3s ease',
            boxShadow: 'none',
            width: 48,
            height: 48
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
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box 
          sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #4ade80, #22c55e)',
            boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)',
            animation: 'pulse 2s infinite'
          }} 
        />
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#374151', 
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        >
          AR Active
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
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <CircularProgress 
            sx={{ 
              color: '#667eea',
              mb: 2,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }} 
          />
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#374151',
              fontWeight: 500,
            }}
          >
            Loading AR Experience...
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

      {/* Debug Panel - Remove in production */}
      <Box sx={{ 
        position: 'absolute', 
        top: 60, 
        right: 16, 
        zIndex: 5,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        p: 2,
        borderRadius: 2,
        fontSize: '12px',
        maxWidth: 200
      }}>
        <Typography variant="caption" display="block">🔍 Debug Info:</Typography>
        <Typography variant="caption" display="block">
          Camera Stream: {cameraStream ? '✅ Active' : '❌ None'}
        </Typography>
        <Typography variant="caption" display="block">
          Video Element: {videoRef.current?.srcObject ? '✅ Has Source' : '❌ No Source'}
        </Typography>
        <Typography variant="caption" display="block">
          Video Playing: {videoRef.current?.paused === false ? '▶️ Playing' : '⏸️ Paused'}
        </Typography>
        <Typography variant="caption" display="block">
          Video Size: {videoRef.current?.videoWidth || 0} x {videoRef.current?.videoHeight || 0}
        </Typography>
        <Typography variant="caption" display="block">
          Error: {error ? '❌ Yes' : '✅ None'}
        </Typography>
      </Box>
    </Box>
  );
};

export default ARView;
