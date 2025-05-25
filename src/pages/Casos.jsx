// src/pages/Casos.jsx
import { useState, useEffect } from 'react';
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
  DialogTitle
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { casesApi } from '../service/api';

function Casos() {
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

  // Recupera dados do usuário logado
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
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
      
      const response = await casesApi.casos.getAll();
      let allCasos = response.data;

      // Filtra casos pelo usuário logado (perito responsável)
      if (user && user.id) {
        allCasos = allCasos.filter(caso => 
          caso.peritoResponsavel === user.id || 
          caso.peritoResponsavel?._id === user.id ||
          caso.criadoPor === user.id
        );
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

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(caso =>
        caso.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caso.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caso._id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (filterOption !== 'todos') {
      filtered = filtered.filter(caso =>
        caso.status?.toLowerCase() === filterOption.toLowerCase()
      );
    }

    setFilteredCasos(filtered);
    setPage(1); // Reset page when filtering
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
    // Implementar modal ou navegação para criar novo caso
    console.log('Criar novo caso');
    // Você pode adicionar navegação para uma página de criação ou abrir um modal
  };

  const handleViewCaso = (caso) => {
    console.log('Visualizar caso:', caso);
    // Implementar visualização do caso
  };

  const handleEditCaso = (caso) => {
    console.log('Editar caso:', caso);
    // Implementar edição do caso
  };

  const handleDeleteClick = (caso) => {
    setCasoToDelete(caso);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!casoToDelete) return;

    try {
      await casesApi.casos.delete(casoToDelete._id);
      
      // Remove o caso da lista local
      setCasos(prev => prev.filter(c => c._id !== casoToDelete._id));
      setDeleteDialogOpen(false);
      setCasoToDelete(null);
      
      console.log('Caso deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar caso:', error);
      setError('Erro ao deletar caso');
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setCasoToDelete(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'em andamento':
        return '#FF9800';
      case 'finalizado':
        return '#2196F3';
      case 'arquivado':
        return '#9E9E9E';
      default:
        return '#4CAF50';
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
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        margin: { xs: -2, md: -3 }, // Remove margens do Layout
        padding: { xs: 2, md: 3 }, // Adiciona padding interno
        bgcolor: '#F8F9FA'
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
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6} lg={3}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNovoCaso}
                sx={{
                  background: 'linear-gradient(135deg, #071739 0%, #4B6382 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #051024 0%, #3A4F6B 100%)',
                  },
                  minWidth: 120
                }}
              >
                Novo
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchCasos}
                disabled={loading}
                sx={{
                  borderColor: '#4B6382',
                  color: '#4B6382',
                  '&:hover': {
                    borderColor: '#071739',
                    backgroundColor: 'rgba(7, 23, 57, 0.04)',
                  },
                  minWidth: 120
                }}
              >
                Atualizar
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <TextField
              fullWidth
              placeholder="Pesquisar por título, descrição ou ID..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#4B6382' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '&:hover fieldset': {
                    borderColor: '#4B6382',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#071739',
                  },
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <FormControl fullWidth>
              <Select
                value={filterOption}
                onChange={handleFilterChange}
                displayEmpty
                sx={{
                  bgcolor: 'white',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4B6382',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#071739',
                  }
                }}
              >
                <MenuItem value="todos">Todos os Status</MenuItem>
                <MenuItem value="em andamento">Em Andamento</MenuItem>
                <MenuItem value="finalizado">Finalizados</MenuItem>
                <MenuItem value="arquivado">Arquivados</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Loading or Table */}
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 'calc(100vh - 400px)', // Usa altura dinâmica
            flexDirection: 'column'
          }}>
            <CircularProgress size={50} sx={{ color: '#071739', mb: 2 }} />
            <Typography sx={{ color: '#4B6382', fontSize: '1.1rem' }}>
              Carregando casos...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Table */}
            <Paper sx={{ 
              flex: 1, 
              overflow: 'hidden',
              border: '1px solid rgba(75, 99, 130, 0.08)',
              boxShadow: '0 4px 24px rgba(7, 23, 57, 0.06)',
              borderRadius: 3
            }}>
              <TableContainer sx={{ height: 'calc(100vh - 350px)' }}> {/* Altura dinâmica */}
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        bgcolor: '#F8F9FA', 
                        color: '#071739', 
                        fontWeight: 600,
                        borderBottom: '2px solid rgba(75, 99, 130, 0.1)',
                        fontSize: '0.95rem'
                      }}>
                        Título
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: '#F8F9FA', 
                        color: '#071739', 
                        fontWeight: 600,
                        borderBottom: '2px solid rgba(75, 99, 130, 0.1)',
                        fontSize: '0.95rem'
                      }}>
                        Tipo
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: '#F8F9FA', 
                        color: '#071739', 
                        fontWeight: 600,
                        borderBottom: '2px solid rgba(75, 99, 130, 0.1)',
                        fontSize: '0.95rem'
                      }}>
                        Data de Criação
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: '#F8F9FA', 
                        color: '#071739', 
                        fontWeight: 600,
                        borderBottom: '2px solid rgba(75, 99, 130, 0.1)',
                        fontSize: '0.95rem'
                      }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: '#F8F9FA', 
                        color: '#071739', 
                        fontWeight: 600,
                        borderBottom: '2px solid rgba(75, 99, 130, 0.1)',
                        fontSize: '0.95rem'
                      }}>
                        Local
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: '#F8F9FA', 
                        color: '#071739', 
                        fontWeight: 600,
                        borderBottom: '2px solid rgba(75, 99, 130, 0.1)',
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
                          <Typography variant="h6" sx={{ color: '#4B6382', mb: 1 }}>
                            {filteredCasos.length === 0 && casos.length === 0 
                              ? 'Nenhum caso encontrado para este usuário' 
                              : 'Nenhum caso encontrado com os filtros aplicados'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#A68658' }}>
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
                              bgcolor: 'rgba(75, 99, 130, 0.03)',
                              transform: 'scale(1.001)',
                              transition: 'all 0.2s ease'
                            },
                            '&:nth-of-type(even)': {
                              bgcolor: 'rgba(248, 249, 250, 0.5)'
                            },
                            cursor: 'pointer'
                          }}
                        >
                          <TableCell sx={{ 
                            color: '#071739', 
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            py: 2
                          }}>
                            {caso.titulo || 'Título não informado'}
                          </TableCell>
                          <TableCell sx={{ 
                            color: '#4B6382',
                            fontSize: '0.9rem',
                            py: 2
                          }}>
                            {caso.tipo || '-'}
                          </TableCell>
                          <TableCell sx={{ 
                            color: '#4B6382',
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
                                color: 'white',
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                minWidth: 90
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ 
                            color: '#4B6382',
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
                                    color: '#4B6382',
                                    '&:hover': { bgcolor: 'rgba(75, 99, 130, 0.1)' }
                                  }}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Editar" arrow>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditCaso(caso);
                                  }}
                                  sx={{ 
                                    color: '#A68658',
                                    '&:hover': { bgcolor: 'rgba(166, 134, 88, 0.1)' }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
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
                p: 3,
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid rgba(75, 99, 130, 0.08)',
                boxShadow: '0 2px 12px rgba(7, 23, 57, 0.04)'
              }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#4B6382', fontSize: '0.95rem' }}>
                    Mostrando <strong>{startIndex + 1}</strong> a <strong>{Math.min(endIndex, filteredCasos.length)}</strong> de <strong>{filteredCasos.length}</strong> casos
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#A68658' }}>
                    Página {page} de {totalPages}
                  </Typography>
                </Box>
                
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#4B6382',
                      fontSize: '0.9rem',
                      '&.Mui-selected': {
                        bgcolor: '#071739',
                        color: 'white',
                        '&:hover': {
                          bgcolor: '#4B6382',
                        }
                      },
                      '&:hover': {
                        bgcolor: 'rgba(75, 99, 130, 0.1)',
                      }
                    }
                  }}
                />
              </Paper>
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title" sx={{ color: '#071739' }}>
            Confirmar Exclusão
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description" sx={{ color: '#4B6382' }}>
              Tem certeza que deseja excluir o caso "{casoToDelete?.titulo}"? 
              Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} sx={{ color: '#4B6382' }}>
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
      </Box>
    </Layout>
  );
}

export default Casos;