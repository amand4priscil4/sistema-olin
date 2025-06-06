// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Skeleton
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Timeline,
  Assessment
} from '@mui/icons-material';
import Layout from '../components/Layout';
import MLPredictor from '../components/MLPredictor';
import { useMLAnalysis } from '../hooks/useML';

function Dashboard() {
  const [user, setUser] = useState(null);
  const { data: mlData, loading: mlLoading, error: mlError } = useMLAnalysis();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const StatCard = ({ title, value, change, changeType, color, loading }) => (
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
        {loading ? (
          <Skeleton variant="text" width="60%" height={40} />
        ) : (
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#071739' }}>
            {value}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!loading && changeType === 'positive' ? (
            <TrendingUp sx={{ mr: 0.5, fontSize: 16, color: '#4caf50' }} />
          ) : !loading && changeType === 'negative' ? (
            <TrendingDown sx={{ mr: 0.5, fontSize: 16, color: '#f44336' }} />
          ) : null}
          {loading ? (
            <Skeleton variant="text" width="40%" />
          ) : (
            <Typography variant="caption" sx={{ 
              color: changeType === 'positive' ? '#4caf50' : changeType === 'negative' ? '#f44336' : '#4B6382',
              fontWeight: 500
            }}>
              {change}
            </Typography>
          )}
        </Box>
        <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mt: 0.5, color: '#4B6382' }}>
          Dados em tempo real
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

  // Calcular estatísticas dos dados ML
  const getStatusStats = () => {
    if (!mlData?.porStatus) return { total: 0, emAndamento: 0, finalizados: 0 };
    
    const total = mlData.total;
    const emAndamento = mlData.porStatus['em andamento'] || 0;
    const finalizados = mlData.porStatus['finalizado'] || 0;
    const arquivados = mlData.porStatus['arquivado'] || 0;
    
    return { total, emAndamento, finalizados: finalizados + arquivados };
  };

  const { total, emAndamento, finalizados } = getStatusStats();

  // Calcular percentuais para gráfico
  const getStatusPercentages = () => {
    if (!mlData?.porStatus || total === 0) return [];
    
    return Object.entries(mlData.porStatus).map(([status, count]) => ({
      status,
      count,
      percentage: ((count / total) * 100).toFixed(1)
    }));
  };

  const statusPercentages = getStatusPercentages();

  // Cores para cada status
  const statusColors = {
    'em andamento': '#071739',
    'finalizado': '#4caf50', 
    'arquivado': '#4B6382'
  };

  return (
    <Layout pageTitle="Dashboard">
      <Grid container spacing={3}>
        {/* Cards de Estatísticas - Dados Reais */}
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Total de casos"
            value={total}
            change={mlError ? "Erro ao carregar" : "Dados atualizados"}
            changeType={mlError ? "negative" : "positive"}
            color="linear-gradient(135deg, #F8F9FA 0%, #E8EAED 100%)"
            loading={mlLoading}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Casos em andamento"
            value={emAndamento}
            change={total > 0 ? `${((emAndamento/total) * 100).toFixed(1)}% do total` : "0%"}
            changeType="neutral"
            color="linear-gradient(135deg, #FFF8F0 0%, #FFE4CC 100%)"
            loading={mlLoading}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Casos finalizados"
            value={finalizados}
            change={total > 0 ? `${((finalizados/total) * 100).toFixed(1)}% do total` : "0%"}
            changeType="positive"
            color="linear-gradient(135deg, #F0F7F0 0%, #C8E6C9 100%)"
            loading={mlLoading}
          />
        </Grid>

        {/* Predição ML */}
        <Grid item xs={12} lg={6}>
          <MLPredictor />
        </Grid>

        {/* Gráfico - Status dos Casos (Dados Reais) */}
        <Grid item xs={12} lg={6}>
          <ChartCard title="Distribuição por Status">
            <Box sx={{ mt: 3 }}>
              {mlLoading ? (
                <Box>
                  <Skeleton variant="text" width="80%" height={30} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" width="100%" height={200} />
                </Box>
              ) : mlError ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  border: '1px dashed rgba(244, 67, 54, 0.3)',
                  borderRadius: 1,
                  bgcolor: 'rgba(244, 67, 54, 0.02)'
                }}>
                  <Typography color="error">
                    Erro ao carregar dados
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {statusPercentages.map(({ status, count, percentage }) => (
                    <Box key={status} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ 
                          width: 12, 
                          height: 12, 
                          bgcolor: statusColors[status] || '#A68658', 
                          borderRadius: '50%', 
                          mr: 2 
                        }} />
                        <Typography variant="body2" sx={{ flex: 1, color: '#071739' }}>
                          {status} ({count} caso{count !== 1 ? 's' : ''})
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#071739' }}>
                          {percentage}%
                        </Typography>
                      </Box>
                    </Box>
                  ))}

                  {/* Gráfico visual simples */}
                  <Box sx={{ 
                    mt: 3,
                    p: 2,
                    border: '1px solid rgba(75, 99, 130, 0.1)', 
                    borderRadius: 1,
                    bgcolor: 'rgba(75, 99, 130, 0.02)'
                  }}>
                    <Typography variant="caption" sx={{ color: '#4B6382', mb: 2, display: 'block' }}>
                      Distribuição Visual
                    </Typography>
                    <Box sx={{ display: 'flex', height: 20, borderRadius: 1, overflow: 'hidden' }}>
                      {statusPercentages.map(({ status, percentage }) => (
                        <Box
                          key={status}
                          sx={{
                            width: `${percentage}%`,
                            bgcolor: statusColors[status] || '#A68658',
                            transition: 'all 0.3s ease'
                          }}
                          title={`${status}: ${percentage}%`}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </ChartCard>
        </Grid>

        {/* Análise por Tipo de Caso */}
        <Grid item xs={12}>
          <ChartCard title="Análise por Tipo de Caso">
            {mlLoading ? (
              <Skeleton variant="rectangular" width="100%" height={250} />
            ) : mlError ? (
              <Typography color="error">Erro ao carregar análise por tipo</Typography>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {Object.entries(mlData?.porTipo || {}).map(([tipo, count]) => (
                    <Grid item xs={12} sm={6} md={4} key={tipo}>
                      <Box sx={{ 
                        p: 2, 
                        border: '1px solid rgba(75, 99, 130, 0.1)',
                        borderRadius: 1,
                        bgcolor: 'rgba(7, 23, 57, 0.02)'
                      }}>
                        <Typography variant="subtitle2" sx={{ color: '#071739', mb: 1 }}>
                          {tipo}
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#4B6382', fontWeight: 600 }}>
                          {count}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#4B6382' }}>
                          {total > 0 ? `${((count/total) * 100).toFixed(1)}% do total` : '0%'}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </ChartCard>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default Dashboard;