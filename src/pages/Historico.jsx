import { useState, useEffect } from 'react';
import {
  Box,
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
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  FormLabel,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { colors } from '../styles/colors';
import Layout from '../components/Layout';
import api from '../service/api';

function Historico() {
  // Estados principais
  const [historico, setHistorico] = useState([]);
  const [filteredHistorico, setFilteredHistorico] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para filtros
  const [filters, setFilters] = useState({
    searchTerm: '',
    dataInicio: '',
    dataFim: '',
    usuario: '',
    caso: '',
    acao: ''
  });

  // Estados auxiliares
  const [usuarios, setUsuarios] = useState([]);
  const [casos, setCasos] = useState([]);
  const [acoesDisponiveis, setAcoesDisponiveis] = useState([]);
  const itemsPerPage = 15;

  // Buscar dados iniciais
  useEffect(() => {
    fetchUsuarios();
    fetchCasos();
    fetchHistorico();
  }, []);

  // Buscar usuários para filtro
  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/api/users');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  // Buscar casos para filtro
  const fetchCasos = async () => {
    try {
      const response = await api.get('/api/casos');
      setCasos(response.data);
    } catch (error) {
      console.error('Erro ao buscar casos:', error);
    }
  };

  // Buscar histórico geral
  const fetchHistorico = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/api/historico/todos');
      const historicoData = response.data;
      
      setHistorico(historicoData);
      setFilteredHistorico(historicoData);

      // Extrair ações únicas para filtro
      const acoes = [...new Set(historicoData.map(item => item.acao))].filter(Boolean);
      setAcoesDisponiveis(acoes);
      
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setError('Erro ao carregar histórico do sistema.');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = historico;

    // Filtro por busca textual
    if (filters.searchTerm) {
      filtered = filtered.filter(item =>
        item.acao?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.detalhes?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.usuario?.nome?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.caso?.titulo?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Filtro por data início
    if (filters.dataInicio) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.data);
        return itemDate >= new Date(filters.dataInicio);
      });
    }

    // Filtro por data fim
    if (filters.dataFim) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.data);
        return itemDate <= new Date(filters.dataFim + 'T23:59:59');
      });
    }

    // Filtro por usuário
    if (filters.usuario) {
      filtered = filtered.filter(item =>
        item.usuario?._id === filters.usuario ||
        item.usuario === filters.usuario
      );
    }

    // Filtro por caso
    if (filters.caso) {
      filtered = filtered.filter(item =>
        item.caso?._id === filters.caso ||
        item.caso === filters.caso
      );
    }

    // Filtro por ação
    if (filters.acao) {
      filtered = filtered.filter(item => item.acao === filters.acao);
    }

    setFilteredHistorico(filtered);
    setPage(1);
  }, [filters, historico]);

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      dataInicio: '',
      dataFim: '',
      usuario: '',
      caso: '',
      acao: ''
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getAcaoColor = (acao) => {
    const acaoLower = acao?.toLowerCase() || '';
    
    if (acaoLower.includes('criado') || acaoLower.includes('cadastrado')) {
      return '#5A7A6B';  // Verde teal (similar ao finalizado)
    } else if (acaoLower.includes('atualizado') || acaoLower.includes('editado')) {
      return colors.warning;
    } else if (acaoLower.includes('deletado') || acaoLower.includes('removido')) {
      return colors.error;
    } else if (acaoLower.includes('finalizado') || acaoLower.includes('concluído')) {
      return '#5A7A6B';  // Verde teal
    } else if (acaoLower.includes('arquivado')) {
      return '#D4B896';  // Bege claro (similar ao arquivado)
    }
    
    return colors.steelBlue;
  };

  const getAcaoIcon = (acao) => {
    const acaoLower = acao?.toLowerCase() || '';
    
    if (acaoLower.includes('usuário') || acaoLower.includes('user')) {
      return <PersonIcon fontSize="small" />;
    } else if (acaoLower.includes('caso')) {
      return <WorkIcon fontSize="small" />;
    } else if (acaoLower.includes('relatório') || acaoLower.includes('laudo')) {
      return <InfoIcon fontSize="small" />;
    }
    
    return <HistoryIcon fontSize="small" />;
  };

  // Paginação
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHistorico = filteredHistorico.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredHistorico.length / itemsPerPage);

  return (
    <Layout pageTitle="Histórico do Sistema">
      <Box sx={{ 
        background: colors.background,
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

        {/* Header */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="body1" sx={{ color: colors.secondary }}>
            Acompanhe todas as ações e modificações realizadas no sistema
          </Typography>
        </Box>

        {/* Filtros */}
        <Card sx={{ mb: 1, boxShadow: '0 2px 12px rgba(7, 23, 57, 0.08)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterIcon sx={{ color: colors.primary, mr: 1 }} />
              <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
                Filtros de Histórico
              </Typography>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 2, mb: 2 }}>
              <Box>
                <FormLabel sx={{ color: colors.primary, fontWeight: 500, mb: 1, display: 'block' }}>
                  Buscar
                </FormLabel>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ação, usuário, caso ou detalhes..."
                  value={filters.searchTerm}
                  onChange={handleFilterChange('searchTerm')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: colors.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box>
                <FormLabel sx={{ color: colors.primary, fontWeight: 500, mb: 1, display: 'block' }}>
                  Data Início
                </FormLabel>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={filters.dataInicio}
                  onChange={handleFilterChange('dataInicio')}
                />
              </Box>

              <Box>
                <FormLabel sx={{ color: colors.primary, fontWeight: 500, mb: 1, display: 'block' }}>
                  Data Fim
                </FormLabel>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={filters.dataFim}
                  onChange={handleFilterChange('dataFim')}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              <Box>
                <FormLabel sx={{ color: colors.primary, fontWeight: 500, mb: 1, display: 'block' }}>
                  Usuário
                </FormLabel>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.usuario}
                    onChange={handleFilterChange('usuario')}
                    displayEmpty
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {usuarios.map((usuario) => (
                      <MenuItem key={usuario._id} value={usuario._id}>
                        {usuario.name || usuario.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <FormLabel sx={{ color: colors.primary, fontWeight: 500, mb: 1, display: 'block' }}>
                  Caso
                </FormLabel>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.caso}
                    onChange={handleFilterChange('caso')}
                    displayEmpty
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {casos.map((caso) => (
                      <MenuItem key={caso._id} value={caso._id}>
                        {caso.titulo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <FormLabel sx={{ color: colors.primary, fontWeight: 500, mb: 1, display: 'block' }}>
                  Tipo de Ação
                </FormLabel>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.acao}
                    onChange={handleFilterChange('acao')}
                    displayEmpty
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {acoesDisponiveis.map((acao) => (
                      <MenuItem key={acao} value={acao}>
                        {acao}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
              <IconButton
                onClick={clearFilters}
                sx={{ color: colors.secondary }}
              >
                <Tooltip title="Limpar filtros">
                  <RefreshIcon />
                </Tooltip>
              </IconButton>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={fetchHistorico}
                  disabled={loading}
                  sx={{ color: colors.primary }}
                >
                  <Tooltip title="Atualizar histórico">
                    <RefreshIcon />
                  </Tooltip>
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Estatísticas rápidas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
          <Card sx={{ 
            p: 2, 
            bgcolor: colors.darkTeal, 
            color: 'white',
            boxShadow: '0 4px 12px rgba(61, 77, 85, 0.2)'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {filteredHistorico.length}
            </Typography>
            <Typography variant="body2">
              Registros Encontrados
            </Typography>
          </Card>
          
          <Card sx={{ 
            p: 2, 
            bgcolor: colors.steelBlue, 
            color: 'white',
            boxShadow: '0 4px 12px rgba(75, 99, 130, 0.2)'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {historico.length}
            </Typography>
            <Typography variant="body2">
              Total de Ações
            </Typography>
          </Card>

          <Card sx={{ 
            p: 2, 
            bgcolor: colors.grayBlue, 
            color: 'white',
            boxShadow: '0 4px 12px rgba(167, 158, 156, 0.2)'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {acoesDisponiveis.length}
            </Typography>
            <Typography variant="body2">
              Tipos de Ações
            </Typography>
          </Card>

          <Card sx={{ 
            p: 2, 
            bgcolor: colors.lightGray, 
            color: colors.primary,
            boxShadow: '0 4px 12px rgba(211, 195, 185, 0.2)'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {usuarios.length}
            </Typography>
            <Typography variant="body2">
              Usuários Ativos
            </Typography>
          </Card>
        </Box>

        {/* Tabela de Histórico */}
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '40vh',
            flexDirection: 'column'
          }}>
            <CircularProgress size={50} sx={{ color: colors.primary, mb: 2 }} />
            <Typography sx={{ color: colors.secondary }}>
              Carregando histórico...
            </Typography>
          </Box>
        ) : (
          <>
            <Paper sx={{ 
              overflow: 'hidden',
              border: '1px solid rgba(164, 181, 196, 0.2)',
              boxShadow: '0 4px 24px rgba(7, 23, 57, 0.06)',
              borderRadius: 3
            }}>
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        bgcolor: colors.lightSlateGray, 
                        color: colors.primary, 
                        fontWeight: 600,
                        width: 160
                      }}>
                        Data/Hora
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: colors.lightSlateGray,
                        color: colors.primary, 
                        fontWeight: 600
                      }}>
                        Ação
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: colors.lightSlateGray, 
                        color: colors.primary, 
                        fontWeight: 600
                      }}>
                        Usuário
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: colors.lightSlateGray,
                        color: colors.primary, 
                        fontWeight: 600
                      }}>
                        Caso
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: colors.lightSlateGray,
                        color: colors.primary, 
                        fontWeight: 600
                      }}>
                        Detalhes
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedHistorico.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 8 }}>
                          <Typography variant="h6" sx={{ color: colors.secondary, mb: 1 }}>
                            Nenhum registro encontrado
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.secondary }}>
                            {filteredHistorico.length === 0 && historico.length === 0 
                              ? 'Ainda não há ações registradas no sistema' 
                              : 'Ajuste os filtros para encontrar registros específicos'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedHistorico.map((item, index) => (
                        <TableRow 
                          key={item._id || index}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: 'rgba(164, 181, 196, 0.08)',
                            },
                            '&:nth-of-type(even)': {
                              bgcolor: 'rgba(205, 213, 219, 0.3)'
                            }
                          }}
                        >
                          <TableCell sx={{ 
                            color: colors.secondary,
                            fontFamily: 'monospace',
                            fontSize: '0.85rem'
                          }}>
                            {formatDateTime(item.data)}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                icon={getAcaoIcon(item.acao)}
                                label={item.acao || 'Ação não especificada'}
                                size="small"
                                sx={{
                                  bgcolor: getAcaoColor(item.acao),
                                  color: item.acao?.toLowerCase().includes('arquivado') ? '#333' : 'white',
                                  fontWeight: 500,
                                  '& .MuiChip-icon': {
                                    color: item.acao?.toLowerCase().includes('arquivado') ? '#333' : 'white'
                                  }
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: colors.primary, fontWeight: 500 }}>
                            {item.usuario?.nome || item.usuario?.name || 'Sistema'}
                          </TableCell>
                          <TableCell sx={{ 
                            color: colors.secondary,
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.caso?.titulo || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ 
                            color: colors.secondary,
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.detalhes || 'Sem detalhes adicionais'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Paginação */}
            {filteredHistorico.length > 0 && (
              <Paper sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mt: 2,
                p: 1
              }}>
                <Typography variant="body2" sx={{ color: colors.secondary }}>
                  Mostrando <strong>{startIndex + 1}</strong> a <strong>{Math.min(endIndex, filteredHistorico.length)}</strong> de <strong>{filteredHistorico.length}</strong> registros
                </Typography>
                
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(event, newPage) => setPage(newPage)}
                  color="primary"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: colors.steelBlue,
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
      </Box>
    </Layout>
  );
}

export default Historico;