// src/components/Footer.jsx
import { Box, Typography, Link, Divider } from '@mui/material';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'white',
        borderTop: '1px solid rgba(75, 99, 130, 0.08)',
        py: 2,
        px: 3,
        mt: 'auto'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 1, md: 0 }
      }}>
        {/* Copyright */}
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#4B6382',
            fontSize: '0.8rem'
          }}
        >
          © {currentYear} Olin - Sistema de Perícias Odontológicas. Todos os direitos reservados.
        </Typography>

        {/* Links */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          alignItems: 'center'
        }}>
          <Link
            href="#"
            variant="body2"
            sx={{
              color: '#4B6382',
              textDecoration: 'none',
              fontSize: '0.8rem',
              '&:hover': {
                color: '#071739',
                textDecoration: 'underline'
              }
            }}
          >
            Política de Privacidade
          </Link>
          
          <Divider 
            orientation="vertical" 
            flexItem 
            sx={{ 
              borderColor: 'rgba(75, 99, 130, 0.2)',
              display: { xs: 'none', md: 'block' }
            }} 
          />
          
          <Link
            href="#"
            variant="body2"
            sx={{
              color: '#4B6382',
              textDecoration: 'none',
              fontSize: '0.8rem',
              '&:hover': {
                color: '#071739',
                textDecoration: 'underline'
              }
            }}
          >
            Termos de Uso
          </Link>
          
          <Divider 
            orientation="vertical" 
            flexItem 
            sx={{ 
              borderColor: 'rgba(75, 99, 130, 0.2)',
              display: { xs: 'none', md: 'block' }
            }} 
          />
          
          <Link
            href="#"
            variant="body2"
            sx={{
              color: '#4B6382',
              textDecoration: 'none',
              fontSize: '0.8rem',
              '&:hover': {
                color: '#071739',
                textDecoration: 'underline'
              }
            }}
          >
            Suporte
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

export default Footer;