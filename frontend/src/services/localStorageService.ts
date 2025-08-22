// Client-side storage service to replace Django backend
export interface Model3D {
  id: number;
  name: string;
  description?: string;
  model_file: string;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
  file_size: number;
}

class LocalStorageService {
  private readonly MODELS_KEY = 'ar_3d_models';
  private readonly MODEL_FILES_KEY = 'ar_3d_model_files';

  // Get all models from localStorage
  getModels(): Model3D[] {
    try {
      const modelsJson = localStorage.getItem(this.MODELS_KEY);
      return modelsJson ? JSON.parse(modelsJson) : [];
    } catch (error) {
      console.error('Error reading models from localStorage:', error);
      return [];
    }
  }

  // Get single model by ID
  getModel(id: number): Model3D | null {
    const models = this.getModels();
    return models.find(model => model.id === id) || null;
  }

  // Save model to localStorage
  saveModel(modelData: Omit<Model3D, 'id' | 'created_at' | 'updated_at'>): Model3D {
    const models = this.getModels();
    const now = new Date().toISOString();
    
    const newModel: Model3D = {
      ...modelData,
      id: Date.now(), // Use timestamp as unique ID
      created_at: now,
      updated_at: now,
    };

    models.push(newModel);
    localStorage.setItem(this.MODELS_KEY, JSON.stringify(models));
    
    return newModel;
  }

  // Update model
  updateModel(id: number, updates: Partial<Model3D>): Model3D | null {
    const models = this.getModels();
    const modelIndex = models.findIndex(model => model.id === id);
    
    if (modelIndex === -1) return null;
    
    models[modelIndex] = {
      ...models[modelIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    localStorage.setItem(this.MODELS_KEY, JSON.stringify(models));
    return models[modelIndex];
  }

  // Delete model
  deleteModel(id: number): boolean {
    const models = this.getModels();
    const filteredModels = models.filter(model => model.id !== id);
    
    if (filteredModels.length === models.length) return false; // Model not found
    
    localStorage.setItem(this.MODELS_KEY, JSON.stringify(filteredModels));
    
    // Also remove the file data
    this.deleteModelFile(id);
    
    return true;
  }

  // Store file as base64 in localStorage
  saveModelFile(modelId: number, file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const base64Data = reader.result as string;
          const fileData = {
            id: modelId,
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64Data,
          };
          
          const files = this.getModelFiles();
          files[modelId] = fileData;
          localStorage.setItem(this.MODEL_FILES_KEY, JSON.stringify(files));
          
          // Return a blob URL for the file
          const blob = new Blob([this.base64ToArrayBuffer(base64Data.split(',')[1])], { type: file.type });
          const url = URL.createObjectURL(blob);
          resolve(url);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // Get model file URL
  getModelFileUrl(modelId: number): string | null {
    const files = this.getModelFiles();
    const fileData = files[modelId];
    
    if (!fileData) return null;
    
    try {
      const blob = new Blob([this.base64ToArrayBuffer(fileData.data.split(',')[1])], { type: fileData.type });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating blob URL:', error);
      return null;
    }
  }

  // Delete model file
  deleteModelFile(modelId: number): void {
    const files = this.getModelFiles();
    delete files[modelId];
    localStorage.setItem(this.MODEL_FILES_KEY, JSON.stringify(files));
  }

  // Get all model files
  private getModelFiles(): Record<number, any> {
    try {
      const filesJson = localStorage.getItem(this.MODEL_FILES_KEY);
      return filesJson ? JSON.parse(filesJson) : {};
    } catch (error) {
      console.error('Error reading model files from localStorage:', error);
      return {};
    }
  }

  // Helper function to convert base64 to ArrayBuffer
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Clear all data (for testing/reset)
  clearAllData(): void {
    localStorage.removeItem(this.MODELS_KEY);
    localStorage.removeItem(this.MODEL_FILES_KEY);
  }

  // Get storage usage info
  getStorageInfo(): { modelsCount: number; estimatedSize: string } {
    const models = this.getModels();
    const modelsData = localStorage.getItem(this.MODELS_KEY) || '';
    const filesData = localStorage.getItem(this.MODEL_FILES_KEY) || '';
    const totalSize = modelsData.length + filesData.length;
    
    return {
      modelsCount: models.length,
      estimatedSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
    };
  }
}

export const localStorageService = new LocalStorageService();
export default localStorageService;
