// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Timeline
} from '@mui/icons-material';
import Layout from '../components/Layout';

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Recupera dados do usuário do localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const StatCard = ({ title, value, change, changeType, color }) => (
    <Card sx={{ 
      height: '100%',
      background: color,
      border: '1px solid rgba(75, 99, 130, 0.05)',
      color: changeType === 'positive' ? '#2e7d32' : changeType === 'negative' ? '#d32f2f' : '#071739'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 500, opacity: 0.8, color: '#4B6382' }}>
          {title}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#071739' }}>
          {value}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {changeType === 'positive' ? (
            <TrendingUp sx={{ mr: 0.5, fontSize: 16, color: '#4caf50' }} />
          ) : changeType === 'negative' ? (
            <TrendingDown sx={{ mr: 0.5, fontSize: 16, color: '#f44336' }} />
          ) : null}
          <Typography variant="caption" sx={{ 
            color: changeType === 'positive' ? '#4caf50' : changeType === 'negative' ? '#f44336' : '#4B6382',
            fontWeight: 500
          }}>
            {change}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mt: 0.5, color: '#4B6382' }}>
          Desde última semana
        </Typography>
      </CardContent>
    </Card>
  );

  const ChartCard = ({ title, children }) => (
    <Paper sx={{ 
      p: 3, 
      height: 400,
      border: '1px solid rgba(75, 99, 130, 0.05)',
      boxShadow: '0 4px 24px rgba(7, 23, 57, 0.06)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Timeline sx={{ mr: 1, color: '#4B6382' }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#071739' }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  );

  return (
    <Layout pageTitle="Dashboard">
      <Grid container spacing={3}>
        {/* Cards de Estatísticas */}
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Total de casos"
            value="156"
            change="+12%"
            changeType="positive"
            color="linear-gradient(135deg, #F8F9FA 0%, #E8EAED 100%)"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Casos em andamento"
            value="42"
            change="-5%"
            changeType="negative"
            color="linear-gradient(135deg, #FFF8F0 0%, #FFE4CC 100%)"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Casos finalizados"
            value="114"
            change="+18%"
            changeType="positive"
            color="linear-gradient(135deg, #F0F7F0 0%, #C8E6C9 100%)"
          />
        </Grid>

        {/* Gráfico - Casos Periciais */}
        <Grid item xs={12} lg={6}>
          <ChartCard title="Casos Periciais">
            <Box sx={{ mt: 3 }}>
              {/* Status dos casos */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    bgcolor: '#071739', 
                    borderRadius: '50%', 
                    mr: 2 
                  }} />
                  <Typography variant="body2" sx={{ flex: 1, color: '#071739' }}>
                    Em andamento
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#071739' }}>
                    35%
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    bgcolor: '#A68658', 
                    borderRadius: '50%', 
                    mr: 2 
                  }} />
                  <Typography variant="body2" sx={{ flex: 1, color: '#071739' }}>
                    Finalizados
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#071739' }}>
                    45%
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    bgcolor: '#4B6382', 
                    borderRadius: '50%', 
                    mr: 2 
                  }} />
                  <Typography variant="body2" sx={{ flex: 1, color: '#071739' }}>
                    Cancelados
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#071739' }}>
                    20%
                  </Typography>
                </Box>
              </Box>

              {/* Placeholder para gráfico circular */}
              <Box sx={{ 
                height: 200, 
                border: '2px dashed rgba(75, 99, 130, 0.2)', 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(75, 99, 130, 0.02)'
              }}>
                <Typography variant="body2" sx={{ color: '#4B6382' }}>
                  Gráfico Circular - Casos Periciais
                </Typography>
              </Box>
            </Box>
          </ChartCard>
        </Grid>

        {/* Gráfico - Padrão de Vítimas */}
        <Grid item xs={12} lg={6}>
          <ChartCard title="Padrão de Vítimas">
            <Box sx={{ mt: 3 }}>
              {/* Placeholder para gráfico de dispersão */}
              <Box sx={{ 
                height: 300, 
                border: '2px dashed rgba(75, 99, 130, 0.2)', 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(75, 99, 130, 0.02)',
                position: 'relative'
              }}>
                {/* Simulação de pontos do gráfico */}
                <Box sx={{ position: 'absolute', width: '100%', height: '100%' }}>
                  {/* Eixos */}
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 20, 
                    left: 20, 
                    right: 20, 
                    height: 1, 
                    bgcolor: 'rgba(75, 99, 130, 0.3)' 
                  }} />
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 20, 
                    left: 20, 
                    top: 20, 
                    width: 1, 
                    bgcolor: 'rgba(75, 99, 130, 0.3)' 
                  }} />
                  
                  {/* Labels dos eixos */}
                  <Typography variant="caption" sx={{ 
                    position: 'absolute', 
                    bottom: 5, 
                    left: 30,
                    color: '#4B6382'
                  }}>
                    0 anos
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    position: 'absolute', 
                    bottom: 5, 
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#4B6382'
                  }}>
                    30 anos
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    position: 'absolute', 
                    bottom: 5, 
                    right: 30,
                    color: '#4B6382'
                  }}>
                    60 anos
                  </Typography>
                  
                  {/* Pontos simulados */}
                  <Box sx={{ 
                    position: 'absolute', 
                    width: 8, 
                    height: 8, 
                    bgcolor: '#071739', 
                    borderRadius: '50%',
                    top: '40%',
                    right: '20%'
                  }} />
                  <Box sx={{ 
                    position: 'absolute', 
                    width: 8, 
                    height: 8, 
                    bgcolor: '#4B6382', 
                    borderRadius: '50%',
                    top: '60%',
                    right: '25%'
                  }} />
                  <Box sx={{ 
                    position: 'absolute', 
                    width: 8, 
                    height: 8, 
                    bgcolor: '#A68658', 
                    borderRadius: '50%',
                    top: '50%',
                    left: '60%'
                  }} />
                  <Box sx={{ 
                    position: 'absolute', 
                    width: 8, 
                    height: 8, 
                    bgcolor: '#071739', 
                    borderRadius: '50%',
                    top: '70%',
                    right: '40%'
                  }} />
                </Box>
              </Box>
            </Box>
          </ChartCard>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default Dashboard;
