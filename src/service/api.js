// src/service/api.js
import axios from 'axios';

// Cria instância do axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://case-api-icfc.onrender.com/api', // URL correta da API
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

// Função auxiliar para requisições para a API de casos
export const casesApi = {
  get: url => {
    const token = localStorage.getItem('token');
    return axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 10000
    });
  },

  post: (url, data) => {
    const token = localStorage.getItem('token');
    return axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  },

  put: (url, data) => {
    const token = localStorage.getItem('token');
    return axios.put(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  },

  delete: url => {
    const token = localStorage.getItem('token');
    return axios.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 10000
    });
  }
};

export default api;
