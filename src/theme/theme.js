// src/theme/theme.js
import { createTheme } from '@mui/material/styles';
import '@fontsource/poppins/300.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#071739',
      light: '#4B6382',
      dark: '#051024',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#A68658',
      light: '#E3C380',
      dark: '#8B6F47',
      contrastText: '#071739',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#071739',
      secondary: '#4B6382',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    error: {
      main: '#F44336',
      light: '#EF5350',
      dark: '#D32F2F',
    },
    warning: {
      main: '#E3C380',
      light: '#F0D5A3',
      dark: '#D4B366',
    },
    info: {
      main: '#4B6382',
      light: '#6B7FA0',
      dark: '#3A4F6B',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // fonte base
    h1: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 300,
      color: '#071739',
    },
    h2: {
      fontWeight: 400,
      color: '#071739',
    },
    h3: {
      fontWeight: 500,
      color: '#071739',
    },
    h4: {
      fontWeight: 500,
      color: '#071739',
    },
    h5: {
      fontWeight: 600,
      color: '#071739',
    },
    h6: {
      fontWeight: 600,
      color: '#071739',
    },
    body1: {
      color: '#071739',
    },
    body2: {
      color: '#4B6382',
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
          background: 'linear-gradient(135deg, #071739 0%, #4B6382 100%)',
          boxShadow: '0 4px 14px rgba(7, 23, 57, 0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #051024 0%, #3A4F6B 100%)',
            boxShadow: '0 6px 20px rgba(7, 23, 57, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(7, 23, 57, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover fieldset': {
              borderColor: '#4B6382',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#071739',
            },
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default theme;