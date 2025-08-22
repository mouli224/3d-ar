import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const modelService = {
  // Get all models
  getModels: async (): Promise<Model3D[]> => {
    const response = await api.get('/models/');
    return response.data;
  },

  // Get single model
  getModel: async (id: number): Promise<Model3D> => {
    const response = await api.get(`/models/${id}/`);
    return response.data;
  },

  // Upload new model
  uploadModel: async (formData: FormData): Promise<Model3D> => {
    const response = await api.post('/models/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete model
  deleteModel: async (id: number): Promise<void> => {
    await api.delete(`/models/${id}/`);
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; message: string }> => {
    const response = await api.get('/health/');
    return response.data;
  },
};

export default api;
