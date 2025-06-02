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
  Snackbar,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  SupervisorAccount as AdminIcon,
  Work as WorkIcon,
  Support as SupportIcon
} from '@mui/icons-material';
import { colors } from '../styles/colors';
import Layout from '../components/Layout';
import api from '../service/api';

function Usuarios() {
  // Estados principais
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Estados do Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    matricula: '',
    role: 'perito'
  });

  // Estados para confirmação de exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const itemsPerPage = 10;
  const roles = ['admin', 'perito', 'assistente'];

  // Recupera dados do usuário logado
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        setError('Erro ao carregar dados do usuário');
      }
    }
  }, []);

  // Carrega usuários
  useEffect(() => {
    if (user) {
      fetchUsuarios();
    }
  }, [user]);

  // Buscar usuários
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/api/users');
      setUsuarios(response.data);
      setFilteredUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar usuários do sistema.');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = usuarios;

    if (searchTerm) {
      filtered = filtered.filter(usuario =>
        usuario.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.matricula?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole) {
      filtered = filtered.filter(usuario => usuario.role === filterRole);
    }

    setFilteredUsuarios(filtered);
    setPage(1);
  }, [searchTerm, filterRole, usuarios]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterRoleChange = (event) => {
    setFilterRole(event.target.value);
  };

  const handleNovoUsuario = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      matricula: '',
      role: 'perito'
    });
    setModalOpen(true);
  };

  const handleEditUser = (usuario) => {
    setEditingUser(usuario);
    setFormData({
      name: usuario.name || '',
      email: usuario.email || '',
      password: '', // Não preencher senha na edição
      matricula: usuario.matricula || '',
      role: usuario.role || 'perito'
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      matricula: '',
      role: 'perito'
    });
  };

  const handleFormChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmitUser = async () => {
    try {
      setModalLoading(true);

      if (!formData.name || !formData.email || !formData.role) {
        setSnackbar({
          open: true,
          message: 'Nome, email e role são obrigatórios.',
          type: 'error'
        });
        return;
      }

      if (!editingUser && !formData.password) {
        setSnackbar({
          open: true,
          message: 'Senha é obrigatória para novos usuários.',
          type: 'error'
        });
        return;
      }

      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        matricula: formData.matricula
      };

      if (formData.password) {
        userData.password = formData.password;
      }

      if (editingUser) {
        // Editar usuário
        const response = await api.put(`/api/users/${editingUser._id}`, userData);
        const updatedUser = response.data.user || response.data;
        
        setUsuarios(prev => 
          prev.map(u => u._id === editingUser._id ? updatedUser : u)
        );
        
        setSnackbar({
          open: true,
          message: 'Usuário atualizado com sucesso!',
          type: 'success'
        });
      } else {
        // Criar novo usuário
        const response = await api.post('/api/users', userData);
        const novoUsuario = response.data.user || response.data;
        
        setUsuarios(prev => [novoUsuario, ...prev]);
        
        setSnackbar({
          open: true,
          message: 'Usuário criado com sucesso!',
          type: 'success'
        });
      }

      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao salvar usuário',
        type: 'error'
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteClick = (usuario) => {
    setUserToDelete(usuario);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/api/users/${userToDelete._id}`);
      setUsuarios(prev => prev.filter(u => u._id !== userToDelete._id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      
      setSnackbar({
        open: true,
        message: 'Usuário excluído com sucesso!',
        type: 'success'
      });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao excluir usuário',
        type: 'error'
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '#C85A5A';  // Vermelho coral
      case 'perito':
        return '#5A7A6B';  // Verde teal
      case 'assistente':
        return colors.steelBlue;
      default:
        return colors.grayBlue;
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <AdminIcon fontSize="small" />;
      case 'perito':
        return <WorkIcon fontSize="small" />;
      case 'assistente':
        return <SupportIcon fontSize="small" />;
      default:
        return <PersonIcon fontSize="small" />;
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
  const paginatedUsuarios = filteredUsuarios.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);

  // Verificar se usuário tem permissão (apenas admin)
  if (user && user.role !== 'admin') {
    return (
      <Layout pageTitle="Gestão de Usuários">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" sx={{ color: colors.error, mb: 2 }}>
            Acesso Negado
          </Typography>
          <Typography sx={{ color: colors.secondary }}>
            Apenas administradores podem acessar esta página.
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Gestão de Usuários">
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
        
        {/* Header Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNovoUsuario}
              sx={{
                bgcolor: colors.steelBlue,               
                color: 'white',                
                '&:hover': {
                  bgcolor: colors.primary,            
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(75, 99, 130, 0.3)'
                },
                fontWeight: 600,
                minWidth: 140,
                borderRadius: 2,
                transition: 'all 0.3s ease'
              }}
            >
              Novo Usuário
            </Button>
            
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchUsuarios}
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
          
          {/* Filtros */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Pesquisar usuários..."
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
                value={filterRole}
                onChange={handleFilterRoleChange}
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
                <MenuItem value="">Todas as Roles</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="perito">Perito</MenuItem>
                <MenuItem value="assistente">Assistente</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Estatísticas rápidas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
          <Card sx={{ 
            p: 2, 
            bgcolor: colors.darkTeal, 
            color: 'white',
            boxShadow: '0 4px 12px rgba(61, 77, 85, 0.2)'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {filteredUsuarios.length}
            </Typography>
            <Typography variant="body2">
              Usuários Encontrados
            </Typography>
          </Card>
          
          <Card sx={{ 
            p: 2, 
            bgcolor: '#C85A5A', 
            color: 'white',
            boxShadow: '0 4px 12px rgba(200, 90, 90, 0.2)'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {usuarios.filter(u => u.role === 'admin').length}
            </Typography>
            <Typography variant="body2">
              Administradores
            </Typography>
          </Card>

          <Card sx={{ 
            p: 2, 
            bgcolor: '#5A7A6B', 
            color: 'white',
            boxShadow: '0 4px 12px rgba(90, 122, 107, 0.2)'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {usuarios.filter(u => u.role === 'perito').length}
            </Typography>
            <Typography variant="body2">
              Peritos
            </Typography>
          </Card>

          <Card sx={{ 
            p: 2, 
            bgcolor: colors.steelBlue, 
            color: 'white',
            boxShadow: '0 4px 12px rgba(75, 99, 130, 0.2)'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {usuarios.filter(u => u.role === 'assistente').length}
            </Typography>
            <Typography variant="body2">
              Assistentes
            </Typography>
          </Card>
        </Box>

        {/* Tabela de Usuários */}
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
              Carregando usuários...
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
                        Email
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: colors.lightSlateGray, 
                        color: colors.primary, 
                        fontWeight: 600
                      }}>
                        Matrícula
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: colors.lightSlateGray,
                        color: colors.primary, 
                        fontWeight: 600
                      }}>
                        Role
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: colors.lightSlateGray,
                        color: colors.primary, 
                        fontWeight: 600
                      }}>
                        Criado em
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: colors.lightSlateGray,
                        color: colors.primary, 
                        fontWeight: 600,
                        width: 120
                      }}>
                        Ações
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedUsuarios.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8 }}>
                          <Typography variant="h6" sx={{ color: colors.secondary, mb: 1 }}>
                            Nenhum usuário encontrado
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.secondary }}>
                            {filteredUsuarios.length === 0 && usuarios.length === 0 
                              ? 'Crie o primeiro usuário clicando no botão "Novo Usuário"' 
                              : 'Ajuste os filtros para encontrar usuários específicos'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedUsuarios.map((usuario) => (
                        <TableRow 
                          key={usuario._id}
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
                            {usuario.name || 'Nome não informado'}
                          </TableCell>
                          <TableCell sx={{ color: colors.secondary }}>
                            {usuario.email || '-'}
                          </TableCell>
                          <TableCell sx={{ color: colors.secondary }}>
                            {usuario.matricula || '-'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getRoleIcon(usuario.role)}
                              label={usuario.role?.charAt(0).toUpperCase() + usuario.role?.slice(1) || 'Perito'}
                              size="small"
                              sx={{
                                bgcolor: getRoleColor(usuario.role),
                                color: 'white',
                                fontWeight: 500,
                                '& .MuiChip-icon': {
                                  color: 'white'
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: colors.secondary }}>
                            {formatDate(usuario.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Editar" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditUser(usuario)}
                                  sx={{ 
                                    color: colors.secondary,
                                    '&:hover': { bgcolor: 'rgba(164, 181, 196, 0.15)' }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              {usuario._id !== user?.id && (
                                <Tooltip title="Excluir" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteClick(usuario)}
                                    sx={{ 
                                      color: '#f44336',
                                      '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' }
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Paginação */}
            {filteredUsuarios.length > 0 && (
              <Paper sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mt: 2,
                p: 1
              }}>
                <Typography variant="body2" sx={{ color: colors.secondary }}>
                  Mostrando <strong>{startIndex + 1}</strong> a <strong>{Math.min(endIndex, filteredUsuarios.length)}</strong> de <strong>{filteredUsuarios.length}</strong> usuários
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

        {/* Modal de Usuário */}
        <Dialog
          open={modalOpen}
          onClose={handleCloseModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 24px 48px rgba(7, 23, 57, 0.15)',
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
              {editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}
            </Typography>
            <IconButton 
              onClick={handleCloseModal}
              sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Nome */}
              <Box>
                <FormLabel sx={{ color: colors.primary, fontWeight: 600, mb: 1, display: 'block' }}>
                  Nome Completo *
                </FormLabel>
                <TextField
                  fullWidth
                  placeholder="Ex: João Silva Santos"
                  value={formData.name}
                  onChange={handleFormChange('name')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: colors.secondary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary }
                    }
                  }}
                />
              </Box>

              {/* Email */}
              <Box>
                <FormLabel sx={{ color: colors.primary, fontWeight: 600, mb: 1, display: 'block' }}>
                  Email *
                </FormLabel>
                <TextField
                  fullWidth
                  type="email"
                  placeholder="Ex: joao@email.com"
                  value={formData.email}
                  onChange={handleFormChange('email')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: colors.secondary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary }
                    }
                  }}
                />
              </Box>

              {/* Matrícula */}
              <Box>
                <FormLabel sx={{ color: colors.primary, fontWeight: 600, mb: 1, display: 'block' }}>
                  Matrícula
                </FormLabel>
                <TextField
                  fullWidth
                  placeholder="Ex: 12345"
                  value={formData.matricula}
                  onChange={handleFormChange('matricula')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: colors.secondary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary }
                    }
                  }}
                />
              </Box>

              {/* Role */}
              <Box>
                <FormLabel sx={{ color: colors.primary, fontWeight: 600, mb: 1, display: 'block' }}>
                  Role/Função *
                </FormLabel>
                <FormControl fullWidth>
                  <Select
                    value={formData.role}
                    onChange={handleFormChange('role')}
                    sx={{
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }
                    }}
                  >
                    <MenuItem value="admin">Administrador</MenuItem>
                    <MenuItem value="perito">Perito</MenuItem>
                    <MenuItem value="assistente">Assistente</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Senha */}
              <Box>
                <FormLabel sx={{ color: colors.primary, fontWeight: 600, mb: 1, display: 'block' }}>
                  Senha {!editingUser && '*'}
                </FormLabel>
                <TextField
                  fullWidth
                  type="password"
                  placeholder={editingUser ? "Deixe em branco para manter a atual" : "Digite uma senha segura"}
                  value={formData.password}
                  onChange={handleFormChange('password')}
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
              onClick={handleSubmitUser}
              variant="contained"
              disabled={modalLoading}
              sx={{
                bgcolor: colors.steelBlue,
                minWidth: 120,
                '&:hover': { bgcolor: colors.primary },
                '&:disabled': { bgcolor: '#ccc' }
              }}
            >
              {modalLoading ? <CircularProgress size={20} color="inherit" /> : (editingUser ? 'Atualizar' : 'Criar')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
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
              Tem certeza que deseja excluir o usuário "{userToDelete?.name}"? 
              Esta ação não pode ser desfeita e o usuário perderá acesso ao sistema.
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

export default Usuarios;