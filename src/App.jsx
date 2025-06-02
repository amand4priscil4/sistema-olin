// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Casos from './pages/Casos'; 
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import VerCaso from './pages/VerCaso';
import Odontograma from './pages/Odontograma';
import VisualizarLaudoOdontologico from './pages/VisualizarLaudoOdontologico';

// Tema inline como fallback
import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#071739',
      light: '#4B6382',
      dark: '#051024',
    },
    secondary: {
      main: '#A68658',
      light: '#E3C380',
      dark: '#8B6F47',
    },
  },
});

// Páginas placeholder com proteção adequada
const BancoCasos = () => (
  <ProtectedRoute allowedRoles={['admin', 'perito', 'assistente']}>
    <Layout pageTitle="Banco de Casos">
      <div>Página do Banco de Casos em desenvolvimento...</div>
    </Layout>
  </ProtectedRoute>
);

const Historico = () => (
  <ProtectedRoute allowedRoles={['admin']}>
    <Layout pageTitle="Histórico do Sistema">
      <div>Página de Histórico em desenvolvimento...</div>
    </Layout>
  </ProtectedRoute>
);

const Usuarios = () => (
  <ProtectedRoute allowedRoles={['admin']}>
    <Layout pageTitle="Gestão de Usuários">
      <div>Página de Usuários em desenvolvimento...</div>
    </Layout>
  </ProtectedRoute>
);

const Ajustes = () => (
  <ProtectedRoute allowedRoles={['admin', 'perito', 'assistente']}>
    <Layout pageTitle="Configurações">
      <div>Página de Ajustes em desenvolvimento...</div>
    </Layout>
  </ProtectedRoute>
);

function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/Dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'perito', 'assistente']}>
                <Dashboard /> 
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/casos" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'perito', 'assistente']}>
                <Casos />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/casos/ver/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'perito', 'assistente']}>
                <VerCaso />
              </ProtectedRoute>
            } 
          />

          {/* Rota do Odontograma */}
          <Route 
            path="/vitimas/:vitimaId/odontograma" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'perito']}>
                <Odontograma />
              </ProtectedRoute>
            } 
          />

          <Route path="/laudos-odontologicos/:laudoId" element={<VisualizarLaudoOdontologico />} />
          
          <Route path="/banco-casos" element={<BancoCasos />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/ajustes" element={<Ajustes />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;