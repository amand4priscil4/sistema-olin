import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  Chip,
  Pagination,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormLabel,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { colors } from '../styles/colors';
import Layout from '../components/Layout';
import api from '../service/api';

function Casos() {
  const navigate = useNavigate();
  const [casos, setCasos] = useState([]);
  const [filteredCasos, setFilteredCasos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('todos');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [casoToDelete, setCasoToDelete] = useState(null);
  
  // Estados do Modal de Novo Caso
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    status: 'em andamento',
    peritoResponsavel: '',
    localDoCaso: ''
  });

  // Tipos de casos disponíveis na API
  const tiposCaso = [
    'acidente',
    'identificação de vítima',
    'exame criminal',
    'exumação',
    'violência doméstica',
    'avaliação de idade',
    'avaliação de lesões',
    'avaliação de danos corporais'
  ];

  const statusOptions = [
    'em andamento',
    'finalizado',
    'arquivado'
  ];

  // Recupera dados do usuário logado
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setFormData(prev => ({
          ...prev,
          peritoResponsavel: parsedUser.id
        }));
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        setError('Erro ao carregar dados do usuário');
      }
    }
  }, []);

  // Carrega casos da API
  const fetchCasos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/api/casos');
      let allCasos = response.data;

      if (user && user.id) {
        allCasos = allCasos.filter(caso => {
          // Admin vê todos os casos
          if (user.role === 'admin') return true;
          
          // Outros usuários veem apenas casos onde são responsáveis ou criadores
          return (
            caso.peritoResponsavel === user.id || 
            caso.peritoResponsavel?._id === user.id ||
            caso.criadoPor === user.id
          );
        });
      }

      setCasos(allCasos);
      setFilteredCasos(allCasos);
    } catch (error) {
      console.error('Erro ao carregar casos:', error);
      setError('Erro ao carregar casos. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  // Carrega casos quando usuário estiver disponível
  useEffect(() => {
    if (user) {
      fetchCasos();
    }
  }, [user]);

  // Filtros e busca
  useEffect(() => {
    let filtered = casos;

    if (searchTerm) {
      filtered = filtered.filter(caso =>
        caso.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caso.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caso._id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterOption !== 'todos') {
      filtered = filtered.filter(caso =>
        caso.status?.toLowerCase() === filterOption.toLowerCase()
      );
    }

    setFilteredCasos(filtered);
    setPage(1);
  }, [searchTerm, filterOption, casos]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterOption(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleNovoCaso = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({
      titulo: '',
      tipo: '',
      descricao: '',
      data: new Date().toISOString().split('T')[0],
      status: 'em andamento',
      peritoResponsavel: user?.id || '',
      localDoCaso: ''
    });
  };

  const handleFormChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmitCaso = async () => {
    try {
      setModalLoading(true);

      if (!formData.titulo || !formData.tipo || !formData.descricao || !formData.localDoCaso) {
        setSnackbar({
          open: true,
          message: 'Por favor, preencha todos os campos obrigatórios.',
          type: 'error'
        });
        return;
      }

      const response = await api.post('/api/casos', {
        titulo: formData.titulo,
        tipo: formData.tipo,
        descricao: formData.descricao,
        data: formData.data,
        status: formData.status,
        peritoResponsavel: formData.peritoResponsavel,
        localDoCaso: formData.localDoCaso
      });

      const novoCaso = response.data.caso || response.data;
      setCasos(prev => [novoCaso, ...prev]);
      handleCloseModal();
      setSnackbar({
        open: true,
        message: 'Caso criado com sucesso!',
        type: 'success'
      });

    } catch (error) {
      console.error('Erro ao criar caso:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao criar caso',
        type: 'error'
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewCaso = (caso) => {
    console.log('Navegando para visualizar caso:', caso._id);
    console.log('Objeto caso completo:', caso);
    
    // Verifica se o ID existe
    if (!caso._id) {
      console.error('ID do caso não encontrado!');
      return;
    }
    
    navigate(`/casos/ver/${caso._id}`);
  };

  const handleDeleteClick = (caso) => {
    setCasoToDelete(caso);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!casoToDelete) return;

    try {

      console.log('🗑️ Tentando deletar caso:', casoToDelete._id);
      console.log('🔗 URL completa:', `/api/casos/${casoToDelete._id}`);
    
      // Verificar se o token está presente
      const token = localStorage.getItem('token');
      console.log('🔑 Token presente:', !!token);

      await api.delete(`/api/casos/${casoToDelete._id}`);
      setCasos(prev => prev.filter(c => c._id !== casoToDelete._id));
      setDeleteDialogOpen(false);
      setCasoToDelete(null);
      
      setSnackbar({
        open: true,
        message: 'Caso deletado com sucesso!',
        type: 'success'
      });
    } catch (error) {
      console.error('Erro ao deletar caso:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao deletar caso',
        type: 'error'
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setCasoToDelete(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'em andamento':
        return '#C85A5A';  // Vermelho coral
      case 'finalizado':
        return '#5A7A6B';  // Verde teal
      case 'arquivado':
        return '#F0E1CE';  // Bege claro
      default:
        return '#C85A5A';  // Vermelho coral como padrão
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // Paginação
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCasos = filteredCasos.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredCasos.length / itemsPerPage);

  return (
    <Layout pageTitle="Gestão de Casos">
      <Box sx={{ 
        minHeight: '100vh',
        background: colors.background,
        overflowX: 'hidden',
        width: '100%' 
      }}>
        
        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Header Actions */}
        <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNovoCaso}
                sx={{
                  bgcolor: colors.steelBlue,               
                  color: 'white',                
                  '&:hover': {
                    bgcolor: colors.primary,            
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(75, 99, 130, 0.3)'
                  },
                  fontWeight: 600,
                  minWidth: 120,
                  borderRadius: 2,
                  transition: 'all 0.3s ease'
                }}
              >
                Novo
              </Button>
              
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={fetchCasos}
                disabled={loading}
                sx={{
                  bgcolor: colors.steelBlue,               
                  color: 'white',               
                  '&:hover': {
                    bgcolor: colors.primary,             
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(75, 99, 130, 0.3)'
                  },
                  fontWeight: 600,
                  minWidth: 120,
                  borderRadius: 2,
                  transition: 'all 0.3s ease'
                }}
              >
                Atualizar
              </Button>
            </Box>
          </Grid>
          
          {/* Campo de busca e filtro - mais compactos à direita */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
              <TextField
                placeholder="Pesquisar casos..."
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                sx={{
                  width: 280,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    '&:hover fieldset': {
                      borderColor: colors.secondary,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.primary,
                    },
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: colors.secondary, fontSize: '1.1rem' }} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={filterOption}
                  onChange={handleFilterChange}
                  displayEmpty
                  sx={{
                    bgcolor: 'white',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.secondary,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.primary,
                    }
                  }}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="em andamento">Em Andamento</MenuItem>
                  <MenuItem value="finalizado">Finalizados</MenuItem>
                  <MenuItem value="arquivado">Arquivados</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>

        {/* Loading or Table */}
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '60vh',
            flexDirection: 'column'
          }}>
            <CircularProgress size={50} sx={{ color: colors.primary, mb: 2 }} />
            <Typography sx={{ color: colors.secondary, fontSize: '1.1rem' }}>
              Carregando casos...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Table */}
            <Paper sx={{ 
              overflow: 'hidden',
              border: '1px solid rgba(164, 181, 196, 0.2)',
              boxShadow: '0 4px 24px rgba(7, 23, 57, 0.06)',
              borderRadius: 3
            }}>
              <TableContainer sx={{
                height: 'auto !important',
                maxHeight: 'none !important',
                overflow: 'visible !important'
              }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        bgcolor: colors.lightSlateGray, 
                        color: colors.primary, 
                        fontWeight: 600,
                        borderBottom: '2px solid rgba(164, 181, 196, 0.3)',
                        fontSize: '0.95rem'
                      }}>
                        Título
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: colors.lightSlateGray,
                        color: colors.primary, 
                        fontWeight: 600,
                        borderBottom: '2px solid rgba(164, 181, 196, 0.3)',
                        fontSize: '0.95rem'
                      }}>
                        Tipo
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: colors.lightSlateGray, 
                        color: colors.primary, 
                        fontWeight: 600,
                        borderBottom: '2px solid rgba(164, 181, 196, 0.3)',
                        fontSize: '0.95rem'
                      }}>
                        Data de Criação
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: colors.lightSlateGray,
                        color: colors.primary, 
                        fontWeight: 600,
                        borderBottom: '2px solid rgba(164, 181, 196, 0.3)',
                        fontSize: '0.95rem'
                      }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: colors.lightSlateGray,
                        color: colors.primary, 
                        fontWeight: 600,
                        borderBottom: '2px solid rgba(164, 181, 196, 0.3)',
                        fontSize: '0.95rem'
                      }}>
                        Local
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: colors.lightSlateGray,
                        color: colors.primary, 
                        fontWeight: 600,
                        borderBottom: '2px solid rgba(164, 181, 196, 0.3)',
                        width: 140,
                        fontSize: '0.95rem'
                      }}>
                        Ações
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedCasos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8 }}>
                          <Typography variant="h6" sx={{ color: colors.secondary, mb: 1 }}>
                            {filteredCasos.length === 0 && casos.length === 0 
                              ? 'Nenhum caso encontrado para este usuário' 
                              : 'Nenhum caso encontrado com os filtros aplicados'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.accent }}>
                            {casos.length === 0 ? 'Crie seu primeiro caso clicando no botão "Novo"' : 'Tente ajustar os filtros de busca'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedCasos.map((caso, index) => (
                        <TableRow 
                          key={caso._id}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: 'rgba(164, 181, 196, 0.08)',
                              transform: 'scale(1.001)',
                              transition: 'all 0.2s ease'
                            },
                            '&:nth-of-type(even)': {
                              bgcolor: 'rgba(205, 213, 219, 0.3)'
                            },
                            cursor: 'pointer'
                          }}
                        >
                          <TableCell sx={{ 
                            color: colors.primary, 
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            py: 2
                          }}>
                            {caso.titulo || 'Título não informado'}
                          </TableCell>
                          <TableCell sx={{ 
                            color: colors.secondary,
                            fontSize: '0.9rem',
                            py: 2
                          }}>
                            {caso.tipo || '-'}
                          </TableCell>
                          <TableCell sx={{ 
                            color: colors.secondary,
                            fontSize: '0.9rem',
                            py: 2
                          }}>
                            {formatDate(caso.createdAt || caso.data)}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              label={caso.status || 'Em andamento'}
                              size="small"
                              sx={{
                                bgcolor: getStatusColor(caso.status),
                                color: caso.status?.toLowerCase() === 'arquivado' ? '#333' : 'white',
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                minWidth: 90
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ 
                            color: colors.secondary,
                            fontSize: '0.9rem',
                            py: 2,
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {caso.localDoCaso || '-'}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Visualizar" arrow>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewCaso(caso);
                                  }}
                                  sx={{ 
                                    color: colors.secondary,
                                    '&:hover': { bgcolor: 'rgba(164, 181, 196, 0.15)' }
                                  }}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Excluir" arrow>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(caso);
                                  }}
                                  sx={{ 
                                    color: '#f44336',
                                    '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Footer with Pagination */}
            {filteredCasos.length > 0 && (
              <Paper sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mt: 2,
                p: 1,
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid rgba(164, 181, 196, 0.2)',
                boxShadow: '0 2px 12px rgba(7, 23, 57, 0.04)'
              }}>
                <Box>
                  <Typography variant="body2" sx={{ color: colors.secondary, fontSize: '0.95rem' }}>
                    Mostrando <strong>{startIndex + 1}</strong> a <strong>{Math.min(endIndex, filteredCasos.length)}</strong> de <strong>{filteredCasos.length}</strong> casos
                  </Typography>
                </Box>
                
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                  size="medium"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: colors.steelBlue,
                      fontSize: '0.75rem',
                      '&.Mui-selected': {
                        bgcolor: colors.steelBlue,
                        color: 'white',
                        '&:hover': {
                          bgcolor: colors.primary,
                        }
                      },
                      '&:hover': {
                        bgcolor: 'rgba(75, 99, 130, 0.15)',
                      }
                    }
                  }}
                />
              </Paper>
            )}
          </>
        )}

        {/* Modal de Novo Caso */}
        <Dialog
          open={modalOpen}
          onClose={handleCloseModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 24px 48px rgba(7, 23, 57, 0.15)',
              minHeight: '70vh',
              maxHeight: '85vh'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: colors.primary, 
            color: 'white', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 2
          }}>
            <Typography component="h2" variant="h6" sx={{ fontWeight: 600 }}>
              Criar Novo Caso
            </Typography>
            <IconButton 
              onClick={handleCloseModal}
              sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 4, overflow: 'auto' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Título */}
              <Box>
                <FormLabel sx={{ color: colors.primary, fontWeight: 600, mb: 1, display: 'block' }}>
                  Título do Caso *
                </FormLabel>
                <TextField
                  fullWidth
                  placeholder="Ex: Identificação de vítima de acidente..."
                  value={formData.titulo}
                  onChange={handleFormChange('titulo')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: colors.secondary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary }
                    }
                  }}
                />
              </Box>

              {/* Tipo */}
              <Box>
                <FormLabel sx={{ color: colors.primary, fontWeight: 600, mb: 1, display: 'block' }}>
                  Tipo de Caso *
                </FormLabel>
                <FormControl fullWidth>
                  <Select
                    value={formData.tipo}
                    onChange={handleFormChange('tipo')}
                    displayEmpty
                    sx={{
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }
                    }}
                  >
                    <MenuItem value="">Selecione o tipo</MenuItem>
                    {tiposCaso.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Status */}
              <Box>
                <FormLabel sx={{ color: colors.primary, fontWeight: 600, mb: 1, display: 'block' }}>
                  Status
                </FormLabel>
                <FormControl fullWidth>
                  <Select
                    value={formData.status}
                    onChange={handleFormChange('status')}
                    sx={{
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }
                    }}
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Data */}
              <Box>
                <FormLabel sx={{ color: colors.primary, fontWeight: 600, mb: 1, display: 'block' }}>
                  Data do Caso
                </FormLabel>
                <TextField
                  fullWidth
                  type="date"
                  value={formData.data}
                  onChange={handleFormChange('data')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: colors.secondary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary }
                    }
                  }}
                />
              </Box>

              {/* Local */}
              <Box>
                <FormLabel sx={{ color: colors.primary, fontWeight: 600, mb: 1, display: 'block' }}>
                  Local do Caso *
                </FormLabel>
                <TextField
                  fullWidth
                  placeholder="Ex: Rua das Flores, 123 - Centro"
                  value={formData.localDoCaso}
                  onChange={handleFormChange('localDoCaso')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: colors.secondary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary }
                    }
                  }}
                />
              </Box>

              {/* Descrição */}
              <Box>
                <FormLabel sx={{ color: colors.primary, fontWeight: 600, mb: 1, display: 'block' }}>
                  Descrição do Caso *
                </FormLabel>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Descreva detalhadamente o caso, circunstâncias, evidências encontradas..."
                  value={formData.descricao}
                  onChange={handleFormChange('descricao')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: colors.secondary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary }
                    }
                  }}
                />
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={handleCloseModal}
              sx={{ color: colors.secondary, minWidth: 100 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitCaso}
              variant="contained"
              disabled={modalLoading}
              sx={{
                bgcolor: colors.steelBlue,
                minWidth: 120,
                '&:hover': { bgcolor: colors.primary },
                '&:disabled': { bgcolor: '#ccc' }
              }}
            >
              {modalLoading ? <CircularProgress size={20} color="inherit" /> : 'Criar Caso'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title" sx={{ color: colors.primary }}>
            Confirmar Exclusão
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description" sx={{ color: colors.secondary }}>
              Tem certeza que deseja excluir o caso "{casoToDelete?.titulo}"? 
              Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} sx={{ color: colors.secondary }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmDelete} 
              variant="contained" 
              sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}
            >
              Excluir
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para notificações */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.type}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
}

export default Casos;