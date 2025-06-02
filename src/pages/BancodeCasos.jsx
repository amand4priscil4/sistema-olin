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
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { colors } from '../styles/colors';
import Layout from '../components/Layout';
import api from '../service/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`banco-tabpanel-${index}`}
      aria-labelledby={`banco-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function BancodeCasos() {
  // Estados gerais
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para Casos
  const [casos, setCasos] = useState([]);
  const [filteredCasos, setFilteredCasos] = useState([]);
  const [casosPage, setCasosPage] = useState(1);
  const [casosFilters, setCasosFilters] = useState({
    searchTerm: '',
    dataInicio: '',
    dataFim: '',
    local: '',
    peritoResponsavel: '',
    tipo: '',
    status: ''
  });

  // Estados para Vítimas
  const [vitimas, setVitimas] = useState([]);
  const [filteredVitimas, setFilteredVitimas] = useState([]);
  const [vitimasPage, setVitimasPage] = useState(1);
  const [vitimasFilters, setVitimasFilters] = useState({
    searchTerm: '',
    idadeMin: '',
    idadeMax: '',
    etnia: '',
    local: '',
    genero: ''
  });

  // Estados auxiliares
  const [peritos, setPeritos] = useState([]);
  const itemsPerPage = 10;

  // Opções para filtros
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

  const statusOptions = ['em andamento', 'finalizado', 'arquivado'];
  const etniaOptions = ['branca', 'preta', 'parda', 'amarela', 'indígena'];
  const generoOptions = ['masculino', 'feminino', 'outro'];

  // Buscar dados iniciais
  useEffect(() => {
    fetchPeritos();
    if (tabValue === 0) {
      fetchCasos();
    } else {
      fetchVitimas();
    }
  }, [tabValue]);

  // Buscar peritos para filtro
  const fetchPeritos = async () => {
    try {
      const response = await api.get('/api/users');
      const peritosList = response.data.filter(user => 
        user.role === 'perito' || user.role === 'admin'
      );
      setPeritos(peritosList);
    } catch (error) {
      console.error('Erro ao buscar peritos:', error);
    }
  };

  // Buscar todos os casos
  const fetchCasos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/api/casos');
      setCasos(response.data);
      setFilteredCasos(response.data);
    } catch (error) {
      console.error('Erro ao carregar casos:', error);
      setError('Erro ao carregar casos do banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  // Buscar todas as vítimas
  const fetchVitimas = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Como não temos endpoint específico para todas as vítimas,
      // vamos buscar por casos primeiro e depois suas vítimas
      const casosResponse = await api.get('/api/casos');
      const allVitimas = [];
      
      for (const caso of casosResponse.data) {
        try {
          const vitimasResponse = await api.get(`/api/vitimas/caso/${caso._id}`);
          const vitimasComCaso = vitimasResponse.data.map(vitima => ({
            ...vitima,
            casoInfo: {
              titulo: caso.titulo,
              local: caso.localDoCaso,
              data: caso.data || caso.createdAt
            }
          }));
          allVitimas.push(...vitimasComCaso);
        } catch (err) {
          // Caso não tenha vítimas ou erro, continua
          console.log(`Sem vítimas para caso ${caso._id}`);
        }
      }
      
      setVitimas(allVitimas);
      setFilteredVitimas(allVitimas);
    } catch (error) {
      console.error('Erro ao carregar vítimas:', error);
      setError('Erro ao carregar vítimas do banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  // Filtros para casos
  useEffect(() => {
    let filtered = casos;

    if (casosFilters.searchTerm) {
      filtered = filtered.filter(caso =>
        caso.titulo?.toLowerCase().includes(casosFilters.searchTerm.toLowerCase()) ||
        caso.descricao?.toLowerCase().includes(casosFilters.searchTerm.toLowerCase()) ||
        caso._id?.toLowerCase().includes(casosFilters.searchTerm.toLowerCase())
      );
    }

    if (casosFilters.dataInicio) {
      filtered = filtered.filter(caso => {
        const casoDate = new Date(caso.data || caso.createdAt);
        return casoDate >= new Date(casosFilters.dataInicio);
      });
    }

    if (casosFilters.dataFim) {
      filtered = filtered.filter(caso => {
        const casoDate = new Date(caso.data || caso.createdAt);
        return casoDate <= new Date(casosFilters.dataFim);
      });
    }

    if (casosFilters.local) {
      filtered = filtered.filter(caso =>
        caso.localDoCaso?.toLowerCase().includes(casosFilters.local.toLowerCase())
      );
    }

    if (casosFilters.peritoResponsavel) {
      filtered = filtered.filter(caso =>
        caso.peritoResponsavel === casosFilters.peritoResponsavel ||
        caso.peritoResponsavel?._id === casosFilters.peritoResponsavel
      );
    }

    if (casosFilters.tipo) {
      filtered = filtered.filter(caso => caso.tipo === casosFilters.tipo);
    }

    if (casosFilters.status) {
      filtered = filtered.filter(caso => caso.status === casosFilters.status);
    }

    setFilteredCasos(filtered);
    setCasosPage(1);
  }, [casosFilters, casos]);

  // Filtros para vítimas
  useEffect(() => {
    let filtered = vitimas;

    if (vitimasFilters.searchTerm) {
      filtered = filtered.filter(vitima =>
        vitima.nome?.toLowerCase().includes(vitimasFilters.searchTerm.toLowerCase()) ||
        vitima.nic?.toLowerCase().includes(vitimasFilters.searchTerm.toLowerCase()) ||
        vitima.documento?.numero?.toLowerCase().includes(vitimasFilters.searchTerm.toLowerCase())
      );
    }

    if (vitimasFilters.idadeMin) {
      filtered = filtered.filter(vitima => vitima.idade >= parseInt(vitimasFilters.idadeMin));
    }

    if (vitimasFilters.idadeMax) {
      filtered = filtered.filter(vitima => vitima.idade <= parseInt(vitimasFilters.idadeMax));
    }

    if (vitimasFilters.etnia) {
      filtered = filtered.filter(vitima => vitima.corEtnia === vitimasFilters.etnia);
    }

    if (vitimasFilters.local) {
      filtered = filtered.filter(vitima =>
        vitima.casoInfo?.local?.toLowerCase().includes(vitimasFilters.local.toLowerCase()) ||
        vitima.endereco?.cidade?.toLowerCase().includes(vitimasFilters.local.toLowerCase())
      );
    }

    if (vitimasFilters.genero) {
      filtered = filtered.filter(vitima => vitima.genero === vitimasFilters.genero);
    }

    setFilteredVitimas(filtered);
    setVitimasPage(1);
  }, [vitimasFilters, vitimas]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCasosFilterChange = (field) => (event) => {
    setCasosFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleVitimasFilterChange = (field) => (event) => {
    setVitimasFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const clearCasosFilters = () => {
    setCasosFilters({
      searchTerm: '',
      dataInicio: '',
      dataFim: '',
      local: '',
      peritoResponsavel: '',
      tipo: '',
      status: ''
    });
  };

  const clearVitimasFilters = () => {
    setVitimasFilters({
      searchTerm: '',
      idadeMin: '',
      idadeMax: '',
      etnia: '',
      local: '',
      genero: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'em andamento':
        return '#C85A5A';  // Vermelho coral
      case 'finalizado':
        return '#5A7A6B';  // Verde teal
      case 'arquivado':
        return '#D4B896';  // Bege claro
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

  // Paginação para casos
  const casosStartIndex = (casosPage - 1) * itemsPerPage;
  const casosEndIndex = casosStartIndex + itemsPerPage;
  const paginatedCasos = filteredCasos.slice(casosStartIndex, casosEndIndex);
  const casosTotalPages = Math.ceil(filteredCasos.length / itemsPerPage);

  // Paginação para vítimas
  const vitimasStartIndex = (vitimasPage - 1) * itemsPerPage;
  const vitimasEndIndex = vitimasStartIndex + itemsPerPage;
  const paginatedVitimas = filteredVitimas.slice(vitimasStartIndex, vitimasEndIndex);
  const vitimasTotalPages = Math.ceil(filteredVitimas.length / itemsPerPage);

  return (
    <Layout pageTitle="Banco de Casos">
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
            Consulte casos e vítimas cadastradas no sistema para análise e pesquisa
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: colors.primary,
              },
              '& .MuiTab-root': {
                color: colors.secondary,
                fontWeight: 600,
                '&.Mui-selected': {
                  color: colors.primary,
                }
              }
            }}
          >
            <Tab 
              icon={<WorkIcon />} 
              label="Casos" 
              iconPosition="start"
              sx={{ textTransform: 'none', fontSize: '1rem' }}
            />
            <Tab 
              icon={<PersonIcon />} 
              label="Vítimas" 
              iconPosition="start"
              sx={{ textTransform: 'none', fontSize: '1rem' }}
            />
          </Tabs>
        </Box>

        {/* Tab Panel - Casos */}
        <TabPanel value={tabValue} index={0}>
          {/* Filtros de Casos */}
          <Card sx={{ mb: 1, boxShadow: '0 2px 12px rgba(7, 23, 57, 0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FilterIcon sx={{ color: colors.primary, mr: 1 }} />
                <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
                  Filtros de Casos
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
                    placeholder="Título, descrição ou ID do caso..."
                    value={casosFilters.searchTerm}
                    onChange={handleCasosFilterChange('searchTerm')}
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
                    value={casosFilters.dataInicio}
                    onChange={handleCasosFilterChange('dataInicio')}
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
                    value={casosFilters.dataFim}
                    onChange={handleCasosFilterChange('dataFim')}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
                <Box>
                  <FormLabel sx={{ color: colors.primary, fontWeight: 500, mb: 1, display: 'block' }}>
                    Local
                  </FormLabel>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Local do caso..."
                    value={casosFilters.local}
                    onChange={handleCasosFilterChange('local')}
                  />
                </Box>

                <Box>
                  <FormLabel sx={{ color: colors.primary, fontWeight: 500, mb: 1, display: 'block' }}>
                    Perito Responsável
                  </FormLabel>
                  <FormControl fullWidth size="small">
                    <Select
                      value={casosFilters.peritoResponsavel}
                      onChange={handleCasosFilterChange('peritoResponsavel')}
                      displayEmpty
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {peritos.map((perito) => (
                        <MenuItem key={perito._id} value={perito._id}>
                          {perito.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <FormLabel sx={{ color: colors.primary, fontWeight: 500, mb: 1, display: 'block' }}>
                    Tipo
                  </FormLabel>
                  <FormControl fullWidth size="small">
                    <Select
                      value={casosFilters.tipo}
                      onChange={handleCasosFilterChange('tipo')}
                      displayEmpty
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {tiposCaso.map((tipo) => (
                        <MenuItem key={tipo} value={tipo}>
                          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <FormLabel sx={{ color: colors.primary, fontWeight: 500, mb: 1, display: 'block' }}>
                    Status
                  </FormLabel>
                  <FormControl fullWidth size="small">
                    <Select
                      value={casosFilters.status}
                      onChange={handleCasosFilterChange('status')}
                      displayEmpty
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {statusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={clearCasosFilters}
                  sx={{ color: colors.secondary }}
                >
                  <Tooltip title="Limpar filtros">
                    <RefreshIcon />
                  </Tooltip>
                </IconButton>
              </Box>
            </CardContent>
          </Card>

          {/* Tabela de Casos */}
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
                Carregando casos...
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
                          fontWeight: 600
                        }}>
                          Título
                        </TableCell>
                        <TableCell sx={{ 
                          bgcolor: colors.lightSlateGray,
                          color: colors.primary, 
                          fontWeight: 600
                        }}>
                          Tipo
                        </TableCell>
                        <TableCell sx={{ 
                          bgcolor: colors.lightSlateGray, 
                          color: colors.primary, 
                          fontWeight: 600
                        }}>
                          Perito
                        </TableCell>
                        <TableCell sx={{ 
                          bgcolor: colors.lightSlateGray,
                          color: colors.primary, 
                          fontWeight: 600
                        }}>
                          Data
                        </TableCell>
                        <TableCell sx={{ 
                          bgcolor: colors.lightSlateGray,
                          color: colors.primary, 
                          fontWeight: 600
                        }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ 
                          bgcolor: colors.lightSlateGray,
                          color: colors.primary, 
                          fontWeight: 600
                        }}>
                          Local
                        </TableCell>
                        <TableCell sx={{ 
                          bgcolor: colors.lightSlateGray,
                          color: colors.primary, 
                          fontWeight: 600,
                          width: 80
                        }}>
                          Ações
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedCasos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" sx={{ color: colors.secondary, mb: 1 }}>
                              Nenhum caso encontrado
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.secondary }}>
                              Ajuste os filtros para encontrar casos específicos
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedCasos.map((caso) => (
                          <TableRow 
                            key={caso._id}
                            sx={{ 
                              '&:hover': { 
                                bgcolor: 'rgba(164, 181, 196, 0.08)',
                              },
                              '&:nth-of-type(even)': {
                                bgcolor: 'rgba(205, 213, 219, 0.3)'
                              }
                            }}
                          >
                            <TableCell sx={{ color: colors.primary, fontWeight: 500 }}>
                              {caso.titulo || 'Título não informado'}
                            </TableCell>
                            <TableCell sx={{ color: colors.secondary }}>
                              {caso.tipo || '-'}
                            </TableCell>
                            <TableCell sx={{ color: colors.secondary }}>
                              {caso.peritoResponsavel?.name || 'Não informado'}
                            </TableCell>
                            <TableCell sx={{ color: colors.secondary }}>
                              {formatDate(caso.createdAt || caso.data)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={caso.status || 'Em andamento'}
                                size="small"
                                sx={{
                                  bgcolor: getStatusColor(caso.status),
                                  color: 'white',
                                  fontWeight: 500
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ 
                              color: colors.secondary,
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {caso.localDoCaso || '-'}
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Visualizar" arrow>
                                <IconButton
                                  size="small"
                                  sx={{ color: colors.secondary }}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Paginação Casos */}
              {filteredCasos.length > 0 && (
                <Paper sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mt: 2,
                  p: 1
                }}>
                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                    Mostrando <strong>{casosStartIndex + 1}</strong> a <strong>{Math.min(casosEndIndex, filteredCasos.length)}</strong> de <strong>{filteredCasos.length}</strong> casos
                  </Typography>
                  
                  <Pagination
                    count={casosTotalPages}
                    page={casosPage}
                    onChange={(event, newPage) => setCasosPage(newPage)}
                    color="primary"
                  />
                </Paper>
              )}
            </>
          )}
        </TabPanel>

        {/* Tab Panel - Vítimas */}
        <TabPanel value={tabValue} index={1}>
          {/* Filtros de Vítimas */}
          <Card sx={{ mb: 1, boxShadow: '0 2px 12px rgba(7, 23, 57, 0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FilterIcon sx={{ color: colors.primary, mr: 1 }} />
                <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
                  Filtros de Vítimas
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
                    placeholder="Nome, NIC ou documento..."
                    value={vitimasFilters.searchTerm}
                    onChange={handleVitimasFilterChange('searchTerm')}
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
                    Idade Mínima
                  </FormLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="Ex: 18"
                    value={vitimasFilters.idadeMin}
                    onChange={handleVitimasFilterChange('idadeMin')}
                  />
                </Box>

                <Box>
                  <FormLabel sx={{ color: colors.primary, fontWeight: 500, mb: 1, display: 'block' }}>
                    Idade Máxima
                  </FormLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="Ex: 65"
                    value={vitimasFilters.idadeMax}
                    onChange={handleVitimasFilterChange('idadeMax')}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                <Box>
                  <FormLabel sx={{ color: colors.primary, fontWeight: 500, mb: 1, display: 'block' }}>
                    Etnia
                  </FormLabel>
                  <FormControl fullWidth size="small">
                    <Select
                      value={vitimasFilters.etnia}
                      onChange={handleVitimasFilterChange('etnia')}
                      displayEmpty
                    >
                      <MenuItem value="">Todas</MenuItem>
                      {etniaOptions.map((etnia) => (
                        <MenuItem key={etnia} value={etnia}>
                          {etnia.charAt(0).toUpperCase() + etnia.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <FormLabel sx={{ color: colors.primary, fontWeight: 500, mb: 1, display: 'block' }}>
                    Gênero
                  </FormLabel>
                  <FormControl fullWidth size="small">
                    <Select
                      value={vitimasFilters.genero}
                      onChange={handleVitimasFilterChange('genero')}
                      displayEmpty
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {generoOptions.map((genero) => (
                        <MenuItem key={genero} value={genero}>
                          {genero.charAt(0).toUpperCase() + genero.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <FormLabel sx={{ color: colors.primary, fontWeight: 500, mb: 1, display: 'block' }}>
                    Local
                  </FormLabel>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Local do caso ou cidade..."
                    value={vitimasFilters.local}
                    onChange={handleVitimasFilterChange('local')}
                  />
                </Box>
              </Box>

              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={clearVitimasFilters}
                  sx={{ color: colors.secondary }}
                >
                  <Tooltip title="Limpar filtros">
                    <RefreshIcon />
                  </Tooltip>
                </IconButton>
              </Box>
            </CardContent>
          </Card>

          {/* Tabela de Vítimas */}
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
                Carregando vítimas...
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
                          fontWeight: 600
                        }}>
                          Nome
                        </TableCell>
                        <TableCell sx={{ 
                          bgcolor: colors.lightSlateGray,
                          color: colors.primary, 
                          fontWeight: 600
                        }}>
                          NIC
                        </TableCell>
                        <TableCell sx={{ 
                          bgcolor: colors.lightSlateGray, 
                          color: colors.primary, 
                          fontWeight: 600
                        }}>
                          Idade
                        </TableCell>
                        <TableCell sx={{ 
                          bgcolor: colors.lightSlateGray,
                          color: colors.primary, 
                          fontWeight: 600
                        }}>
                          Gênero
                        </TableCell>
                        <TableCell sx={{ 
                          bgcolor: colors.lightSlateGray,
                          color: colors.primary, 
                          fontWeight: 600
                        }}>
                          Etnia
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
                          fontWeight: 600,
                          width: 80
                        }}>
                          Ações
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedVitimas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" sx={{ color: colors.secondary, mb: 1 }}>
                              Nenhuma vítima encontrada
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.secondary }}>
                              Ajuste os filtros para encontrar vítimas específicas
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedVitimas.map((vitima) => (
                          <TableRow 
                            key={vitima._id}
                            sx={{ 
                              '&:hover': { 
                                bgcolor: 'rgba(164, 181, 196, 0.08)',
                              },
                              '&:nth-of-type(even)': {
                                bgcolor: 'rgba(205, 213, 219, 0.3)'
                              }
                            }}
                          >
                            <TableCell sx={{ color: colors.primary, fontWeight: 500 }}>
                              {vitima.nome || 'Nome não informado'}
                            </TableCell>
                            <TableCell sx={{ color: colors.secondary }}>
                              {vitima.nic || '-'}
                            </TableCell>
                            <TableCell sx={{ color: colors.secondary }}>
                              {vitima.idade ? `${vitima.idade} anos` : '-'}
                            </TableCell>
                            <TableCell sx={{ color: colors.secondary }}>
                              {vitima.genero ? vitima.genero.charAt(0).toUpperCase() + vitima.genero.slice(1) : '-'}
                            </TableCell>
                            <TableCell sx={{ color: colors.secondary }}>
                              {vitima.corEtnia ? vitima.corEtnia.charAt(0).toUpperCase() + vitima.corEtnia.slice(1) : '-'}
                            </TableCell>
                            <TableCell sx={{ 
                              color: colors.secondary,
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {vitima.casoInfo?.titulo || 'Caso não informado'}
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Visualizar" arrow>
                                <IconButton
                                  size="small"
                                  sx={{ color: colors.secondary }}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Paginação Vítimas */}
              {filteredVitimas.length > 0 && (
                <Paper sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mt: 2,
                  p: 1
                }}>
                  <Typography variant="body2" sx={{ color: colors.secondary }}>
                    Mostrando <strong>{vitimasStartIndex + 1}</strong> a <strong>{Math.min(vitimasEndIndex, filteredVitimas.length)}</strong> de <strong>{filteredVitimas.length}</strong> vítimas
                  </Typography>
                  
                  <Pagination
                    count={vitimasTotalPages}
                    page={vitimasPage}
                    onChange={(event, newPage) => setVitimasPage(newPage)}
                    color="primary"
                  />
                </Paper>
              )}
            </>
          )}
        </TabPanel>
      </Box>
    </Layout>
  );
}

export default BancodeCasos;