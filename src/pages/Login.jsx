import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Container,
  Paper,
  Grid
} from '@mui/material';
import api from '../service/api';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();

    try {
      const resposta = await api.post('/login', {
        email: email.trim(),
        password: senha.trim()
      });

      const token = resposta.data.token;

      localStorage.setItem('token', token);

      // Testa a rota protegida com o token automaticamente
      const respostaProtegida = await api.get('/protegido');

      setMensagem(`Login autenticado com sucesso: ${respostaProtegida.data.mensagem}`);

      // Navega para o dashboard após login bem-sucedido
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (erro) {
      console.error(erro);
      setMensagem('Erro ao fazer login ou acessar rota protegida.');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' }
      }}
    >
      {/* Painel Esquerdo - Azul com Logo */}
      <Box
        sx={{
          flex: { xs: '0 0 40%', md: '0 0 35%' },
          background: 'linear-gradient(135deg, #071739 0%, #4B6382 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          padding: { xs: 3, sm: 4, md: 6 },
          position: 'relative',
          minHeight: { xs: '40vh', md: '100vh' }
        }}
      >
        {/* Elementos decorativos responsivos */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: '10%', md: '15%' },
            left: { xs: '10%', md: '15%' },
            width: { xs: 60, md: 100 },
            height: { xs: 60, md: 100 },
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            opacity: 0.3
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: '15%', md: '20%' },
            right: { xs: '15%', md: '20%' },
            width: { xs: 40, md: 80 },
            height: { xs: 40, md: 80 },
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            opacity: 0.3
          }}
        />

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
            fontWeight: 300,
            mb: { xs: 2, md: 3 },
            letterSpacing: '2px',
            textAlign: 'center'
          }}
        >
          Olin
        </Typography>

        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            opacity: 0.9,
            maxWidth: { xs: '250px', md: '300px' },
            lineHeight: 1.5,
            fontSize: { xs: '0.9rem', md: '1.25rem' },
            px: 2
          }}
        >
          Sistema de gerenciamento de perícias odontológicas
        </Typography>

        {/* Círculo decorativo */}
        <Box
         sx={{
         width: { xs: 80, md: 120 },
         height: { xs: 80, md: 120 },
         borderRadius: '50%',
         bgcolor: '#EAF1FA', // cor mais clara da paleta
         mt: { xs: 3, md: 4 },
         border: '2px solid rgba(255, 255, 255, 0.2)',
         display: { xs: 'none', sm: 'flex' },
         alignItems: 'center',
         justifyContent: 'center',
         overflow: 'hidden'
            }}
        >
        <img
        src="/logo.png"
        alt="Logo"
        style={{
        width: '80%',
        height: 'center',
        display: 'block',
        }}
        />
      </Box>
      </Box>

      {/* Painel Direito - Formulário */}
      <Box
        sx={{
          flex: { xs: '1', md: '0 0 65%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
          padding: { xs: 2, sm: 3, md: 4 },
          minHeight: { xs: '60vh', md: '100vh' },
          overflow: 'auto'
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            width: '100%',
            maxWidth: { xs: '400px', md: '500px' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100%'
          }}
        >
          <Box
            sx={{
              width: '100%',
              textAlign: 'left'
            }}
          >
            <Typography
              variant="h4"
              sx={{
                mb: { xs: 2, md: 3 },
                fontWeight: 400,
                color: '#071739',
                fontSize: { xs: '1.75rem', md: '2.125rem' }
              }}
            >
              Bem-vindo!
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: { xs: 3, md: 4 },
                color: '#4B6382',
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}
            >
              Entre para acessar o sistema
            </Typography>

            {/* Formulário */}
            <Box component="form" onSubmit={handleLogin}>
              <Typography
                variant="body2"
                sx={{ mb: 1, color: '#071739', fontSize: { xs: '0.8rem', md: '0.875rem' } }}
              >
                Email
              </Typography>
              <TextField
                fullWidth
                placeholder="name@olin.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                sx={{
                  mb: { xs: 2, md: 3 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    '& fieldset': {
                      borderColor: '#ddd'
                    },
                    '&:hover fieldset': {
                      borderColor: '#2c3e50'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2c3e50'
                    }
                  }
                }}
              />

              <Typography
                variant="body2"
                sx={{ mb: 1, color: '#071739', fontSize: { xs: '0.8rem', md: '0.875rem' } }}
              >
                Senha
              </Typography>
              <TextField
                fullWidth
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                sx={{
                  mb: { xs: 2, md: 3 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    '& fieldset': {
                      borderColor: '#ddd'
                    },
                    '&:hover fieldset': {
                      borderColor: '#2c3e50'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2c3e50'
                    }
                  }
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    sx={{
                      color: '#4B6382',
                      transform: { xs: 'scale(0.9)', md: 'scale(1)' },
                      '&.Mui-checked': {
                        color: '#071739'
                      }
                    }}
                  />
                }
                label="Lembrar-me"
                sx={{
                  mb: { xs: 2, md: 3 },
                  '& .MuiFormControlLabel-label': {
                    color: '#4B6382',
                    fontSize: { xs: '0.8rem', md: '0.875rem' }
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  bgcolor: '#071739',
                  color: 'white',
                  py: { xs: 1.2, md: 1.5 },
                  borderRadius: 1,
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  fontWeight: 400,
                  minHeight: { xs: 44, md: 48 },
                  '&:hover': {
                    bgcolor: '#4B6382'
                  },
                  '&:active': {
                    transform: 'translateY(1px)'
                  }
                }}
              >
                Entrar
              </Button>

              {mensagem && (
                <Box
                  sx={{
                    mt: 2,
                    p: { xs: 1.5, md: 2 },
                    borderRadius: 1,
                    bgcolor: mensagem.includes('sucesso') ? '#d4edda' : '#f8d7da',
                    color: mensagem.includes('sucesso') ? '#155724' : '#721c24',
                    border: mensagem.includes('sucesso') ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                    {mensagem}
                  </Typography>
                </Box>
              )}

              {/* Rodapé */}
              <Box
                sx={{ mt: { xs: 4, md: 6 }, pt: { xs: 3, md: 4 }, borderTop: '1px solid #e0e0e0' }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      fontSize: { xs: '0.7rem', md: '0.75rem' },
                      color: '#1976d2',
                      bgcolor: '#e3f2fd',
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      mb: 2,
                      display: 'inline-block'
                    }}
                  >
                    💡 Para demonstração use: admin@olin.com / admin123
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { xs: '0.7rem', md: '0.75rem' },
                      color: '#9e9e9e',
                      display: 'block'
                    }}
                  >
                    © 2025 Olin - Sistema de Perícias Odontológicas
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Login;
