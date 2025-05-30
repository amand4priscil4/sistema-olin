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
  Divider,
  FormLabel
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
import { colors } from '../styles/colors';
import api from '../service/api';

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
        const responseLaudos = await api.get(`/api/laudos?casoId=${casoId}`);
        setLaudos(responseLaudos.data);
      } catch (error) {
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
      // Usar API Nominatim do OpenStreetMap para geocoding
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

  const handleCriarEvidencia = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('titulo', novaEvidencia.titulo);
      formData.append('descricao', novaEvidencia.descricao);
      formData.append('localColeta', novaEvidencia.localColeta);
      formData.append('dataColeta', novaEvidencia.dataColeta);
      formData.append('caso', casoId);
      
      if (novaEvidencia.arquivo) {
        formData.append('arquivo', novaEvidencia.arquivo);
      }

      const response = await api.post('/api/evidencias', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setShowEvidenciaModal(false);
      setNovaEvidencia({
        titulo: '',
        descricao: '',
        localColeta: '',
        dataColeta: '',
        arquivo: null
      });
      carregarDadosCaso();
      alert('Evidência criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar evidência:', error);
      alert('Erro ao criar evidência: ' + (error.response?.data?.message || error.message));
    }
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
          <AlertCircleIcon sx={{ fontSize: 64, color: '#f44336', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ color: colors.primary }}>
            Caso não encontrado
          </Typography>
          <Button 
            variant="contained"
            onClick={handleVoltar}
            sx={{
              mt: 2,
              bgcolor: colors.steelBlue,
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
        p: 1
      }}>
        
        {/* Header */}
        <Paper sx={{ 
          p: 2, 
          mb: 2,
          border: `1px solid ${colors.secondary}20`,
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
              Voltar
            </Button>
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ 
          mb: 2,
          border: `1px solid ${colors.secondary}20`,
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
          border: `1px solid ${colors.secondary}20`,
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
                        bgcolor: colors.steelBlue,
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
                {/* Campos: Informações Básicas */}
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

                <Grid item xs={12} sx={{ mt: 8 }}>
                  <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600, mb: 2 }}>
                    {/* espaço em branco visual */}
                  </Typography>
                </Grid>


                {/* Campos: Localização */}
                <Grid item xs={12} md={10}>
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
                        border: `1px solid ${colors.secondary}20`,
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
                        bgcolor: `${colors.lightSlateGray}10`,
                        borderRadius: 2,
                        border: `1px dashed ${colors.lightSlateGray}`
                      }}
                    >
                      <MapPinIcon sx={{ fontSize: 48, color: colors.lightSlateGray, mb: 1 }} />
                      <Typography variant="body1" sx={{ color: colors.secondary }}>
                        Nenhuma coordenada de localização cadastrada
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.lightSlateGray }}>
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
                  <ArchiveIcon sx={{ fontSize: 64, color: colors.lightSlateGray, mb: 2 }} />
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
                        border: `1px solid ${colors.lightSlateGray}40`,
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
                                    <strong>Local:</strong> {evidencia.localColeta}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                                    <strong>Data:</strong> {formatDate(evidencia.dataColeta)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                                    <strong>Tipo:</strong> {evidencia.tipoArquivo}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                                    <strong>Criado por:</strong> {evidencia.criadoPor?.name || 'Não informado'}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>
                            <Chip 
                              label={evidencia.tipoArquivo} 
                              sx={{
                                bgcolor: colors.accent,
                                color: 'white',
                                fontWeight: 500
                              }}
                              size="small" 
                            />
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
              <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                Laudos das Evidências ({laudos.length})
              </Typography>
              {laudos.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <ClipboardListIcon sx={{ fontSize: 64, color: colors.lightSlateGray, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: colors.primary, mb: 1 }}>
                    Nenhum laudo cadastrado
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                    Os laudos serão gerados automaticamente após análise das evidências
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {laudos.map((laudo) => (
                    <Grid item xs={12} key={laudo._id}>
                      <Card sx={{
                        border: `1px solid ${colors.lightSlateGray}40`,
                        boxShadow: `0 2px 8px ${colors.primary}05`,
                        borderRadius: 2
                      }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                            Laudo {laudo._id}
                          </Typography>
                          <Typography paragraph sx={{ color: colors.secondary }}>
                            {laudo.texto}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.lightSlateGray }}>
                            Criado em: {formatDate(laudo.criadoEm)}
                          </Typography>
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
                  <UsersIcon sx={{ fontSize: 64, color: colors.lightSlateGray, mb: 2 }} />
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
                        border: `1px solid ${colors.lightSlateGray}40`,
                        boxShadow: `0 2px 8px ${colors.primary}05`,
                        borderRadius: 2,
                        '&:hover': {
                          boxShadow: `0 4px 16px ${colors.primary}10`,
                          transform: 'translateY(-1px)',
                          transition: 'all 0.3s ease'
                        }
                      }}>
                        <CardContent>
                          <Grid container spacing={3}>
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
                  border: `1px solid ${colors.lightSlateGray}40`,
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
                        <Typography variant="body2" sx={{ color: colors.lightSlateGray }}>
                          <strong>Criado em:</strong> {formatDate(relatorio.criadoEm)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ color: colors.lightSlateGray }}>
                          <strong>Criado por:</strong> {relatorio.criadoPor?.name || 'Não informado'}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Button 
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadPDF}
                      sx={{
                        bgcolor: colors.steelBlue,
                        '&:hover': { bgcolor: colors.primary }
                      }}
                    >
                      Baixar PDF
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Box textAlign="center" py={8}>
                  <FileTextIcon sx={{ fontSize: 64, color: colors.lightSlateGray, mb: 2 }} />
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
                label="Título *"
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
                label="Descrição *"
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: colors.secondary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />
              
              <Button
                component="label"
                variant="outlined"
                fullWidth
                sx={{ 
                  mt: 2,
                  color: colors.primary,
                  borderColor: colors.primary,
                  '&:hover': { 
                    borderColor: colors.secondary,
                    bgcolor: `${colors.primary}05`
                  }
                }}
              >
                Selecionar Arquivo *
                <input
                  type="file"
                  hidden
                  onChange={(e) => setNovaEvidencia({...novaEvidencia, arquivo: e.target.files[0]})}
                />
              </Button>
              {novaEvidencia.arquivo && (
                <Typography variant="body2" sx={{ mt: 1, color: colors.secondary }}>
                  Arquivo selecionado: {novaEvidencia.arquivo.name}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setShowEvidenciaModal(false)}
              sx={{ color: colors.secondary }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCriarEvidencia}
              variant="contained"
              disabled={!novaEvidencia.titulo || !novaEvidencia.descricao || !novaEvidencia.localColeta || !novaEvidencia.dataColeta || !novaEvidencia.arquivo}
              sx={{
                bgcolor: colors.steelBlue,
                '&:hover': { bgcolor: colors.primary }
              }}
            >
              Criar
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
                bgcolor: colors.steelBlue,
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
      </Box>
    </Layout>
  );
};

export default VerCaso;