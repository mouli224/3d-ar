import { localStorageService, Model3D } from './localStorageService';

// Client-side model service using localStorage
export type { Model3D } from './localStorageService';

export const modelService = {
  // Get all models
  getModels: async (): Promise<Model3D[]> => {
    // Simulate async operation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(localStorageService.getModels());
      }, 100);
    });
  },

  // Get single model
  getModel: async (id: number): Promise<Model3D> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const model = localStorageService.getModel(id);
        if (model) {
          resolve(model);
        } else {
          reject(new Error(`Model with id ${id} not found`));
        }
      }, 100);
    });
  },

  // Upload new model
  uploadModel: async (formData: FormData): Promise<Model3D> => {
    return new Promise(async (resolve, reject) => {
      try {
        const file = formData.get('model_file') as File;
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;

        if (!file) {
          reject(new Error('No file provided'));
          return;
        }

        // Validate file type
        const allowedTypes = ['.glb', '.gltf'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
          reject(new Error('Only .glb and .gltf files are supported'));
          return;
        }

        // Save the model metadata first
        const modelData = {
          name: name || file.name,
          description: description || '',
          model_file: '', // Will be updated after file is saved
          file_size: file.size,
        };

        const savedModel = localStorageService.saveModel(modelData);

        // Save the file and get the URL
        const fileUrl = await localStorageService.saveModelFile(savedModel.id, file);
        
        // Update the model with the file URL
        const updatedModel = localStorageService.updateModel(savedModel.id, {
          model_file: fileUrl,
        });

        if (updatedModel) {
          resolve(updatedModel);
        } else {
          reject(new Error('Failed to update model with file URL'));
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  // Delete model
  deleteModel: async (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = localStorageService.deleteModel(id);
        if (success) {
          resolve();
        } else {
          reject(new Error(`Model with id ${id} not found`));
        }
      }, 100);
    });
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; message: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storageInfo = localStorageService.getStorageInfo();
        resolve({
          status: 'healthy',
          message: `Client-side storage: ${storageInfo.modelsCount} models, ${storageInfo.estimatedSize}`,
        });
      }, 100);
    });
  },

  // Additional utility methods
  clearAllData: (): void => {
    localStorageService.clearAllData();
  },

  getStorageInfo: () => {
    return localStorageService.getStorageInfo();
  },
};
