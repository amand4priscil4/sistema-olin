// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Casos from './pages/Casos'; 
import BancodeCasos from './pages/BancodeCasos';
import Historico from './pages/Historico';
import Usuarios from './pages/Usuarios';
import Ajustes from './pages/Ajustes'; // ✅ Import da página de ajustes real
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import VerCaso from './pages/VerCaso';
import Odontograma from './pages/Odontograma';
import VisualizarLaudoOdontologico from './pages/VisualizarLaudoOdontologico';
import MarcacoesAnatomicas from './pages/MarcacoesAnatomicas';

// Tema inline como fallback
import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#2F2F2F',     // Cinza escuro (era azul)
      light: '#6B7280',    // Cinza médio  
      dark: '#1F2937',     // Cinza mais escuro
    },
    secondary: {
      main: '#6B7280',     // Cinza médio 
      light: '#9CA3AF',    // Cinza claro 
      dark: '#374151',     // Cinza carvão
    },
  },
});

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
          
          <Route 
            path="/banco-casos" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'perito', 'assistente']}>
                <BancodeCasos />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/vitimas/:vitimaId/marcacoes-anatomicas" 
            element={<MarcacoesAnatomicas />} 
          />
          
          <Route 
            path="/historico" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Historico />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/usuarios" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Usuarios />
              </ProtectedRoute>
            } 
          />
          
          {/* ✅ Rota atualizada para usar o componente Ajustes real */}
          <Route 
            path="/ajustes" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'perito', 'assistente']}>
                <Ajustes />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;