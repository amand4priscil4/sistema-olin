import React, { useState, useEffect } from 'react';
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
  Download as DownloadIcon
} from '@mui/icons-material';
import api from '../service/api';

const VerCaso = ({ casoId, onVoltar }) => {
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
        return <ClockIcon sx={{ color: 'warning.main' }} />;
      case 'finalizado':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'arquivado':
        return <AlertCircleIcon sx={{ color: 'grey.500' }} />;
      default:
        return <ClockIcon sx={{ color: 'warning.main' }} />;
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!caso) {
    return (
      <Box textAlign="center" py={4}>
        <AlertCircleIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Caso não encontrado
        </Typography>
        <Button 
          variant="contained" 
          onClick={onVoltar}
          sx={{ mt: 2 }}
        >
          Voltar para Casos
        </Button>
      </Box>
    );
  }

  const tabs = [
    { label: 'Detalhes', icon: <EyeIcon /> },
    { label: 'Evidências', icon: <FileTextIcon /> },
    { label: 'Laudos', icon: <ClipboardListIcon /> },
    { label: 'Vítimas', icon: <UsersIcon /> },
    { label: 'Relatório', icon: <FileTextIcon /> }
  ];

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 3 }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" gutterBottom>
              {caso.titulo}
            </Typography>
            <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
              <Box display="flex" alignItems="center" gap={1}>
                {getStatusIcon(caso.status)}
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {caso.status}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarIcon fontSize="small" />
                <Typography variant="body2">
                  {formatDate(caso.createdAt)}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <UserIcon fontSize="small" />
                <Typography variant="body2">
                  {caso.peritoResponsavel?.name || 'Não informado'}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowLeftIcon />}
            onClick={onVoltar}
          >
            Voltar
          </Button>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Paper elevation={1} sx={{ p: 3 }}>
        {/* Detalhes Tab */}
        {activeTab === 0 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Detalhes do Caso</Typography>
              {canEditCase() && (
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                    onClick={() => editMode ? handleEditCaso() : setEditMode(true)}
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
                    >
                      Cancelar
                    </Button>
                  )}
                </Box>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Título
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    value={editData.titulo || ''}
                    onChange={(e) => setEditData({...editData, titulo: e.target.value})}
                  />
                ) : (
                  <Typography>{caso.titulo}</Typography>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Tipo
                </Typography>
                {editMode ? (
                  <FormControl fullWidth>
                    <Select
                      value={editData.tipo || ''}
                      onChange={(e) => setEditData({...editData, tipo: e.target.value})}
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
                  <Typography sx={{ textTransform: 'capitalize' }}>{caso.tipo}</Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Descrição
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={editData.descricao || ''}
                    onChange={(e) => setEditData({...editData, descricao: e.target.value})}
                  />
                ) : (
                  <Typography>{caso.descricao}</Typography>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Local do Caso
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    value={editData.localDoCaso || ''}
                    onChange={(e) => setEditData({...editData, localDoCaso: e.target.value})}
                  />
                ) : (
                  <Box display="flex" alignItems="center" gap={1}>
                    <MapPinIcon fontSize="small" color="action" />
                    <Typography>{caso.localDoCaso}</Typography>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Status
                </Typography>
                {editMode ? (
                  <FormControl fullWidth>
                    <Select
                      value={editData.status || ''}
                      onChange={(e) => setEditData({...editData, status: e.target.value})}
                    >
                      <MenuItem value="em andamento">Em andamento</MenuItem>
                      <MenuItem value="finalizado">Finalizado</MenuItem>
                      <MenuItem value="arquivado">Arquivado</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Box display="flex" alignItems="center" gap={1}>
                    {getStatusIcon(caso.status)}
                    <Typography sx={{ textTransform: 'capitalize' }}>{caso.status}</Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Evidências Tab */}
        {activeTab === 1 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Evidências</Typography>
              {canCreateEvidence() && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlusIcon />}
                  onClick={() => setShowEvidenciaModal(true)}
                >
                  Nova Evidência
                </Button>
              )}
            </Box>

            {evidencias.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                Nenhuma evidência cadastrada
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {evidencias.map((evidencia) => (
                  <Grid item xs={12} key={evidencia._id}>
                    <Card>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box flex={1}>
                            <Typography variant="h6" gutterBottom>
                              {evidencia.titulo}
                            </Typography>
                            <Typography color="text.secondary" paragraph>
                              {evidencia.descricao}
                            </Typography>
                            <Box mt={2}>
                              <Typography variant="body2" color="text.secondary">
                                Local: {evidencia.localColeta}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Data: {formatDate(evidencia.dataColeta)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Tipo: {evidencia.tipoArquivo}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Criado por: {evidencia.criadoPor?.name || 'Não informado'}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={evidencia.tipoArquivo} 
                            color="primary" 
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
            <Typography variant="h6" gutterBottom>
              Laudos das Evidências
            </Typography>
            {laudos.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                Nenhum laudo cadastrado
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {laudos.map((laudo) => (
                  <Grid item xs={12} key={laudo._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Laudo {laudo._id}
                        </Typography>
                        <Typography paragraph>
                          {laudo.texto}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Vítimas</Typography>
              {canCreateVictim() && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlusIcon />}
                  onClick={() => setShowVitimaModal(true)}
                >
                  Nova Vítima
                </Button>
              )}
            </Box>

            {vitimas.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                Nenhuma vítima cadastrada
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {vitimas.map((vitima) => (
                  <Grid item xs={12} key={vitima._id}>
                    <Card>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <Typography variant="h6">{vitima.nome}</Typography>
                            <Typography color="text.secondary">NIC: {vitima.nic}</Typography>
                            <Typography color="text.secondary">Idade: {vitima.idade} anos</Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography color="text.secondary">Gênero: {vitima.genero}</Typography>
                            <Typography color="text.secondary">
                              Documento: {vitima.documento?.tipo?.toUpperCase()} {vitima.documento?.numero}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography color="text.secondary">Cor/Etnia: {vitima.corEtnia}</Typography>
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Relatório Final</Typography>
              {!relatorio && canCreateReport() && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<PlusIcon />}
                  onClick={() => setShowRelatorioModal(true)}
                >
                  Criar Relatório Final
                </Button>
              )}
            </Box>

            {relatorio ? (
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {relatorio.titulo}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {relatorio.texto}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Criado em: {formatDate(relatorio.criadoEm)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Criado por: {relatorio.criadoPor?.name || 'Não informado'}
                  </Typography>
                  <Box mt={2}>
                    <Button 
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadPDF}
                    >
                      Baixar PDF
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Typography color="text.secondary" textAlign="center" py={4}>
                {caso.status === 'finalizado' 
                  ? 'Este caso já foi finalizado' 
                  : 'Nenhum relatório final criado'
                }
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      {/* Modal Nova Evidência */}
      <Dialog open={showEvidenciaModal} onClose={() => setShowEvidenciaModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Evidência</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Título *"
              value={novaEvidencia.titulo}
              onChange={(e) => setNovaEvidencia({...novaEvidencia, titulo: e.target.value})}
              margin="normal"
              required
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
            />
            
            <TextField
              fullWidth
              label="Local de Coleta *"
              value={novaEvidencia.localColeta}
              onChange={(e) => setNovaEvidencia({...novaEvidencia, localColeta: e.target.value})}
              margin="normal"
              required
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
            />
            
            <Button
              component="label"
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
            >
              Selecionar Arquivo *
              <input
                type="file"
                hidden
                onChange={(e) => setNovaEvidencia({...novaEvidencia, arquivo: e.target.files[0]})}
              />
            </Button>
            {novaEvidencia.arquivo && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Arquivo selecionado: {novaEvidencia.arquivo.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEvidenciaModal(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCriarEvidencia}
            variant="contained"
            disabled={!novaEvidencia.titulo || !novaEvidencia.descricao || !novaEvidencia.localColeta || !novaEvidencia.dataColeta || !novaEvidencia.arquivo}
          >
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Nova Vítima */}
      <Dialog open={showVitimaModal} onClose={() => setShowVitimaModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nova Vítima</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="NIC *"
                  value={novaVitima.nic}
                  onChange={(e) => setNovaVitima({...novaVitima, nic: e.target.value})}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome *"
                  value={novaVitima.nome}
                  onChange={(e) => setNovaVitima({...novaVitima, nome: e.target.value})}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Gênero</InputLabel>
                  <Select
                    value={novaVitima.genero}
                    onChange={(e) => setNovaVitima({...novaVitima, genero: e.target.value})}
                    label="Gênero"
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
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Cor/Etnia</InputLabel>
                  <Select
                    value={novaVitima.corEtnia}
                    onChange={(e) => setNovaVitima({...novaVitima, corEtnia: e.target.value})}
                    label="Cor/Etnia"
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
        <DialogActions>
          <Button onClick={() => setShowVitimaModal(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCriarVitima}
            variant="contained"
            disabled={!novaVitima.nic || !novaVitima.nome || !novaVitima.idade || !novaVitima.documento.numero}
          >
            Cadastrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Relatório Final */}
      <Dialog open={showRelatorioModal} onClose={() => setShowRelatorioModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Criar Relatório Final</DialogTitle>
        <DialogContent>
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
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRelatorioModal(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCriarRelatorio}
            variant="contained"
            color="error"
            disabled={!novoRelatorio.titulo || !novoRelatorio.texto}
          >
            Finalizar Caso
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VerCaso;