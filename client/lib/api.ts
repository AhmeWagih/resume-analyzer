import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401 by clearing token and redirecting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  async register(email: string, password: string) {
    const { data } = await api.post('/auth/register', { email, password });
    return data as { access_token: string; user: { id: string; email: string } };
  },

  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    return data as { access_token: string; user: { id: string; email: string } };
  },
};

export const resumeApi = {
  async upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/resumes', formData, {
      headers: { 'Content-Type': undefined },
    });
    return data;
  },

  async getAll() {
    const { data } = await api.get('/resumes');
    return data;
  },

  async getOne(id: string) {
    const { data } = await api.get(`/resumes/${id}`);
    return data;
  },

  async delete(id: string) {
    const { data } = await api.delete(`/resumes/${id}`);
    return data;
  },

  async updatePreview(id: string, previewPath: string) {
    const { data } = await api.patch(`/resumes/${id}/preview`, { previewPath });
    return data;
  },
};

export const analysisApi = {
  async run(resumeId: string, jobDescription: string) {
    const { data } = await api.post(`/analysis/${resumeId}`, { jobDescription });
    return data;
  },

  async get(resumeId: string) {
    const { data } = await api.get(`/analysis/${resumeId}`);
    return data;
  },
};

export const filesApi = {
  getUrl(filename: string): string {
    return `http://localhost:3000/files/${filename}`;
  },

  async upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': undefined },
    });
    return data;
  },
};

export default api;
