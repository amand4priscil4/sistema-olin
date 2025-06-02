// src/theme/theme.js
import { createTheme } from '@mui/material/styles';
import '@fontsource/poppins/300.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2F2F2F',          // cinza escuro
      light: '#6B7280',         // cinza médio
      dark: '#1F2937',          // cinza mais escuro
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6B7280',          // cinza médio
      light: '#9CA3AF',         // cinza claro
      dark: '#374151',          // cinza carvão
      contrastText: '#2F2F2F',
    },
    background: {
      default: '#F9FAFB',       // background neutro
      paper: '#FFFFFF',         // branco para cards
    },
    text: {
      primary: '#2F2F2F',       // cinza escuro para texto principal
      secondary: '#6B7280',     // cinza médio para texto secundário
    },
    success: {
      main: '#4CAF50',          // verde para sucesso
      light: '#81C784',
      dark: '#388E3C',
    },
    error: {
      main: '#F44336',          // vermelho para erro
      light: '#EF5350',
      dark: '#D32F2F',
    },
    warning: {
      main: '#FF9800',          // laranja para warning
      light: '#FFB74D',
      dark: '#F57C00',
    },
    info: {
      main: '#DC3545',          // vermelho como cor de destaque
      light: '#E57373',
      dark: '#C62828',
    },
    // Cores customizadas adicionais
    accent: {
      main: '#DC3545',          // vermelho de destaque
      light: '#EF5350',
      dark: '#C62828',
      contrastText: '#ffffff',
    },
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // fonte base
    h1: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 300,
      color: '#2F2F2F',          // cinza escuro
    },
    h2: {
      fontWeight: 400,
      color: '#2F2F2F',          // cinza escuro
    },
    h3: {
      fontWeight: 500,
      color: '#2F2F2F',          // cinza escuro
    },
    h4: {
      fontWeight: 500,
      color: '#2F2F2F',          // cinza escuro
    },
    h5: {
      fontWeight: 600,
      color: '#2F2F2F',          // cinza escuro
    },
    h6: {
      fontWeight: 600,
      color: '#2F2F2F',          // cinza escuro
    },
    body1: {
      color: '#2F2F2F',          // cinza escuro
    },
    body2: {
      color: '#6B7280',          // cinza médio
    },
  },  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
        },
        contained: {
          background: 'linear-gradient(135deg, #374151 0%, #6B7280 100%)', // gradiente neutro
          boxShadow: '0 4px 14px rgba(47, 47, 47, 0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2F2F2F 0%, #4B5563 100%)', // hover mais escuro
            boxShadow: '0 6px 20px rgba(47, 47, 47, 0.35)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #374151 0%, #6B7280 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2F2F2F 0%, #4B5563 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #DC3545 0%, #EF5350 100%)', // vermelho para secondary
          '&:hover': {
            background: 'linear-gradient(135deg, #C62828 0%, #D32F2F 100%)',
          },
        },
        outlined: {
          borderColor: '#6B7280',
          color: '#6B7280',
          '&:hover': {
            borderColor: '#374151',
            backgroundColor: 'rgba(107, 114, 128, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(47, 47, 47, 0.08)', // sombra neutra
          border: '1px solid rgba(156, 163, 175, 0.2)',   // borda sutil
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(47, 47, 47, 0.08)', // sombra neutra
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover fieldset': {
              borderColor: '#6B7280',     // cinza médio no hover
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2F2F2F',     // cinza escuro no focus
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTab-root': {
            color: '#6B7280',             // cinza médio para tabs
            '&.Mui-selected': {
              color: '#2F2F2F',           // cinza escuro para tab ativa
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#DC3545',   // vermelho para indicador
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        filled: {
          '&.MuiChip-colorPrimary': {
            backgroundColor: '#374151',
            color: '#ffffff',
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#DC3545',             // vermelho para switch ativo
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#DC3545',   // vermelho para track ativo
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: '#E5E7EB',
        },
        bar: {
          borderRadius: 4,
          backgroundColor: '#374151',
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});

// Adicionando as cores customizadas ao tema
theme.palette.accent = {
  main: '#DC3545',
  light: '#EF5350', 
  dark: '#C62828',
  contrastText: '#ffffff',
};

theme.palette.neutral = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
};

export default theme;