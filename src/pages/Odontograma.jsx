// src/pages/Odontograma.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  NavigateNext as NavigateNextIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { colors } from '../styles/colors';
import api from '../service/api';
import { DenteIcon } from '../components/DentesSVG';

const Odontograma = () => {
  const { vitimaId } = useParams();
  const navigate = useNavigate();
  
  const [vitima, setVitima] = useState(null);
  const [odontograma, setOdontograma] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para tipo de odontograma
  const [tipoOdontograma, setTipoOdontograma] = useState('adulto');
  
  // Estados para modal de condição
  const [showCondicaoModal, setShowCondicaoModal] = useState(false);
  const [denteEditando, setDenteEditando] = useState(null);
  const [novaCondicao, setNovaCondicao] = useState({
    tipo: '',
    faces: [],
    descricao: ''
  });

  // Estados para observações
  const [showObservacoesModal, setShowObservacoesModal] = useState(false);
  const [observacoesDente, setObservacoesDente] = useState('');

  // Estados para laudo odontológico
  const [showLaudoModal, setShowLaudoModal] = useState(false);
  const [laudoData, setLaudoData] = useState({
    observacoes: '',
    parecer: ''
  });
  const [laudosExistentes, setLaudosExistentes] = useState([]);

  // Numeração dos dentes seguindo padrão FDI
  const dentesAdultoSuperior = ['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28'];
  const dentesAdultoInferior = ['48','47','46','45','44','43','42','41','31','32','33','34','35','36','37','38'];
  const dentesInfantilSuperior = ['55','54','53','52','51','61','62','63','64','65'];
  const dentesInfantilInferior = ['85','84','83','82','81','71','72','73','74','75'];

  // Seleciona os dentes baseado no tipo
  const dentesSuperior = tipoOdontograma === 'adulto' ? dentesAdultoSuperior : dentesInfantilSuperior;
  const dentesInferior = tipoOdontograma === 'adulto' ? dentesAdultoInferior : dentesInfantilInferior;

  // Tipos de condições dentárias
  const tiposCondicao = [
    { value: 'hígido', label: 'Hígido', color: '#4CAF50' },
    { value: 'cariado', label: 'Cariado', color: '#F44336' },
    { value: 'restaurado', label: 'Restaurado', color: '#2196F3' },
    { value: 'fraturado', label: 'Fraturado', color: '#FF9800' },
    { value: 'ausente', label: 'Ausente', color: '#9E9E9E' },
    { value: 'implante', label: 'Implante', color: '#9C27B0' },
    { value: 'protese', label: 'Prótese', color: '#673AB7' },
    { value: 'canal', label: 'Canal', color: '#795548' },
    { value: 'coroa', label: 'Coroa', color: '#607D8B' },
    { value: 'ponte', label: 'Ponte', color: '#3F51B5' },
    { value: 'aparelho', label: 'Aparelho', color: '#009688' },
    { value: 'outro', label: 'Outro', color: '#FFC107' }
  ];

  useEffect(() => {
    carregarDados();
  }, [vitimaId]);

  useEffect(() => {
    if (vitimaId) {
      carregarLaudos();
    }
  }, [vitimaId]);

  useEffect(() => {
    if (tipoOdontograma && !loading) {
      if (!odontograma || !odontograma.arcadaSuperior || odontograma.arcadaSuperior.length === 0) {
        inicializarOdontograma();
      }
    }
  }, [tipoOdontograma, loading, odontograma]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);

      const responseVitima = await api.get(`/api/vitimas/${vitimaId}`);
      setVitima(responseVitima.data);

      try {
        const responseOdontograma = await api.get(`/api/vitimas/${vitimaId}/odontograma`);
        const odontogramaData = responseOdontograma.data;
        setOdontograma(odontogramaData);
        
        if (odontogramaData.tipoOdontograma) {
          setTipoOdontograma(odontogramaData.tipoOdontograma);
        } else {
          const totalDentes = (odontogramaData.arcadaSuperior?.length || 0) + 
                             (odontogramaData.arcadaInferior?.length || 0);
          const tipoDetectado = totalDentes <= 20 ? 'infantil' : 'adulto';
          setTipoOdontograma(tipoDetectado);
          setOdontograma({
            ...odontogramaData,
            tipoOdontograma: tipoDetectado
          });
        }
      } catch (error) {
        if (error.response?.status === 404) {
          // Odontograma não encontrado
        } else {
          throw error;
        }
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados do odontograma');
    } finally {
      setLoading(false);
    }
  };

  const carregarLaudos = async () => {
    try {
      if (!vitimaId) return;
      const response = await api.get(`/api/laudos-odontologicos/vitima/${vitimaId}`);
      setLaudosExistentes(response.data);
    } catch (error) {
      console.error('Erro ao carregar laudos:', error);
      // Se não existem laudos, não é um erro crítico
      setLaudosExistentes([]);
    }
  };

  const inicializarOdontograma = () => {
    const dentesSuperiores = tipoOdontograma === 'adulto' ? dentesAdultoSuperior : dentesInfantilSuperior;
    const dentesInferiores = tipoOdontograma === 'adulto' ? dentesAdultoInferior : dentesInfantilInferior;
    
    const odontogramaInicial = {
      tipoOdontograma,
      arcadaSuperior: dentesSuperiores.map(numero => ({
        numero,
        presente: true,
        condicoes: [],
        observacoes: ''
      })),
      arcadaInferior: dentesInferiores.map(numero => ({
        numero,
        presente: true,
        condicoes: [],
        observacoes: ''
      })),
      observacoesGerais: '',
      metodologia: '',
      dataExame: new Date().toISOString()
    };
    
    setOdontograma(odontogramaInicial);
  };

  const separarQuadrantes = (dentes) => {
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

  const encontrarDente = (numeroDente) => {
    if (!odontograma) return null;
    
    const dentesSuperiores = tipoOdontograma === 'adulto' ? dentesAdultoSuperior : dentesInfantilSuperior;
    const isArcadaSuperior = dentesSuperiores.includes(numeroDente);
    const arcada = isArcadaSuperior ? 'arcadaSuperior' : 'arcadaInferior';
    
    return {
      arcada,
      dente: odontograma[arcada]?.find(d => d.numero === numeroDente)
    };
  };

  const getCorCondicao = (tipo) => {
    const condicao = tiposCondicao.find(c => c.value === tipo);
    return condicao ? condicao.color : '#9E9E9E';
  };

  const handleTipoOdontogramaChange = (novoTipo) => {
    if (odontograma && odontograma.tipoOdontograma && odontograma.tipoOdontograma !== novoTipo) {
      const confirmar = window.confirm(
        `Tem certeza que deseja alternar para odontograma ${novoTipo === 'adulto' ? 'adulto (32 dentes)' : 'infantil (20 dentes)'}? 

Os dados atuais serão perdidos e um novo odontograma será criado.`
      );
      
      if (confirmar) {
        setTipoOdontograma(novoTipo);
        setTimeout(() => {
          inicializarOdontograma();
        }, 100);
      }
    } else {
      setTipoOdontograma(novoTipo);
      if (!odontograma || !odontograma.tipoOdontograma || !odontograma.arcadaSuperior) {
        setTimeout(() => {
          inicializarOdontograma();
        }, 100);
      }
    }
  };

  const handleDenteClick = (numeroDente) => {
    const resultado = encontrarDente(numeroDente);
    if (resultado?.dente) {
      setDenteEditando({ numero: numeroDente, ...resultado.dente });
      setShowCondicaoModal(true);
    }
  };

  const handleAdicionarCondicao = async () => {
    try {
      if (!novaCondicao.tipo) {
        alert('Selecione o tipo de condição');
        return;
      }

      setSaving(true);
      await api.post(`/api/vitimas/${vitimaId}/odontograma/dente/${denteEditando.numero}/condicao`, {
        tipo: novaCondicao.tipo,
        faces: novaCondicao.faces,
        descricao: novaCondicao.descricao
      });

      await carregarDados();
      setShowCondicaoModal(false);
      setNovaCondicao({ tipo: '', faces: [], descricao: '' });
      setDenteEditando(null);

    } catch (error) {
      console.error('Erro ao adicionar condição:', error);
      alert('Erro ao adicionar condição');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoverCondicao = async (condicaoId) => {
    try {
      setSaving(true);
      await api.delete(`/api/vitimas/${vitimaId}/odontograma/dente/${denteEditando.numero}/condicao/${condicaoId}`);
      await carregarDados();
    } catch (error) {
      console.error('Erro ao remover condição:', error);
      alert('Erro ao remover condição');
    } finally {
      setSaving(false);
    }
  };

  const handleSalvarObservacoes = async () => {
    try {
      setSaving(true);
      await api.put(`/api/vitimas/${vitimaId}/odontograma/dente/${denteEditando.numero}/observacoes`, {
        observacoes: observacoesDente
      });
      
      await carregarDados();
      setShowObservacoesModal(false);
      setObservacoesDente('');
      setDenteEditando(null);
      
    } catch (error) {
      console.error('Erro ao salvar observações:', error);
      alert('Erro ao salvar observações');
    } finally {
      setSaving(false);
    }
  };

  const handleCriarLaudo = async () => {
    try {
      if (!laudoData.parecer.trim()) {
        alert('O parecer é obrigatório para criar o laudo');
        return;
      }

      setSaving(true);
      await api.post(`/api/laudos-odontologicos/vitima/${vitimaId}`, {
        observacoes: laudoData.observacoes,
        parecer: laudoData.parecer,
        odontogramaSnapshot: odontograma
      });
      
      alert('Laudo odontológico criado com sucesso!');
      setShowLaudoModal(false);
      setLaudoData({ observacoes: '', parecer: '' });
      await carregarLaudos();
    } catch (error) {
      console.error('Erro ao criar laudo:', error);
      alert('Erro ao criar laudo odontológico');
    } finally {
      setSaving(false);
    }
  };

  const renderDente = (numeroDente) => {
    const resultado = encontrarDente(numeroDente);
    const dente = resultado?.dente;
    
    if (!dente) return null;

    const temCondicoes = dente.condicoes && dente.condicoes.length > 0;
    const corPrincipal = temCondicoes ? getCorCondicao(dente.condicoes[0].tipo) : '#E0E0E0';
    const tamanho = tipoOdontograma === 'adulto' ? 40 : 35;

    return (
      <Box
        key={numeroDente}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 1,
          cursor: 'pointer',
          position: 'relative',
          '&:hover': {
            bgcolor: `${colors.primary}10`,
            borderRadius: 1
          }
        }}
        onClick={() => handleDenteClick(numeroDente)}
      >
        <Typography variant="caption" sx={{ color: colors.secondary, fontWeight: 600, mb: 0.5 }}>
          {numeroDente}
        </Typography>
        
        <DenteIcon
          numero={numeroDente}
          presente={dente.presente}
          cor={corPrincipal}
          tamanho={tamanho}
          tipoOdontograma={tipoOdontograma}
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
            Carregando odontograma...
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

  return (
    <Layout pageTitle="Odontograma">
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
              sx={{ color: colors.secondary }}
            >
              Casos
            </Link>
            <Link 
              component="button" 
              variant="body1" 
              onClick={() => navigate(`/casos/ver/${vitima?.caso._id}`)}
              sx={{ color: colors.secondary }}
            >
              {vitima?.caso.titulo}
            </Link>
            <Typography color="text.primary">
              Odontograma - {vitima?.nome}
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
                Odontograma
              </Typography>
              <Typography variant="h6" sx={{ color: colors.secondary, mb: 1 }}>
                Vítima: {vitima?.nome}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.lightSlateGray }}>
                NIC: {vitima?.nic} | Caso: {vitima?.caso.titulo}
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowLaudoModal(true)}
                disabled={!odontograma}
                sx={{
                  bgcolor: colors.accent,
                  color: 'white',
                  '&:hover': {
                    bgcolor: colors.primary,
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${colors.accent}40`
                  },
                  fontWeight: 600,
                  borderRadius: 2,
                  transition: 'all 0.3s ease'
                }}
              >
                Criar Laudo Odontológico
              </Button>
              <Button
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/casos/ver/${vitima?.caso._id}`)}
                sx={{
                  bgcolor: colors.steelBlue,
                  color: 'white',
                  '&:hover': {
                    bgcolor: colors.primary,
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${colors.primary}40`
                  },
                  fontWeight: 600,
                  borderRadius: 2,
                  transition: 'all 0.3s ease'
                }}
              >
                Voltar ao Caso
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Laudos Existentes */}
        {laudosExistentes.length > 0 && (
          <Paper sx={{ 
            p: 3, 
            mb: 3,
            border: `1px solid ${colors.secondary}20`,
            borderRadius: 2
          }}>
            <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600, mb: 2 }}>
              Laudos Odontológicos Existentes ({laudosExistentes.length})
            </Typography>
            <List>
              {laudosExistentes.map((laudo, index) => (
                <ListItem key={laudo._id} divider={index < laudosExistentes.length - 1}>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Laudo #{laudo._id.slice(-6)}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ color: colors.secondary }}>
                          Criado por: {laudo.perito?.name} em {new Date(laudo.dataEmissao).toLocaleDateString('pt-BR')}
                        </Typography>
                        {laudo.parecer && (
                          <Typography variant="body2" sx={{ color: colors.lightSlateGray, mt: 0.5 }}>
                            {laudo.parecer.length > 100 ? `${laudo.parecer.substring(0, 100)}...` : laudo.parecer}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      onClick={() => navigate(`/laudos-odontologicos/${laudo._id}`)}
                      sx={{ color: colors.primary }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Seletor de Tipo de Odontograma */}
        <Paper sx={{ 
          p: 3, 
          mb: 3,
          border: `1px solid ${colors.secondary}20`,
          borderRadius: 2
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600, mb: 1 }}>
                Tipo de Odontograma
              </Typography>
              <Typography variant="body2" sx={{ color: colors.secondary }}>
                {tipoOdontograma === 'adulto' 
                  ? 'Dentes permanentes (32 dentes) - Pacientes adultos'
                  : 'Dentes decíduos (20 dentes) - Pacientes infantis'
                }
              </Typography>
            </Box>
            
            <Box display="flex" gap={1}>
              <Button
                variant={tipoOdontograma === 'adulto' ? 'contained' : 'outlined'}
                onClick={() => handleTipoOdontogramaChange('adulto')}
                sx={{
                  bgcolor: tipoOdontograma === 'adulto' ? colors.primary : 'transparent',
                  color: tipoOdontograma === 'adulto' ? 'white' : colors.primary,
                  borderColor: colors.primary,
                  '&:hover': {
                    bgcolor: tipoOdontograma === 'adulto' ? colors.secondary : `${colors.primary}10`,
                    borderColor: colors.secondary
                  }
                }}
              >
                Adulto (32 dentes)
              </Button>
              <Button
                variant={tipoOdontograma === 'infantil' ? 'contained' : 'outlined'}
                onClick={() => handleTipoOdontogramaChange('infantil')}
                sx={{
                  bgcolor: tipoOdontograma === 'infantil' ? colors.primary : 'transparent',
                  color: tipoOdontograma === 'infantil' ? 'white' : colors.primary,
                  borderColor: colors.primary,
                  '&:hover': {
                    bgcolor: tipoOdontograma === 'infantil' ? colors.secondary : `${colors.primary}10`,
                    borderColor: colors.secondary
                  }
                }}
              >
                Infantil (20 dentes)
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Legenda */}
        <Paper sx={{ 
          p: 2, 
          mb: 3,
          border: `1px solid ${colors.secondary}20`,
          borderRadius: 2
        }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
            Legenda das Condições
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
            {tiposCondicao.map((tipo) => (
              <Chip
                key={tipo.value}
                label={tipo.label}
                size="small"
                sx={{
                  bgcolor: tipo.color,
                  color: 'white',
                  fontWeight: 500
                }}
              />
            ))}
          </Box>
          
          <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600, mt: 2 }}>
            Tipos de Dentes
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <DenteIcon numero="11" presente={true} cor="#E0E0E0" tamanho={20} tipoOdontograma={tipoOdontograma} />
              <Typography variant="caption" sx={{ color: colors.secondary }}>
                Incisivos
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <DenteIcon numero="13" presente={true} cor="#E0E0E0" tamanho={20} tipoOdontograma={tipoOdontograma} />
              <Typography variant="caption" sx={{ color: colors.secondary }}>
                Caninos
              </Typography>
            </Box>
            {tipoOdontograma === 'adulto' && (
              <Box display="flex" alignItems="center" gap={1}>
                <DenteIcon numero="14" presente={true} cor="#E0E0E0" tamanho={20} tipoOdontograma={tipoOdontograma} />
                <Typography variant="caption" sx={{ color: colors.secondary }}>
                  Pré-molares
                </Typography>
              </Box>
            )}
            <Box display="flex" alignItems="center" gap={1}>
              <DenteIcon numero={tipoOdontograma === 'adulto' ? "16" : "54"} presente={true} cor="#E0E0E0" tamanho={20} tipoOdontograma={tipoOdontograma} />
              <Typography variant="caption" sx={{ color: colors.secondary }}>
                Molares
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="caption" sx={{ color: colors.secondary, display: 'block' }}>
            <strong>Numeração FDI:</strong> {tipoOdontograma === 'adulto' 
              ? 'Dentes permanentes numerados de 11-48 (32 dentes total)'
              : 'Dentes decíduos numerados de 51-85 (20 dentes total)'
            }
          </Typography>
          <Typography variant="caption" sx={{ color: colors.lightSlateGray }}>
            Clique em qualquer dente para adicionar condições ou observações
          </Typography>
        </Paper>

        {/* Odontograma */}
        <Paper sx={{ 
          p: 3,
          border: `1px solid ${colors.secondary}20`,
          boxShadow: `0 4px 24px ${colors.primary}10`,
          borderRadius: 3
        }}>
          
          {!odontograma ? (
            <Box textAlign="center" py={8}>
              <CircularProgress size={40} sx={{ color: colors.primary, mb: 2 }} />
              <Typography variant="h6" sx={{ color: colors.primary }}>
                Carregando odontograma...
              </Typography>
            </Box>
          ) : (
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
                      {separarQuadrantes(dentesSuperior).direito.map((numeroDente) => renderDente(numeroDente))}
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
                      {separarQuadrantes(dentesSuperior).esquerdo.map((numeroDente) => renderDente(numeroDente))}
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
                      {separarQuadrantes(dentesInferior).direito.map((numeroDente) => renderDente(numeroDente))}
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
                      {separarQuadrantes(dentesInferior).esquerdo.map((numeroDente) => renderDente(numeroDente))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </>
          )}

          {/* Observações Gerais */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
              Observações Gerais
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={odontograma?.observacoesGerais || ''}
              onChange={(e) => setOdontograma({...odontograma, observacoesGerais: e.target.value})}
              placeholder="Digite observações gerais sobre o exame odontológico..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: colors.secondary },
                  '&.Mui-focused fieldset': { borderColor: colors.primary }
                }
              }}
            />
          </Box>
        </Paper>

        {/* Modal para criar laudo odontológico */}
        <Dialog 
          open={showLaudoModal} 
          onClose={() => setShowLaudoModal(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: `0 24px 48px ${colors.primary}20`
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: colors.accent, 
            color: 'white',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <DescriptionIcon />
            Criar Laudo Odontológico
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                Informações da Vítima
              </Typography>
              <Typography variant="body2" sx={{ color: colors.secondary }}>
                <strong>Nome:</strong> {vitima?.nome} | <strong>NIC:</strong> {vitima?.nic}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.secondary }}>
                <strong>Caso:</strong> {vitima?.caso.titulo}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
              Observações Técnicas
            </Typography>
            <TextField
              fullWidth
              label="Observações (opcional)"
              multiline
              rows={4}
              value={laudoData.observacoes}
              onChange={(e) => setLaudoData({...laudoData, observacoes: e.target.value})}
              placeholder="Digite observações técnicas sobre o exame odontológico..."
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle1" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
              Parecer Técnico *
            </Typography>
            <TextField
              fullWidth
              label="Parecer"
              multiline
              rows={6}
              required
              value={laudoData.parecer}
              onChange={(e) => setLaudoData({...laudoData, parecer: e.target.value})}
              placeholder="Digite o parecer técnico conclusivo do exame odontológico..."
              error={!laudoData.parecer.trim()}
              helperText={!laudoData.parecer.trim() ? "O parecer é obrigatório" : ""}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: colors.secondary },
                  '&.Mui-focused fieldset': { borderColor: colors.primary }
                }
              }}
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              O odontograma atual será anexado ao laudo como referência técnica.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setShowLaudoModal(false)}
              sx={{ color: colors.secondary }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCriarLaudo}
              variant="contained"
              disabled={!laudoData.parecer.trim() || saving}
              sx={{
                bgcolor: colors.accent,
                '&:hover': { bgcolor: colors.primary }
              }}
            >
              {saving ? <CircularProgress size={20} /> : 'Criar Laudo'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal para adicionar/editar condições */}
        <Dialog 
          open={showCondicaoModal} 
          onClose={() => setShowCondicaoModal(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: `0 24px 48px ${colors.primary}20`
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: colors.primary, 
            color: 'white',
            fontWeight: 600
          }}>
            Dente {denteEditando?.numero}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {denteEditando?.condicoes && denteEditando.condicoes.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                  Condições Existentes
                </Typography>
                {denteEditando.condicoes.map((condicao, index) => (
                  <Box key={index} sx={{ mb: 1, p: 2, border: `1px solid ${colors.lightSlateGray}40`, borderRadius: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Chip 
                          label={condicao.tipo} 
                          size="small" 
                          sx={{ bgcolor: getCorCondicao(condicao.tipo), color: 'white' }}
                        />
                        {condicao.faces && condicao.faces.length > 0 && (
                          <Typography variant="body2" sx={{ color: colors.secondary, mt: 0.5 }}>
                            Faces: {condicao.faces.join(', ')}
                          </Typography>
                        )}
                        {condicao.descricao && (
                          <Typography variant="body2" sx={{ color: colors.secondary }}>
                            {condicao.descricao}
                          </Typography>
                        )}
                      </Box>
                      <IconButton 
                        onClick={() => handleRemoverCondicao(condicao._id)}
                        disabled={saving}
                        sx={{ color: '#F44336' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
              Adicionar Nova Condição
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tipo de Condição</InputLabel>
              <Select
                value={novaCondicao.tipo}
                onChange={(e) => setNovaCondicao({...novaCondicao, tipo: e.target.value})}
                label="Tipo de Condição"
              >
                {tiposCondicao.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box 
                        sx={{ 
                          width: 16, 
                          height: 16, 
                          bgcolor: tipo.color, 
                          borderRadius: '50%' 
                        }} 
                      />
                      {tipo.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Descrição (opcional)"
              multiline
              rows={2}
              value={novaCondicao.descricao}
              onChange={(e) => setNovaCondicao({...novaCondicao, descricao: e.target.value})}
              sx={{ mb: 2 }}
            />

            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setObservacoesDente(denteEditando?.observacoes || '');
                  setShowObservacoesModal(true);
                }}
                sx={{ color: colors.primary, borderColor: colors.primary }}
              >
                Editar Observações do Dente
              </Button>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setShowCondicaoModal(false)}
              sx={{ color: colors.secondary }}
            >
              Fechar
            </Button>
            <Button 
              onClick={handleAdicionarCondicao}
              variant="contained"
              disabled={!novaCondicao.tipo || saving}
              sx={{
                bgcolor: colors.steelBlue,
                '&:hover': { bgcolor: colors.primary }
              }}
            >
              {saving ? <CircularProgress size={20} /> : 'Adicionar Condição'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal para observações do dente */}
        <Dialog 
          open={showObservacoesModal} 
          onClose={() => setShowObservacoesModal(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            Observações do Dente {denteEditando?.numero}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Observações"
              multiline
              rows={4}
              value={observacoesDente}
              onChange={(e) => setObservacoesDente(e.target.value)}
              placeholder="Digite observações específicas para este dente..."
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowObservacoesModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSalvarObservacoes}
              variant="contained"
              disabled={saving}
            >
              {saving ? <CircularProgress size={20} /> : 'Salvar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Odontograma;