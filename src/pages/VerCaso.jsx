import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Tab,
  Tabs,
  Paper,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Visibility as EyeIcon,
  Description as FileTextIcon,
  People as UsersIcon,
  Assignment as ClipboardListIcon,
  Add as PlusIcon,
  CalendarToday as CalendarIcon,
  LocationOn as MapPinIcon,
  Person as UserIcon,
  Error as AlertCircleIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ClockIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as XIcon,
  ArrowBack as ArrowLeftIcon,
  Download as DownloadIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Layout from '../components/Layout';
import api, { uploadApi } from '../service/api';

// Nova paleta de cores neutras
const colors = {
  // Tons principais
  darkSlate: '#2F2F2F',         
  mediumGray: '#6B7280',        
  lightGray: '#9CA3AF',         
  paleGray: '#E5E7EB',          
  
  // Tons neutros para cards
  charcoal: '#374151',          
  steel: '#6B7280',             
  silver: '#9CA3AF',            
  pearl: '#F3F4F6',             
  
  // Aliases para facilitar uso
  primary: '#2F2F2F',           
  secondary: '#6B7280',         
  accent: '#DC3545',            
  background: '#F9FAFB',        
  surface: '#FFFFFF',           
  
  // Estados e feedback (mantém os existentes)
  success: '#4CAF50',
  error: '#F44336', 
  warning: '#FF9800',
  info: '#DC3545',              
  
  // Texto
  textPrimary: '#2F2F2F',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF'
};

