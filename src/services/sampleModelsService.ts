import { localStorageService } from './localStorageService';

// Sample 3D models that come pre-loaded with the app
const SAMPLE_MODELS = [
  {
    name: 'Simple Cube',
    description: 'A basic colored cube for testing AR functionality',
    url: '/sample-models/cube.glb', // You can add actual model files here
    thumbnail: '/sample-models/cube-thumb.jpg',
  },
  {
    name: 'Sphere',
    description: 'A metallic sphere with reflective material',
    url: '/sample-models/sphere.glb',
    thumbnail: '/sample-models/sphere-thumb.jpg',
  }
];

export const initializeSampleModels = async () => {
  // Check if sample models are already loaded
  const existingModels = localStorageService.getModels();
  if (existingModels.length > 0) {
    return; // Sample models already exist
  }

  // Create sample models in localStorage
  for (const sample of SAMPLE_MODELS) {
    try {
      // For now, we'll create placeholder entries
      // In a real app, you'd load actual .glb files
      localStorageService.saveModel({
        name: sample.name,
        description: sample.description,
        model_file: sample.url, // Direct URL to public asset
        file_size: 1024 * 50, // Placeholder size
      });
    } catch (error) {
      console.error('Failed to initialize sample model:', sample.name, error);
    }
  }
};

// Create a simple cube geometry as base64 GLB (minimal example)
export const createSimpleCube = (): string => {
  // This is a placeholder - in a real app you'd have actual GLB files
  // For demonstration, we'll return a data URL
  return 'data:model/gltf-binary;base64,base64-encoded-glb-data-here';
};

export const sampleModelsService = {
  initializeSampleModels,
  createSimpleCube,
};
