// src/service/api.js
import axios from 'axios';

// Criar instância do axios com configuração base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  }
});

// Configuração especial para uploads
export const uploadApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 120000, // 2 minutos para uploads
  headers: {
    'Content-Type': 'multipart/form-data',
  }
});

// Log para debug - remover em produção
console.log('🔧 API Base URL configurada:', import.meta.env.VITE_API_BASE_URL);

// Interceptor para adicionar token automaticamente (API normal)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log da requisição para debug
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Erro na configuração da requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para adicionar token automaticamente (Upload API)
uploadApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log da requisição para debug
    console.log(`📁 Upload Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Erro na configuração do upload:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros (API normal)
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} - ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Log detalhado do erro
    if (error.response) {
      console.error(`❌ API Error: ${error.response.status} - ${error.response.config.method?.toUpperCase()} ${error.response.config.url}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error - Sem resposta da API:', error.request);
    } else {
      console.error('❌ Request Error:', error.message);
    }
    
    // Se token expirou ou não autorizado
    if (error.response?.status === 401) {
      console.log('🔐 Token expirado ou inválido, redirecionando para login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros (Upload API)
uploadApi.interceptors.response.use(
  (response) => {
    console.log(`✅ Upload Response: ${response.status} - ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Log detalhado do erro
    if (error.response) {
      console.error(`❌ Upload Error: ${error.response.status} - ${error.response.config.method?.toUpperCase()} ${error.response.config.url}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('❌ Upload Network Error - Sem resposta da API:', error.request);
    } else if (error.code === 'ECONNABORTED') {
      console.error('❌ Upload Timeout - Arquivo muito grande ou conexão lenta');
    } else {
      console.error('❌ Upload Request Error:', error.message);
    }
    
    // Se token expirou ou não autorizado
    if (error.response?.status === 401) {
      console.log('🔐 Token expirado ou inválido, redirecionando para login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;