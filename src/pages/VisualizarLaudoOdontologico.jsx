// src/pages/VisualizarLaudoOdontologico.jsx
// IMPORTANTE: Adicionar esta rota no sistema de roteamento:
// <Route path="/laudos-odontologicos/:laudoId" element={<VisualizarLaudoOdontologico />} />

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { colors } from '../styles/colors';
import api from '../service/api';
import { DenteIcon } from '../components/DentesSVG';

const VisualizarLaudoOdontologico = () => {
  const { laudoId } = useParams();
  const navigate = useNavigate();
  
  const [laudo, setLaudo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cores das condições dentárias
  const coresCondicoes = {
    'hígido': '#4CAF50',
    'cariado': '#F44336',
    'restaurado': '#2196F3',
    'fraturado': '#FF9800',
    'ausente': '#9E9E9E',
    'implante': '#9C27B0',
    'protese': '#673AB7',
    'canal': '#795548',
    'coroa': '#607D8B',
    'ponte': '#3F51B5',
    'aparelho': '#009688',
    'outro': '#FFC107'
  };

  useEffect(() => {
    carregarLaudo();
  }, [laudoId]);

  const carregarLaudo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/api/laudos-odontologicos/${laudoId}`);
      setLaudo(response.data);
    } catch (error) {
      console.error('Erro ao carregar laudo:', error);
      setError('Erro ao carregar o laudo odontológico');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTexto = async () => {
    try {
      const response = await api.get(`/api/laudos-odontologicos/${laudoId}/texto`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laudo_odontologico_${laudoId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar laudo:', error);
      alert('Erro ao baixar o laudo');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/api/laudos-odontologicos/${laudoId}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laudo_odontologico_${laudoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      if (error.response?.status === 404) {
        alert('PDF não foi gerado para este laudo ou arquivo não encontrado no servidor.');
      } else {
        alert('Erro ao baixar o PDF. Tente novamente.');
      }
    }
  };

  const formatarCondicao = (tipo) => {
    return tipo.charAt(0).toUpperCase() + tipo.slice(1);
  };

  const separarQuadrantes = (dentes, tipoOdontograma) => {
    if (tipoOdontograma === 'adulto') {
      const direito = dentes.slice(0, 8);
      const esquerdo = dentes.slice(8, 16);
      return { direito, esquerdo };
    } else {
      const direito = dentes.slice(0, 5);
      const esquerdo = dentes.slice(5, 10);
      return { direito, esquerdo };
    }
  };

  const encontrarDente = (numeroDente, odontogramaSnapshot) => {
    if (!odontogramaSnapshot) return null;
    
    const dentesSuperiores = odontogramaSnapshot.tipoOdontograma === 'adulto' 
      ? ['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28']
      : ['55','54','53','52','51','61','62','63','64','65'];
    
    const isArcadaSuperior = dentesSuperiores.includes(numeroDente);
    const arcada = isArcadaSuperior ? 'arcadaSuperior' : 'arcadaInferior';
    
    return odontogramaSnapshot[arcada]?.find(d => d.numero === numeroDente);
  };

  const renderDenteVisualizar = (numeroDente, odontogramaSnapshot) => {
    const dente = encontrarDente(numeroDente, odontogramaSnapshot);
    
    if (!dente) return null;

    const temCondicoes = dente.condicoes && dente.condicoes.length > 0;
    const corPrincipal = temCondicoes ? coresCondicoes[dente.condicoes[0].tipo] || '#E0E0E0' : '#E0E0E0';
    const tamanho = odontogramaSnapshot.tipoOdontograma === 'adulto' ? 40 : 35;

    return (
      <Box
        key={numeroDente}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 1,
          position: 'relative'
        }}
      >
        <Typography variant="caption" sx={{ color: colors.secondary, fontWeight: 600, mb: 0.5 }}>
          {numeroDente}
        </Typography>
        
        <DenteIcon
          numero={numeroDente}
          presente={dente.presente}
          cor={corPrincipal}
          tamanho={tamanho}
          tipoOdontograma={odontogramaSnapshot.tipoOdontograma}
        />
        
        {temCondicoes && (
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              right: 5,
              width: 16,
              height: 16,
              bgcolor: colors.accent,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1
            }}
          >
            <Typography variant="caption" sx={{ color: 'white', fontSize: '0.6rem', fontWeight: 'bold' }}>
              {dente.condicoes.length}
            </Typography>
          </Box>
        )}
        
        {dente.observacoes && (
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: colors.accent, fontSize: '0.6rem' }}>
              📝
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderTabelaQuadrante = (nomeQuadrante, dentes) => {
    if (!dentes || dentes.length === 0) return null;

    return (
      <Box key={nomeQuadrante} sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
          {nomeQuadrante}
        </Typography>
        
        <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: `${colors.primary}10` }}>
                <TableCell sx={{ fontWeight: 600, color: colors.primary }}>Dente</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.primary }}>Característica</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.primary }}>Observação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dentes.map((dente) => 
                dente.condicoes.map((condicao, index) => (
                  <TableRow 
                    key={`${dente.numero}-${index}`}
                    sx={{ '&:nth-of-type(odd)': { bgcolor: `${colors.lightSlateGray}05` } }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>
                      {index === 0 ? dente.numero : ''}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatarCondicao(condicao.tipo)}
                        size="small"
                        sx={{
                          bgcolor: coresCondicoes[condicao.tipo] || colors.lightSlateGray,
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: colors.secondary }}>
                      {index === 0 ? dente.observacoes : ''}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  if (loading) {
    return (
      <Layout pageTitle="Carregando...">
        <Box sx={{ 
          minHeight: '100vh',
          background: colors.background,
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          flexDirection: 'column'
        }}>
          <CircularProgress size={50} sx={{ color: colors.primary, mb: 2 }} />
          <Typography sx={{ color: colors.secondary, fontSize: '1.1rem' }}>
            Carregando laudo odontológico...
          </Typography>
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout pageTitle="Erro">
        <Box sx={{ 
          minHeight: '100vh',
          background: colors.background,
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            {error}
          </Alert>
        </Box>
      </Layout>
    );
  }

  if (!laudo) return null;

  return (
    <Layout pageTitle="Laudo Odontológico">
      <Box sx={{ 
        minHeight: '100vh',
        background: colors.background,
        p: 3
      }}>
        
        {/* Breadcrumb */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link 
              component="button" 
              variant="body1" 
              onClick={() => navigate('/casos')}
              sx={{ 
                color: colors.secondary,
                textDecoration: 'none',
                '&:hover': { color: colors.primary },
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                padding: 0,
                font: 'inherit'
              }}
            >
              Casos
            </Link>
            <Link 
              component="button" 
              variant="body1" 
              onClick={() => navigate(`/casos/ver/${laudo.caso._id}`)}
              sx={{ 
                color: colors.secondary,
                textDecoration: 'none',
                '&:hover': { color: colors.primary },
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                padding: 0,
                font: 'inherit'
              }}
            >
              {laudo.caso.titulo}
            </Link>
            <Link 
              component="button" 
              variant="body1" 
              onClick={() => navigate(`/odontograma/${laudo.vitima._id}`)}
              sx={{ 
                color: colors.secondary,
                textDecoration: 'none',
                '&:hover': { color: colors.primary },
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                padding: 0,
                font: 'inherit'
              }}
            >
              Odontograma - {laudo.vitima.nome}
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 500 }}>
              Laudo Odontológico
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Header */}
        <Paper sx={{ 
          p: 3, 
          mb: 3,
          border: `1px solid ${colors.secondary}20`,
          boxShadow: `0 4px 24px ${colors.primary}10`,
          borderRadius: 3
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
            <Box flex={1}>
              <Typography variant="h4" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                Laudo Odontológico
              </Typography>
              <Typography variant="h6" sx={{ color: colors.secondary, mb: 1 }}>
                ID: #{laudo._id.slice(-8)}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.lightSlateGray }}>
                Emitido em: {new Date(laudo.dataEmissao).toLocaleDateString('pt-BR')} às {new Date(laudo.dataEmissao).toLocaleTimeString('pt-BR')}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.lightSlateGray }}>
                Perito: {laudo.perito.name}
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadTexto}
                sx={{
                  color: colors.primary,
                  borderColor: colors.primary,
                  '&:hover': {
                    bgcolor: `${colors.primary}10`,
                    borderColor: colors.secondary
                  }
                }}
              >
                Download Texto
              </Button>
              {laudo.arquivoPDF ? (
                <Button
                  variant="outlined"
                  startIcon={<PdfIcon />}
                  onClick={handleDownloadPDF}
                  sx={{
                    color: colors.accent,
                    borderColor: colors.accent,
                    '&:hover': {
                      bgcolor: `${colors.accent}10`,
                      borderColor: colors.accent
                    }
                  }}
                >
                  Download PDF
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<PdfIcon />}
                  disabled
                  sx={{
                    color: colors.lightSlateGray,
                    borderColor: colors.lightSlateGray
                  }}
                  title="PDF não disponível para este laudo"
                >
                  PDF Indisponível
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Dados da Vítima */}
        <Paper sx={{ 
          p: 3, 
          mb: 3,
          border: `1px solid ${colors.secondary}20`,
          borderRadius: 2
        }}>
          <Typography variant="h5" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
            Dados da Vítima
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Nome:</strong> {laudo.vitima.nome}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>NIC:</strong> {laudo.vitima.nic}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Gênero:</strong> {laudo.vitima.genero}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Idade:</strong> {laudo.vitima.idade} anos
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Odontograma Visual */}
        <Paper sx={{ 
          p: 3, 
          mb: 3,
          border: `1px solid ${colors.secondary}20`,
          borderRadius: 2
        }}>
          <Typography variant="h5" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
            Odontograma
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2, color: colors.secondary }}>
            Tipo: {laudo.tipoOdontograma === 'adulto' ? 'Adulto (32 dentes)' : 'Infantil (20 dentes)'}
          </Typography>
          
          {/* Legenda */}
          <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
            {Object.entries(coresCondicoes).map(([tipo, cor]) => (
              <Chip
                key={tipo}
                label={formatarCondicao(tipo)}
                size="small"
                sx={{
                  bgcolor: cor,
                  color: 'white',
                  fontWeight: 500
                }}
              />
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Odontograma Visual do Snapshot */}
          {laudo.odontogramaSnapshot ? (
            <>
              {/* Numeração dos dentes baseada no tipo */}
              {(() => {
                const dentesAdultoSuperior = ['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28'];
                const dentesAdultoInferior = ['48','47','46','45','44','43','42','41','31','32','33','34','35','36','37','38'];
                const dentesInfantilSuperior = ['55','54','53','52','51','61','62','63','64','65'];
                const dentesInfantilInferior = ['85','84','83','82','81','71','72','73','74','75'];

                const dentesSuperior = laudo.odontogramaSnapshot.tipoOdontograma === 'adulto' 
                  ? dentesAdultoSuperior 
                  : dentesInfantilSuperior;
                const dentesInferior = laudo.odontogramaSnapshot.tipoOdontograma === 'adulto' 
                  ? dentesAdultoInferior 
                  : dentesInfantilInferior;

                return (
                  <>
                    {/* Arcada Superior */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 600, textAlign: 'center' }}>
                        Arcada Superior
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        gap: 4,
                        bgcolor: `${colors.lightSlateGray}05`,
                        borderRadius: 2,
                        p: 2
                      }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: colors.secondary, fontWeight: 600, mb: 1, display: 'block' }}>
                            Superior Direito
                          </Typography>
                          <Box sx={{ display: 'flex' }}>
                            {separarQuadrantes(dentesSuperior, laudo.odontogramaSnapshot.tipoOdontograma).direito.map((numeroDente) => 
                              renderDenteVisualizar(numeroDente, laudo.odontogramaSnapshot)
                            )}
                          </Box>
                        </Box>
                        
                        <Box sx={{ 
                          width: 2, 
                          bgcolor: colors.primary, 
                          mx: 2,
                          borderRadius: 1,
                          minHeight: 80
                        }} />
                        
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: colors.secondary, fontWeight: 600, mb: 1, display: 'block' }}>
                            Superior Esquerdo
                          </Typography>
                          <Box sx={{ display: 'flex' }}>
                            {separarQuadrantes(dentesSuperior, laudo.odontogramaSnapshot.tipoOdontograma).esquerdo.map((numeroDente) => 
                              renderDenteVisualizar(numeroDente, laudo.odontogramaSnapshot)
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* Arcada Inferior */}
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 600, textAlign: 'center' }}>
                        Arcada Inferior
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        gap: 4,
                        bgcolor: `${colors.lightSlateGray}05`,
                        borderRadius: 2,
                        p: 2
                      }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: colors.secondary, fontWeight: 600, mb: 1, display: 'block' }}>
                            Inferior Direito
                          </Typography>
                          <Box sx={{ display: 'flex' }}>
                            {separarQuadrantes(dentesInferior, laudo.odontogramaSnapshot.tipoOdontograma).direito.map((numeroDente) => 
                              renderDenteVisualizar(numeroDente, laudo.odontogramaSnapshot)
                            )}
                          </Box>
                        </Box>
                        
                        <Box sx={{ 
                          width: 2, 
                          bgcolor: colors.primary, 
                          mx: 2,
                          borderRadius: 1,
                          minHeight: 80
                        }} />
                        
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: colors.secondary, fontWeight: 600, mb: 1, display: 'block' }}>
                            Inferior Esquerdo
                          </Typography>
                          <Box sx={{ display: 'flex' }}>
                            {separarQuadrantes(dentesInferior, laudo.odontogramaSnapshot.tipoOdontograma).esquerdo.map((numeroDente) => 
                              renderDenteVisualizar(numeroDente, laudo.odontogramaSnapshot)
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </>
                );
              })()}
            </>
          ) : (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Odontograma não disponível para este laudo.
            </Alert>
          )}
        </Paper>

        {/* Descrição das Alterações Dentárias */}
        <Paper sx={{ 
          p: 3, 
          mb: 3,
          border: `1px solid ${colors.secondary}20`,
          borderRadius: 2
        }}>
          <Typography variant="h5" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
            Descrição das Alterações Dentárias
          </Typography>
          
          {laudo.quadrantesEstruturados && Object.entries(laudo.quadrantesEstruturados).map(([key, quadrante]) => 
            renderTabelaQuadrante(quadrante.nome, quadrante.dentes)
          )}
        </Paper>

        {/* Observações */}
        {laudo.observacoes && (
          <Paper sx={{ 
            p: 3, 
            mb: 3,
            border: `1px solid ${colors.secondary}20`,
            borderRadius: 2
          }}>
            <Typography variant="h5" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
              Observações
            </Typography>
            <Typography variant="body1" sx={{ color: colors.secondary, lineHeight: 1.6 }}>
              {laudo.observacoes}
            </Typography>
          </Paper>
        )}

        {/* Parecer Técnico */}
        <Paper sx={{ 
          p: 3, 
          mb: 3,
          border: `1px solid ${colors.secondary}20`,
          borderRadius: 2
        }}>
          <Typography variant="h5" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
            Parecer Técnico
          </Typography>
          <Typography variant="body1" sx={{ color: colors.secondary, lineHeight: 1.6 }}>
            {laudo.parecer}
          </Typography>
        </Paper>

        {/* Informações do Laudo */}
        <Paper sx={{ 
          p: 3,
          border: `1px solid ${colors.secondary}20`,
          borderRadius: 2,
          bgcolor: `${colors.lightSlateGray}05`
        }}>
          <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
            Informações do Laudo
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, color: colors.secondary }}>
                <strong>Data de Emissão:</strong> {new Date(laudo.dataEmissao).toLocaleDateString('pt-BR')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: colors.secondary }}>
                <strong>Perito Responsável:</strong> {laudo.perito.name}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, color: colors.secondary }}>
                <strong>Tipo de Odontograma:</strong> {laudo.tipoOdontograma === 'adulto' ? 'Adulto (32 dentes)' : 'Infantil (20 dentes)'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: colors.secondary }}>
                <strong>ID do Laudo:</strong> {laudo._id}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Layout>
  );
};

export default VisualizarLaudoOdontologico;