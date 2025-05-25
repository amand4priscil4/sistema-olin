// src/service/api.js
import axios from 'axios';

// Cria instância do axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/auth', // URL base para login/auth
  timeout: 10000 // 10 segundos de timeout
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas e erros
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Erro de conexão: Verifique se o servidor está rodando');
      return Promise.reject(
        new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.')
      );
    }

    // Se token expirou ou não autorizado, redireciona para login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Função auxiliar para requisições para a API de casos (usando a instância principal)
export const casesApi = {
  get: url => {
    // Usa a instância api principal que já tem a baseURL correta
    return api.get(url);
  },

  post: (url, data) => {
    return api.post(url, data);
  },

  put: (url, data) => {
    return api.put(url, data);
  },

  delete: url => {
    return api.delete(url);
  }
};

export default api;