// Fix para ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const VerCaso = () => {
  const { id: casoId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(0);
  const [caso, setCaso] = useState(null);
  const [evidencias, setEvidencias] = useState([]);
  const [laudos, setLaudos] = useState([]);
  const [vitimas, setVitimas] = useState([]);
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Estados para modais
  const [showEvidenciaModal, setShowEvidenciaModal] = useState(false);
  const [showVitimaModal, setShowVitimaModal] = useState(false);
  const [showRelatorioModal, setShowRelatorioModal] = useState(false);
  const [showLaudoModal, setShowLaudoModal] = useState(false);

  // Estados para formulários
  const [novaEvidencia, setNovaEvidencia] = useState({
    titulo: '',
    descricao: '',
    localColeta: '',
    dataColeta: '',
    arquivo: null
  });

  const [novaVitima, setNovaVitima] = useState({
    nic: '',
    nome: '',
    genero: 'masculino',
    idade: '',
    documento: { tipo: 'rg', numero: '' },
    endereco: {
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
    corEtnia: 'branca'
  });

  const [novoRelatorio, setNovoRelatorio] = useState({
    titulo: '',
    texto: ''
  });

  const [novoLaudo, setNovoLaudo] = useState({
    evidenciasSelecionadas: [],
    texto: ''
  });

  // Estado para evidência selecionada para laudo
  const [evidenciaParaLaudo, setEvidenciaParaLaudo] = useState(null);

  const handleVoltar = () => {
    navigate('/casos');
  };

  // Função para obter usuário atual do token
  const getCurrentUser = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    if (casoId) {
      carregarDadosCaso();
    }
  }, [casoId]);

  // Função para resetar formulário de evidência
  const resetFormularioEvidencia = () => {
    setNovaEvidencia({
      titulo: '',
      descricao: '',
      localColeta: '',
      dataColeta: '',
      arquivo: null
    });
  };

  // Função para resetar formulário de laudo
  const resetFormularioLaudo = () => {
    setNovoLaudo({
      evidenciasSelecionadas: [],
      texto: ''
    });
    setEvidenciaParaLaudo(null);
  };

  // Função para validar formulário de evidência
  const validarFormularioEvidencia = () => {
    const erros = [];
    
    if (!novaEvidencia.titulo.trim()) {
      erros.push('Título é obrigatório');
    }
    
    if (!novaEvidencia.descricao.trim()) {
      erros.push('Descrição é obrigatória');
    }
    
    if (!novaEvidencia.localColeta.trim()) {
      erros.push('Local de coleta é obrigatório');
    }
    
    if (!novaEvidencia.dataColeta) {
      erros.push('Data de coleta é obrigatória');
    }
    
    if (!novaEvidencia.arquivo) {
      erros.push('Arquivo é obrigatório');
    }
    
    // Validar se a data não é futura
    if (novaEvidencia.dataColeta) {
      const dataColeta = new Date(novaEvidencia.dataColeta);
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999);
      
      if (dataColeta > hoje) {
        erros.push('Data de coleta não pode ser no futuro');
      }
    }
    
    return erros;
  };

  // Função para validar formulário de laudo
  const validarFormularioLaudo = () => {
    const erros = [];
    
    if (!novoLaudo.texto.trim()) {
      erros.push('Texto do laudo é obrigatório');
    }
    
    if (novoLaudo.texto.trim().length < 50) {
      erros.push('Texto do laudo deve ter pelo menos 50 caracteres');
    }
    
    return erros;
  };

  // Função para carregar dados do caso
  const carregarDadosCaso = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do caso
      const responseCaso = await api.get(`/api/casos/${casoId}`);
      setCaso(responseCaso.data);
      setEditData(responseCaso.data);

      // Carregar evidências
      try {
        const responseEvidencias = await api.get(`/api/evidencias?casoId=${casoId}`);
        setEvidencias(responseEvidencias.data);
      } catch (error) {
        console.log('Nenhuma evidência encontrada para este caso');
        setEvidencias([]);
      }

      // Carregar vítimas
      try {
        const responseVitimas = await api.get(`/api/vitimas/caso/${casoId}`);
        setVitimas(responseVitimas.data);
      } catch (error) {
        console.log('Nenhuma vítima encontrada para este caso');
        setVitimas([]);
      }

      // Carregar relatório
      try {
        const responseRelatorio = await api.get(`/api/relatorios/${casoId}`);
        setRelatorio(responseRelatorio.data);
      } catch (error) {
        console.log('Nenhum relatório encontrado para este caso');
        setRelatorio(null);
      }

      // Carregar laudos
      try {
        console.log('🔍 Buscando laudos para caso:', casoId);
        
        // Tenta primeiro com query parameter
        let responseLaudos;
        try {
          responseLaudos = await api.get(`/api/laudos?casoId=${casoId}`);
        } catch (error) {
          console.log('❌ Tentativa 1 falhou, tentando URL alternativa...');
          // Se falhar, tenta com parâmetro na URL
          responseLaudos = await api.get(`/api/laudos/caso/${casoId}`);
        }
        
        console.log('✅ Laudos recebidos:', responseLaudos.data);
        setLaudos(responseLaudos.data);
      } catch (error) {
        console.error('❌ Erro ao buscar laudos:', error);
        console.error('❌ Status:', error.response?.status);
        console.error('❌ Dados:', error.response?.data);
        console.log('Nenhum laudo encontrado para este caso');
        setLaudos([]);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do caso:', error);
      alert('Erro ao carregar dados do caso');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCaso = async () => {
    try {
      const response = await api.put(`/api/casos/${casoId}`, editData);
      setCaso(response.data.caso || response.data);
      setEditMode(false);
      alert('Caso atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar caso:', error);
      alert('Erro ao atualizar caso: ' + (error.response?.data?.message || error.message));
    }
  };

  const buscarCoordenadas = async () => {
    const endereco = editData.localizacao?.endereco;
    if (!endereco) {
      alert('Por favor, informe um endereço primeiro.');
      return;
    }

    try {
      const query = encodeURIComponent(endereco);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=br`,
        {
          headers: {
            'User-Agent': 'Sistema-Forense-App'
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const longitude = parseFloat(result.lon);
        const latitude = parseFloat(result.lat);
        
        setEditData({
          ...editData,
          localizacao: {
            ...editData.localizacao,
            coordenadas: [longitude, latitude]
          }
        });
        
        alert('Coordenadas encontradas e preenchidas automaticamente!');
      } else {
        alert('Não foi possível encontrar coordenadas para este endereço. Tente um endereço mais específico.');
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
      alert('Erro ao buscar coordenadas. Verifique sua conexão e tente novamente.');
    }
  };

  // Função para criar evidência
  const handleCriarEvidencia = async (e) => {
    e.preventDefault();
    
    try {
      const erros = validarFormularioEvidencia();
      if (erros.length > 0) {
        alert('Erros encontrados:\n' + erros.join('\n'));
        return;
      }

      console.log('Iniciando criação de evidência...');

      const formData = new FormData();
      formData.append('titulo', novaEvidencia.titulo.trim());
      formData.append('descricao', novaEvidencia.descricao.trim());
      formData.append('localColeta', novaEvidencia.localColeta.trim());
      formData.append('dataColeta', novaEvidencia.dataColeta);
      formData.append('caso', casoId);
      formData.append('arquivo', novaEvidencia.arquivo);

      const response = await uploadApi.post('/api/evidencias', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      setShowEvidenciaModal(false);
      resetFormularioEvidencia();
      await carregarDadosCaso();
      alert('✅ Evidência criada com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao criar evidência:', error);
      
      let errorMessage = 'Erro desconhecido ao criar evidência';
      
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.erro || `Erro ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Erro de conexão com o servidor. Verifique sua internet.';
      } else {
        errorMessage = error.message;
      }
      
      alert('❌ Erro ao criar evidência:\n' + errorMessage);
    }
  };

  // Função para criar laudo
  const handleCriarLaudo = async (e) => {
    e.preventDefault();
    
    try {
      const erros = validarFormularioLaudo();
      if (erros.length > 0) {
        alert('Erros encontrados:\n' + erros.join('\n'));
        return;
      }

      console.log('Criando laudo com dados:', {
        caso: casoId,
        evidencias: novoLaudo.evidenciasSelecionadas,
        texto: novoLaudo.texto
      });

      const response = await api.post('/api/laudos', {
        caso: casoId,
        evidencias: novoLaudo.evidenciasSelecionadas,
        texto: novoLaudo.texto.trim()
      });

      console.log('✅ Laudo criado com sucesso:', response.data);

      setShowLaudoModal(false);
      resetFormularioLaudo();
      
      console.log('🔄 Recarregando dados do caso...');
      await carregarDadosCaso();
      
      alert('✅ Laudo criado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao criar laudo:', error);
      
      let errorMessage = 'Erro desconhecido ao criar laudo';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Erro ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Erro de conexão com o servidor. Verifique sua internet.';
      } else {
        errorMessage = error.message;
      }
      
      alert('❌ Erro ao criar laudo:\n' + errorMessage);
    }
  };

  // Função para criar laudo para evidência específica
  const handleCriarLaudoParaEvidencia = (evidencia) => {
    setEvidenciaParaLaudo(evidencia);
    setNovoLaudo({
      evidenciasSelecionadas: [evidencia._id],
      texto: `Laudo da evidência: ${evidencia.titulo}\n\nDescrição da evidência: ${evidencia.descricao}\n\nLocal de coleta: ${evidencia.localColeta}\nData de coleta: ${formatDate(evidencia.dataColeta)}\n\nAnálise técnica:\n`
    });
    setShowLaudoModal(true);
  };

  const handleCriarVitima = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/api/vitimas', {
        ...novaVitima,
        caso: casoId
      });

      setShowVitimaModal(false);
      setNovaVitima({
        nic: '',
        nome: '',
        genero: 'masculino',
        idade: '',
        documento: { tipo: 'rg', numero: '' },
        endereco: {
          logradouro: '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: ''
        },
        corEtnia: 'branca'
      });
      carregarDadosCaso();
      alert('Vítima cadastrada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar vítima:', error);
      alert('Erro ao cadastrar vítima: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCriarRelatorio = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post(`/api/relatorios/${casoId}`, novoRelatorio);

      setShowRelatorioModal(false);
      setNovoRelatorio({
        titulo: '',
        texto: ''
      });
      carregarDadosCaso();
      alert('Relatório final criado com sucesso! O caso foi finalizado.');
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
      alert('Erro ao criar relatório: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/api/relatorios/${casoId}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_caso_${casoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      alert('Erro ao baixar PDF');
    }
  };

  // Verificar permissões
  const canEditCase = () => {
    if (!currentUser || !caso) return false;
    
    if (currentUser.role === 'admin' && caso.status !== 'finalizado') {
      return true;
    }
    
    if (currentUser.role === 'perito' && 
        caso.criadoPor === currentUser.id && 
        caso.status !== 'finalizado') {
      return true;
    }
    
    return false;
  };

  const canCreateEvidence = () => {
    if (!currentUser) return false;
    return ['admin', 'perito', 'assistente'].includes(currentUser.role);
  };

  const canCreateVictim = () => {
    if (!currentUser) return false;
    return ['admin', 'perito'].includes(currentUser.role);
  };

  const canCreateLaudo = () => {
    if (!currentUser) return false;
    return ['admin', 'perito'].includes(currentUser.role);
  };

  const canCreateReport = () => {
    if (!currentUser || !caso) return false;
    
    if (!['admin', 'perito'].includes(currentUser.role)) {
      return false;
    }
    
    if (caso.status === 'finalizado') {
      return false;
    }
    
    if (currentUser.role === 'admin') {
      return true;
    }
    
    if (currentUser.role === 'perito' && caso.criadoPor === currentUser.id) {
      return true;
    }
    
    return false;
  };

  // MANTÉM AS CORES ORIGINAIS DOS STATUS
  const getStatusIcon = (status) => {
    switch (status) {
      case 'em andamento':
        return <ClockIcon sx={{ color: '#C85A5A' }} />;
      case 'finalizado':
        return <CheckCircleIcon sx={{ color: '#5A7A6B' }} />;
      case 'arquivado':
        return <AlertCircleIcon sx={{ color: '#F0E1CE' }} />;
      default:
        return <ClockIcon sx={{ color: '#C85A5A' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'em andamento':
        return '#C85A5A';
      case 'finalizado':
        return '#5A7A6B';
      case 'arquivado':
        return '#F0E1CE';
      default:
        return '#C85A5A';
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
            Carregando caso...
          </Typography>
        </Box>
      </Layout>
    );
  }

  if (!caso) {
    return (
      <Layout pageTitle="Caso não encontrado">
        <Box sx={{ 
          minHeight: '100vh',
          background: colors.background,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          p: 3
        }}>
          <AlertCircleIcon sx={{ fontSize: 64, color: colors.error, mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ color: colors.primary }}>
            Caso não encontrado
          </Typography>
          <Button 
            variant="contained"
            onClick={handleVoltar}
            sx={{
              mt: 2,
              bgcolor: colors.charcoal,
              '&:hover': { bgcolor: colors.primary }
            }}
          >
            Voltar para Casos
          </Button>
        </Box>
      </Layout>
    );
  }

  const tabs = [
    { label: 'Detalhes', icon: <EyeIcon /> },
    { label: 'Evidências', icon: <ArchiveIcon /> },
    { label: 'Laudos', icon: <ClipboardListIcon /> },
    { label: 'Vítimas', icon: <UsersIcon /> },
    { label: 'Relatório', icon: <FileTextIcon /> }
  ];

  return (
    <Layout pageTitle="Visualizar Caso">
      <Box sx={{ 
        minHeight: '100vh',
        background: colors.background,
        p: 3
      }}>
        
        {/* Header */}
        <Paper sx={{ 
          p: 3, 
          mb: 1,
          border: `1px solid ${colors.lightGray}30`,
          boxShadow: `0 4px 24px ${colors.primary}10`,
          borderRadius: 3
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
            <Box flex={1}>
              <Typography variant="h4" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                {caso.titulo}
              </Typography>
              <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                <Box display="flex" alignItems="center" gap={1}>
                  {getStatusIcon(caso.status)}
                  <Chip
                    label={caso.status}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(caso.status),
                      color: caso.status?.toLowerCase() === 'arquivado' ? '#333' : 'white',
                      fontWeight: 500,
                      textTransform: 'capitalize'
                    }}
                  />
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarIcon fontSize="small" sx={{ color: colors.secondary }} />
                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                    {formatDate(caso.createdAt)}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <UserIcon fontSize="small" sx={{ color: colors.secondary }} />
                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                    {caso.peritoResponsavel?.name || 'Não informado'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<ArrowLeftIcon />}
              onClick={handleVoltar}
              sx={{
                bgcolor: colors.charcoal,
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
              Voltar
            </Button>
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ 
          mb: 1,
          border: `1px solid ${colors.lightGray}30`,
          boxShadow: `0 2px 12px ${colors.primary}08`,
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: colors.secondary,
                '&.Mui-selected': {
                  color: colors.primary,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: colors.accent,
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
                sx={{ fontWeight: 500 }}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Paper sx={{ 
          p: 4,
          border: `1px solid ${colors.lightGray}30`,
          boxShadow: `0 4px 24px ${colors.primary}10`,
          borderRadius: 3,
          minHeight: '60vh'
        }}>
          {/* Detalhes Tab */}
          {activeTab === 0 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
                  Detalhes do Caso
                </Typography>
                {canEditCase() && (
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                      onClick={() => editMode ? handleEditCaso() : setEditMode(true)}
                      sx={{
                        bgcolor: colors.charcoal,
                        '&:hover': { bgcolor: colors.primary }
                      }}
                    >
                      {editMode ? 'Salvar' : 'Editar'}
                    </Button>
                    {editMode && (
                      <Button
                        variant="outlined"
                        startIcon={<XIcon />}
                        onClick={() => {
                          setEditMode(false);
                          setEditData(caso);
                        }}
                        sx={{
                          color: colors.secondary,
                          borderColor: colors.secondary,
                          '&:hover': { 
                            borderColor: colors.primary,
                            bgcolor: `${colors.secondary}10`
                          }
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                    Título
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      value={editData.titulo || ''}
                      onChange={(e) => setEditData({...editData, titulo: e.target.value})}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: colors.secondary },
                          '&.Mui-focused fieldset': { borderColor: colors.primary }
                        }
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: colors.secondary }}>{caso.titulo}</Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                    Tipo
                  </Typography>
                  {editMode ? (
                    <FormControl fullWidth>
                      <Select
                        value={editData.tipo || ''}
                        onChange={(e) => setEditData({...editData, tipo: e.target.value})}
                        sx={{
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }
                        }}
                      >
                        <MenuItem value="acidente">Acidente</MenuItem>
                        <MenuItem value="identificação de vítima">Identificação de vítima</MenuItem>
                        <MenuItem value="exame criminal">Exame criminal</MenuItem>
                        <MenuItem value="exumação">Exumação</MenuItem>
                        <MenuItem value="violência doméstica">Violência doméstica</MenuItem>
                        <MenuItem value="avaliação de idade">Avaliação de idade</MenuItem>
                        <MenuItem value="avaliação de lesões">Avaliação de lesões</MenuItem>
                        <MenuItem value="avaliação de danos corporais">Avaliação de danos corporais</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography sx={{ textTransform: 'capitalize', color: colors.secondary }}>
                      {caso.tipo}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                    Descrição
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={editData.descricao || ''}
                      onChange={(e) => setEditData({...editData, descricao: e.target.value})}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: colors.secondary },
                          '&.Mui-focused fieldset': { borderColor: colors.primary }
                        }
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: colors.secondary }}>{caso.descricao}</Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                    Data do Caso
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      type="date"
                      value={editData.data ? new Date(editData.data).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditData({...editData, data: e.target.value})}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: colors.secondary },
                          '&.Mui-focused fieldset': { borderColor: colors.primary }
                        }
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: colors.secondary }}>{formatDate(caso.data)}</Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                    Status
                  </Typography>
                  {editMode ? (
                    <FormControl fullWidth>
                      <Select
                        value={editData.status || ''}
                        onChange={(e) => setEditData({...editData, status: e.target.value})}
                        sx={{
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }
                        }}
                      >
                        <MenuItem value="em andamento">Em andamento</MenuItem>
                        <MenuItem value="finalizado">Finalizado</MenuItem>
                        <MenuItem value="arquivado">Arquivado</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <Box display="flex" alignItems="center" gap={1}>
                      {getStatusIcon(caso.status)}
                      <Chip
                        label={caso.status}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(caso.status),
                          color: caso.status?.toLowerCase() === 'arquivado' ? '#333' : 'white',
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                  )}
                </Grid>

                {/* Campos: Localização */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                    Local do Caso
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      value={editData.localDoCaso || ''}
                      onChange={(e) => setEditData({...editData, localDoCaso: e.target.value})}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: colors.secondary },
                          '&.Mui-focused fieldset': { borderColor: colors.primary }
                        }
                      }}
                    />
                  ) : (
                    <Box display="flex" alignItems="center" gap={1}>
                      <MapPinIcon fontSize="small" sx={{ color: colors.secondary }} />
                      <Typography sx={{ color: colors.secondary }}>{caso.localDoCaso}</Typography>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                    Endereço
                  </Typography>
                  {editMode ? (
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        value={editData.localizacao?.endereco || ''}
                        onChange={(e) => setEditData({
                          ...editData, 
                          localizacao: {...editData.localizacao, endereco: e.target.value}
                        })}
                        placeholder="Endereço completo com CEP"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: colors.secondary },
                            '&.Mui-focused fieldset': { borderColor: colors.primary }
                          }
                        }}
                      />
                      <Button
                        variant="outlined"
                        onClick={buscarCoordenadas}
                        sx={{
                          minWidth: 'auto',
                          px: 2,
                          color: colors.primary,
                          borderColor: colors.primary,
                          '&:hover': { 
                            borderColor: colors.secondary,
                            bgcolor: `${colors.primary}05`
                          }
                        }}
                      >
                        🔍
                      </Button>
                    </Box>
                  ) : (
                    <Typography sx={{ color: colors.secondary }}>
                      {caso.localizacao?.endereco || 'Não informado'}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                    Complemento
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      value={editData.localizacao?.complemento || ''}
                      onChange={(e) => setEditData({
                        ...editData, 
                        localizacao: {...editData.localizacao, complemento: e.target.value}
                      })}
                      placeholder="Complemento do endereço"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: colors.secondary },
                          '&.Mui-focused fieldset': { borderColor: colors.primary }
                        }
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: colors.secondary }}>
                      {caso.localizacao?.complemento || 'Não informado'}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                    Ponto de Referência
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      value={editData.localizacao?.referencia || ''}
                      onChange={(e) => setEditData({
                        ...editData, 
                        localizacao: {...editData.localizacao, referencia: e.target.value}
                      })}
                      placeholder="Ponto de referência"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: colors.secondary },
                          '&.Mui-focused fieldset': { borderColor: colors.primary }
                        }
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: colors.secondary }}>
                      {caso.localizacao?.referencia || 'Não informado'}
                    </Typography>
                  )}
                </Grid>

                {editMode && (
                  <>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                        Latitude
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        value={editData.localizacao?.coordenadas?.[1] || ''}
                        onChange={(e) => {
                          const newLat = parseFloat(e.target.value);
                          const currentLong = editData.localizacao?.coordenadas?.[0] || 0;
                          setEditData({
                            ...editData, 
                            localizacao: {
                              ...editData.localizacao, 
                              coordenadas: [currentLong, newLat]
                            }
                          });
                        }}
                        placeholder="Ex: -8.047562"
                        inputProps={{ step: "any", min: -90, max: 90 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: colors.secondary },
                            '&.Mui-focused fieldset': { borderColor: colors.primary }
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                        Longitude
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        value={editData.localizacao?.coordenadas?.[0] || ''}
                        onChange={(e) => {
                          const newLong = parseFloat(e.target.value);
                          const currentLat = editData.localizacao?.coordenadas?.[1] || 0;
                          setEditData({
                            ...editData, 
                            localizacao: {
                              ...editData.localizacao, 
                              coordenadas: [newLong, currentLat]
                            }
                          });
                        }}
                        placeholder="Ex: -34.877045"
                        inputProps={{ step: "any", min: -180, max: 180 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: colors.secondary },
                            '&.Mui-focused fieldset': { borderColor: colors.primary }
                          }
                        }}
                      />
                    </Grid>
                  </>
                )}

                {/* Mapa */}
                {caso.localizacao?.coordenadas && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                      Localização no Mapa
                    </Typography>
                    <Paper 
                      sx={{ 
                        height: 400, 
                        overflow: 'hidden',
                        border: `1px solid ${colors.lightGray}30`,
                        borderRadius: 2,
                        '& .leaflet-container': {
                          height: '100%',
                          width: '100%',
                          borderRadius: 2
                        }
                      }}
                    >
                      <MapContainer
                        center={[caso.localizacao.coordenadas[1], caso.localizacao.coordenadas[0]]}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[caso.localizacao.coordenadas[1], caso.localizacao.coordenadas[0]]}>
                          <Popup>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {caso.titulo}
                              </Typography>
                              <Typography variant="body2">
                                {caso.localDoCaso}
                              </Typography>
                              {caso.localizacao?.endereco && (
                                <Typography variant="body2">
                                  {caso.localizacao.endereco}
                                </Typography>
                              )}
                            </Box>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </Paper>
                    <Box mt={1} display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <Typography variant="body2" sx={{ color: colors.secondary }}>
                        <strong>Coordenadas:</strong> {caso.localizacao.coordenadas[1]}, {caso.localizacao.coordenadas[0]}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          const url = `https://www.google.com/maps?q=${caso.localizacao.coordenadas[1]},${caso.localizacao.coordenadas[0]}`;
                          window.open(url, '_blank');
                        }}
                        sx={{
                          color: colors.primary,
                          borderColor: colors.primary,
                          '&:hover': { 
                            borderColor: colors.secondary,
                            bgcolor: `${colors.primary}05`
                          }
                        }}
                      >
                        Ver no Google Maps
                      </Button>
                    </Box>
                  </Grid>
                )}

                {!caso.localizacao?.coordenadas && (
                  <Grid item xs={12}>
                    <Box 
                      sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        bgcolor: `${colors.lightGray}10`,
                        borderRadius: 2,
                        border: `1px dashed ${colors.lightGray}`
                      }}
                    >
                      <MapPinIcon sx={{ fontSize: 48, color: colors.lightGray, mb: 1 }} />
                      <Typography variant="body1" sx={{ color: colors.secondary }}>
                        Nenhuma coordenada de localização cadastrada
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.lightGray }}>
                        {editMode ? 'Informe o endereço e clique no botão 🔍 para buscar coordenadas automaticamente' : 'Entre no modo de edição para adicionar coordenadas'}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* Evidências Tab */}
          {activeTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
                  Evidências ({evidencias.length})
                </Typography>
                {canCreateEvidence() && (
                  <Button
                    variant="contained"
                    startIcon={<PlusIcon />}
                    onClick={() => setShowEvidenciaModal(true)}
                    sx={{
                      bgcolor: '#4CAF50',
                      '&:hover': { 
                        bgcolor: '#45a049',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Nova Evidência
                  </Button>
                )}
              </Box>

              {evidencias.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <ArchiveIcon sx={{ fontSize: 64, color: colors.lightGray, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: colors.primary, mb: 1 }}>
                    Nenhuma evidência cadastrada
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                    {canCreateEvidence() ? 'Clique em "Nova Evidência" para adicionar a primeira evidência' : 'Aguardando evidências serem cadastradas'}
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {evidencias.map((evidencia) => (
                    <Grid item xs={12} key={evidencia._id}>
                      <Card sx={{
                        border: `1px solid ${colors.lightGray}40`,
                        boxShadow: `0 2px 8px ${colors.primary}05`,
                        borderRadius: 2,
                        '&:hover': {
                          boxShadow: `0 4px 16px ${colors.primary}10`,
                          transform: 'translateY(-1px)',
                          transition: 'all 0.3s ease'
                        }
                      }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                            <Box flex={1}>
                              <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                                {evidencia.titulo}
                              </Typography>
                              <Typography sx={{ color: colors.secondary, mb: 2 }}>
                                {evidencia.descricao}
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                                    <strong>Local de Coleta:</strong> {evidencia.localColeta}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                                    <strong>Data de Coleta:</strong> {formatDate(evidencia.dataColeta)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                                    <strong>Tipo de Arquivo:</strong> {evidencia.tipoArquivo}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                                    <strong>Criado por:</strong> {evidencia.criadoPor?.name || 'Não informado'} ({evidencia.criadoPor?.perfil || 'Perfil não informado'})
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                                    <strong>Arquivo:</strong> {evidencia.arquivo || 'Arquivo não disponível'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                                    <strong>Criado em:</strong> {formatDate(evidencia.criadoEm)}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>
                            <Box display="flex" flexDirection="column" gap={1}>
                              <Chip 
                                label={evidencia.tipoArquivo} 
                                sx={{
                                  bgcolor: evidencia.tipoArquivo === 'imagem' ? '#4CAF50' : '#2196F3',
                                  color: 'white',
                                  fontWeight: 500
                                }}
                                size="small" 
                              />
                              <Chip 
                                label={evidencia.criadoPor?.perfil || 'Perfil não informado'} 
                                sx={{
                                  bgcolor: colors.accent,
                                  color: 'white',
                                  fontWeight: 500
                                }}
                                size="small" 
                              />
                              {canCreateLaudo() && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<ClipboardListIcon />}
                                  onClick={() => handleCriarLaudoParaEvidencia(evidencia)}
                                  sx={{
                                    color: colors.primary,
                                    borderColor: colors.primary,
                                    fontSize: '0.75rem',
                                    py: 0.5,
                                    '&:hover': { 
                                      borderColor: colors.secondary,
                                      bgcolor: `${colors.primary}05`
                                    },
                                    mt: 1
                                  }}
                                >
                                  Laudo
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Laudos Tab */}
          {activeTab === 2 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
                  Laudos Técnicos ({laudos.length})
                </Typography>
                {canCreateLaudo() && evidencias.length > 0 && (
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Button
                      variant="contained"
                      startIcon={<PlusIcon />}
                      onClick={() => setShowLaudoModal(true)}
                      sx={{
                        bgcolor: '#2196F3',
                        '&:hover': { 
                          bgcolor: '#1976D2',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Novo Laudo
                    </Button>
                  </Box>
                )}
              </Box>

              {canCreateLaudo() && evidencias.length > 0 && laudos.length === 0 && (
                <Box sx={{ mb: 3, p: 2, bgcolor: `${colors.primary}05`, borderRadius: 2, border: `1px solid ${colors.primary}20` }}>
                  <Typography variant="subtitle2" sx={{ color: colors.primary, fontWeight: 600, mb: 1 }}>
                    💡 Como criar laudos:
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                    • Use o botão "Novo Laudo" acima para criar um laudo selecionando múltiplas evidências
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                    • Ou vá na aba "Evidências" e clique em "Criar Laudo" em uma evidência específica
                  </Typography>
                </Box>
              )}

              {laudos.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <ClipboardListIcon sx={{ fontSize: 64, color: colors.lightGray, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: colors.primary, mb: 1 }}>
                    Nenhum laudo cadastrado
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                    {canCreateLaudo() && evidencias.length > 0 
                      ? 'Clique em "Novo Laudo" para criar seu primeiro laudo técnico'
                      : evidencias.length === 0 
                        ? 'Cadastre evidências primeiro para poder criar laudos'
                        : 'Aguardando laudos serem criados por peritos'
                    }
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {laudos.map((laudo) => (
                    <Grid item xs={12} key={laudo._id}>
                      <Card sx={{
                        border: `1px solid ${colors.lightGray}40`,
                        boxShadow: `0 2px 8px ${colors.primary}05`,
                        borderRadius: 2,
                        '&:hover': {
                          boxShadow: `0 4px 16px ${colors.primary}10`,
                          transform: 'translateY(-1px)',
                          transition: 'all 0.3s ease'
                        }
                      }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
                              Laudo Técnico #{laudo._id.slice(-6).toUpperCase()}
                            </Typography>
                            <Chip 
                              label={`${laudo.evidencias?.length || 0} evidência(s)`}
                              sx={{
                                bgcolor: '#FF9800',
                                color: 'white',
                                fontWeight: 500
                              }}
                              size="small" 
                            />
                          </Box>

                          {laudo.evidencias && laudo.evidencias.length > 0 && (
                            <Box mb={2}>
                              <Typography variant="subtitle2" sx={{ color: colors.primary, fontWeight: 600, mb: 1 }}>
                                Evidências Analisadas:
                              </Typography>
                              <Box display="flex" gap={1} flexWrap="wrap">
                                {laudo.evidencias.map((evidencia) => (
                                  <Chip
                                    key={evidencia._id}
                                    label={evidencia.titulo}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                      borderColor: colors.secondary,
                                      color: colors.secondary,
                                      '&:hover': {
                                        borderColor: colors.primary,
                                        bgcolor: `${colors.primary}05`
                                      }
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}

                          <Typography 
                            component="div"
                            sx={{ 
                              color: colors.secondary,
                              mb: 2,
                              whiteSpace: 'pre-wrap',
                              lineHeight: 1.6,
                              bgcolor: `${colors.lightGray}05`,
                              p: 2,
                              borderRadius: 1,
                              border: `1px solid ${colors.lightGray}20`
                            }}
                          >
                            {laudo.texto}
                          </Typography>

                          <Divider sx={{ my: 2 }} />
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" sx={{ color: colors.textDisabled }}>
                                <strong>Autor:</strong> {laudo.autor?.name || 'Não informado'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" sx={{ color: colors.textDisabled }}>
                                <strong>Criado em:</strong> {formatDate(laudo.criadoEm)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

         {/* Vítimas Tab */}
          {activeTab === 3 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
                  Vítimas ({vitimas.length})
                </Typography>
                {canCreateVictim() && (
                  <Button
                    variant="contained"
                    startIcon={<PlusIcon />}
                    onClick={() => setShowVitimaModal(true)}
                    sx={{
                      bgcolor: '#4CAF50',
                      '&:hover': { 
                        bgcolor: '#45a049',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Nova Vítima
                  </Button>
                )}
              </Box>

              {vitimas.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <UsersIcon sx={{ fontSize: 64, color: colors.lightGray, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: colors.primary, mb: 1 }}>
                    Nenhuma vítima cadastrada
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                    {canCreateVictim() ? 'Clique em "Nova Vítima" para cadastrar a primeira vítima' : 'Aguardando vítimas serem cadastradas'}
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {vitimas.map((vitima) => (
                    <Grid item xs={12} key={vitima._id}>
                      <Card sx={{
                        border: `1px solid ${colors.lightGray}40`,
                        boxShadow: `0 2px 8px ${colors.primary}05`,
                        borderRadius: 2,
                        '&:hover': {
                          boxShadow: `0 4px 16px ${colors.primary}10`,
                          transform: 'translateY(-1px)',
                          transition: 'all 0.3s ease'
                        }
                      }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                            <Grid container spacing={3} sx={{ flex: 1 }}>
                              <Grid item xs={12} md={4}>
                                <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
                                  {vitima.nome}
                                </Typography>
                                <Typography sx={{ color: colors.secondary }}>
                                  <strong>NIC:</strong> {vitima.nic}
                                </Typography>
                                <Typography sx={{ color: colors.secondary }}>
                                  <strong>Idade:</strong> {vitima.idade} anos
                                </Typography>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Typography sx={{ color: colors.secondary }}>
                                  <strong>Gênero:</strong> {vitima.genero}
                                </Typography>
                                <Typography sx={{ color: colors.secondary }}>
                                  <strong>Documento:</strong> {vitima.documento?.tipo?.toUpperCase()} {vitima.documento?.numero}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Typography sx={{ color: colors.secondary }}>
                                  <strong>Cor/Etnia:</strong> {vitima.corEtnia}
                                </Typography>
                              </Grid>
                            </Grid>
                            
                            {/* Botões de ação */}
                            <Box display="flex" flexDirection="column" gap={1} sx={{ minWidth: 120 }}>
                              {/* Botão Odontograma */}
                              {canCreateVictim() && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<EyeIcon />}
                                  onClick={() => navigate(`/vitimas/${vitima._id}/odontograma`)}
                                  sx={{
                                    bgcolor: '#2196F3',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    py: 0.8,
                                    '&:hover': { 
                                      bgcolor: '#1976D2',
                                      transform: 'translateY(-1px)',
                                      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  Odontograma
                                </Button>
                              )}
                              
                              {/* Indicadores de status - MANTÉM CORES ORIGINAIS */}
                              <Box display="flex" flexDirection="column" gap={0.5}>
                                <Chip 
                                  label={vitima.genero} 
                                  sx={{
                                    bgcolor: vitima.genero === 'masculino' ? '#2196F3' : vitima.genero === 'feminino' ? '#E91E63' : '#9C27B0',
                                    color: 'white',
                                    fontWeight: 500,
                                    fontSize: '0.7rem'
                                  }}
                                  size="small" 
                                />
                                <Chip 
                                  label={`${vitima.idade} anos`} 
                                  sx={{
                                    bgcolor: colors.accent,
                                    color: 'white',
                                    fontWeight: 500,
                                    fontSize: '0.7rem'
                                  }}
                                  size="small" 
                                />
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Relatório Tab */}
          {activeTab === 4 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
                  Relatório Final
                </Typography>
                {!relatorio && canCreateReport() && (
                  <Button
                    variant="contained"
                    startIcon={<PlusIcon />}
                    onClick={() => setShowRelatorioModal(true)}
                    sx={{
                      bgcolor: '#f44336',
                      '&:hover': { 
                        bgcolor: '#d32f2f',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Criar Relatório Final
                  </Button>
                )}
              </Box>

              {relatorio ? (
                <Card sx={{
                  border: `1px solid ${colors.lightGray}40`,
                  boxShadow: `0 2px 8px ${colors.primary}05`,
                  borderRadius: 2
                }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                      {relatorio.titulo}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography 
                      component="pre" 
                      sx={{ 
                        whiteSpace: 'pre-wrap', 
                        fontFamily: 'inherit',
                        color: colors.secondary,
                        lineHeight: 1.6
                      }}
                    >
                      {relatorio.texto}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ color: colors.textDisabled }}>
                          <strong>Criado em:</strong> {formatDate(relatorio.criadoEm)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ color: colors.textDisabled }}>
                          <strong>Criado por:</strong> {relatorio.criadoPor?.name || 'Não informado'}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Button 
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadPDF}
                      sx={{
                        bgcolor: colors.charcoal,
                        '&:hover': { bgcolor: colors.primary }
                      }}
                    >
                      Baixar PDF
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Box textAlign="center" py={8}>
                  <FileTextIcon sx={{ fontSize: 64, color: colors.lightGray, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: colors.primary, mb: 1 }}>
                    {caso.status === 'finalizado' 
                      ? 'Este caso já foi finalizado' 
                      : 'Nenhum relatório final criado'
                    }
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                    {caso.status === 'finalizado' 
                      ? 'O relatório final deve estar disponível para download'
                      : canCreateReport() ? 'Clique em "Criar Relatório Final" para finalizar o caso' : 'Aguardando criação do relatório final'
                    }
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>

        {/* Modais mantendo estilo com nova paleta */}
        {/* Modal Nova Evidência */}
        <Dialog 
          open={showEvidenciaModal} 
          onClose={() => setShowEvidenciaModal(false)} 
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
            Nova Evidência
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box component="form" sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Título da Evidência *"
                value={novaEvidencia.titulo}
                onChange={(e) => setNovaEvidencia({...novaEvidencia, titulo: e.target.value})}
                margin="normal"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: colors.secondary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Descrição da Evidência *"
                multiline
                rows={3}
                value={novaEvidencia.descricao}
                onChange={(e) => setNovaEvidencia({...novaEvidencia, descricao: e.target.value})}
                margin="normal"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: colors.secondary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Local de Coleta *"
                value={novaEvidencia.localColeta}
                onChange={(e) => setNovaEvidencia({...novaEvidencia, localColeta: e.target.value})}
                margin="normal"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: colors.secondary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Data de Coleta *"
                type="date"
                value={novaEvidencia.dataColeta}
                onChange={(e) => setNovaEvidencia({...novaEvidencia, dataColeta: e.target.value})}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
                inputProps={{
                  max: new Date().toISOString().split('T')[0]
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: colors.secondary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, color: colors.primary, fontWeight: 600 }}>
                  Arquivo da Evidência *
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  fullWidth
                  sx={{ 
                    py: 2,
                    color: colors.primary,
                    borderColor: colors.primary,
                    borderStyle: 'dashed',
                    '&:hover': { 
                      borderColor: colors.secondary,
                      bgcolor: `${colors.primary}05`,
                      borderStyle: 'dashed'
                    }
                  }}
                >
                  {novaEvidencia.arquivo ? 
                    `📎 ${novaEvidencia.arquivo.name}` : 
                    '📁 Clique para selecionar arquivo'
                  }
                  <input
                    type="file"
                    hidden
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          alert('Arquivo muito grande. Máximo 10MB permitido.');
                          return;
                        }
                        setNovaEvidencia({...novaEvidencia, arquivo: file});
                      }
                    }}
                  />
                </Button>
                {novaEvidencia.arquivo && (
                  <Box sx={{ mt: 1, p: 2, bgcolor: `${colors.lightGray}10`, borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: colors.secondary }}>
                      <strong>Arquivo:</strong> {novaEvidencia.arquivo.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textDisabled }}>
                      <strong>Tamanho:</strong> {(novaEvidencia.arquivo.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => {
                setShowEvidenciaModal(false);
                resetFormularioEvidencia();
              }}
              sx={{ color: colors.secondary }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCriarEvidencia}
              variant="contained"
              disabled={!novaEvidencia.titulo || !novaEvidencia.descricao || !novaEvidencia.localColeta || !novaEvidencia.dataColeta || !novaEvidencia.arquivo}
              sx={{
                bgcolor: colors.charcoal,
                '&:hover': { bgcolor: colors.primary }
              }}
            >
              Criar Evidência
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal Nova Vítima */}
        <Dialog 
          open={showVitimaModal} 
          onClose={() => setShowVitimaModal(false)} 
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
            bgcolor: colors.primary, 
            color: 'white',
            fontWeight: 600
          }}>
            Nova Vítima
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box component="form" sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="NIC *"
                    value={novaVitima.nic}
                    onChange={(e) => setNovaVitima({...novaVitima, nic: e.target.value})}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: colors.secondary },
                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome *"
                    value={novaVitima.nome}
                    onChange={(e) => setNovaVitima({...novaVitima, nome: e.target.value})}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: colors.secondary },
                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gênero</InputLabel>
                    <Select
                      value={novaVitima.genero}
                      onChange={(e) => setNovaVitima({...novaVitima, genero: e.target.value})}
                      label="Gênero"
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }
                      }}
                    >
                      <MenuItem value="masculino">Masculino</MenuItem>
                      <MenuItem value="feminino">Feminino</MenuItem>
                      <MenuItem value="outro">Outro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Idade *"
                    type="number"
                    value={novaVitima.idade}
                    onChange={(e) => setNovaVitima({...novaVitima, idade: e.target.value})}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: colors.secondary },
                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Documento</InputLabel>
                    <Select
                      value={novaVitima.documento.tipo}
                      onChange={(e) => setNovaVitima({
                        ...novaVitima, 
                        documento: {...novaVitima.documento, tipo: e.target.value}
                      })}
                      label="Tipo de Documento"
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }
                      }}
                    >
                      <MenuItem value="rg">RG</MenuItem>
                      <MenuItem value="cpf">CPF</MenuItem>
                      <MenuItem value="passaporte">Passaporte</MenuItem>
                      <MenuItem value="outro">Outro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Número do Documento *"
                    value={novaVitima.documento.numero}
                    onChange={(e) => setNovaVitima({
                      ...novaVitima, 
                      documento: {...novaVitima.documento, numero: e.target.value}
                    })}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: colors.secondary },
                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Cor/Etnia</InputLabel>
                    <Select
                      value={novaVitima.corEtnia}
                      onChange={(e) => setNovaVitima({...novaVitima, corEtnia: e.target.value})}
                      label="Cor/Etnia"
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }
                      }}
                    >
                      <MenuItem value="branca">Branca</MenuItem>
                      <MenuItem value="preta">Preta</MenuItem>
                      <MenuItem value="parda">Parda</MenuItem>
                      <MenuItem value="amarela">Amarela</MenuItem>
                      <MenuItem value="indígena">Indígena</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setShowVitimaModal(false)}
              sx={{ color: colors.secondary }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCriarVitima}
              variant="contained"
              disabled={!novaVitima.nic || !novaVitima.nome || !novaVitima.idade || !novaVitima.documento.numero}
              sx={{
                bgcolor: colors.charcoal,
                '&:hover': { bgcolor: colors.primary }
              }}
            >
              Cadastrar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal Relatório Final */}
        <Dialog 
          open={showRelatorioModal} 
          onClose={() => setShowRelatorioModal(false)} 
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
            bgcolor: colors.primary, 
            color: 'white',
            fontWeight: 600
          }}>
            Criar Relatório Final
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Atenção:</strong> Ao criar o relatório final, o status do caso será alterado para "Finalizado" 
              e não será mais possível editar o caso.
            </Alert>
            <Box component="form" sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Título do Relatório *"
                value={novoRelatorio.titulo}
                onChange={(e) => setNovoRelatorio({...novoRelatorio, titulo: e.target.value})}
                margin="normal"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: colors.secondary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Conteúdo do Relatório *"
                multiline
                rows={10}
                value={novoRelatorio.texto}
                onChange={(e) => setNovoRelatorio({...novoRelatorio, texto: e.target.value})}
                margin="normal"
                placeholder="Digite o conteúdo do relatório final..."
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: colors.secondary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setShowRelatorioModal(false)}
              sx={{ color: colors.secondary }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCriarRelatorio}
              variant="contained"
              color="error"
              disabled={!novoRelatorio.titulo || !novoRelatorio.texto}
              sx={{
                bgcolor: '#f44336',
                '&:hover': { bgcolor: '#d32f2f' }
              }}
            >
              Finalizar Caso
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal Laudo */}
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
            bgcolor: colors.primary, 
            color: 'white',
            fontWeight: 600
          }}>
            {evidenciaParaLaudo ? `Criar Laudo - ${evidenciaParaLaudo.titulo}` : 'Novo Laudo Técnico'}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box component="form" sx={{ mt: 1 }}>
              {!evidenciaParaLaudo && (
                <Box mb={3}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                    Evidências a serem analisadas *
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto', border: `1px solid ${colors.lightGray}40`, borderRadius: 1, p: 1 }}>
                    {evidencias.map((evidencia) => (
                      <Box
                        key={evidencia._id}
                        sx={{
                          p: 1,
                          mb: 1,
                          borderRadius: 1,
                          border: `1px solid ${colors.lightGray}20`,
                          cursor: 'pointer',
                          bgcolor: novoLaudo.evidenciasSelecionadas.includes(evidencia._id) ? `${colors.primary}10` : 'transparent',
                          '&:hover': {
                            bgcolor: `${colors.primary}05`
                          }
                        }}
                        onClick={() => {
                          const isSelected = novoLaudo.evidenciasSelecionadas.includes(evidencia._id);
                          const newSelection = isSelected
                            ? novoLaudo.evidenciasSelecionadas.filter(id => id !== evidencia._id)
                            : [...novoLaudo.evidenciasSelecionadas, evidencia._id];
                          
                          setNovoLaudo({...novoLaudo, evidenciasSelecionadas: newSelection});
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              border: `2px solid ${colors.primary}`,
                              bgcolor: novoLaudo.evidenciasSelecionadas.includes(evidencia._id) ? colors.primary : 'transparent'
                            }}
                          />
                          <Box flex={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.primary }}>
                              {evidencia.titulo}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.secondary }}>
                              {evidencia.tipoArquivo} - {formatDate(evidencia.dataColeta)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              <TextField
                fullWidth
                label="Texto do Laudo Técnico *"
                multiline
                rows={evidenciaParaLaudo ? 15 : 12}
                value={novoLaudo.texto}
                onChange={(e) => setNovoLaudo({...novoLaudo, texto: e.target.value})}
                placeholder="Digite a análise técnica detalhada das evidências..."
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: colors.secondary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />
              
              <Typography variant="caption" sx={{ color: colors.textDisabled, mt: 1, display: 'block' }}>
                Mínimo 50 caracteres. Atual: {novoLaudo.texto.length} caracteres
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => {
                setShowLaudoModal(false);
                resetFormularioLaudo();
              }}
              sx={{ color: colors.secondary }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCriarLaudo}
              variant="contained"
              disabled={
                !novoLaudo.texto.trim() || 
                novoLaudo.texto.length < 50 || 
                (!evidenciaParaLaudo && novoLaudo.evidenciasSelecionadas.length === 0)
              }
              sx={{
                bgcolor: colors.charcoal,
                '&:hover': { bgcolor: colors.primary }
              }}
            >
              Criar Laudo
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default VerCaso;