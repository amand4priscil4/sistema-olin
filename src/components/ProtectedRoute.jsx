// src/components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se há token válido
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    // Recupera dados do usuário
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  // Redireciona para login se não estiver autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verifica se o usuário tem permissão para acessar a rota
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: '#F8F9FA',
        p: 3
      }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <BlockIcon sx={{ fontSize: 64, color: '#A68658', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2, color: '#071739', fontWeight: 600 }}>
            Acesso Negado
          </Typography>
          <Typography variant="body1" sx={{ color: '#4B6382', mb: 2 }}>
            Você não tem permissão para acessar esta página.
          </Typography>
          <Typography variant="caption" sx={{ color: '#A68658' }}>
            Role atual: {user.role} | Roles necessários: {allowedRoles.join(', ')}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return children;
}

export default ProtectedRoute;