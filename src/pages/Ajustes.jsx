import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  Avatar,
  Alert,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Close as XIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../service/api';

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
  
  // Estados e feedback
  success: '#4CAF50',
  error: '#F44336', 
  warning: '#FF9800',
  info: '#DC3545',              
  
  // Texto
  textPrimary: '#2F2F2F',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF'
};

const Ajustes = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para edição
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  
  // Estados para configurações
  const [configuracoes, setConfiguracoes] = useState({
    tema: 'claro',
    idioma: 'pt-BR',
    notificacoes: {
      email: true,
      push: false,
      novosLaudos: true,
      relatorios: true,
      alteracoesCaso: false
    },
    seguranca: {
      autenticacaoDupla: false,
      sessaoAutomatica: true,
      logAtividades: true
    },
    preferencias: {
      itensPerPage: 10,
      formatoData: 'DD/MM/YYYY',
      timezone: 'America/Sao_Paulo'
    }
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
    setEditData(user || {});
    setLoading(false);
  }, []);

  const handleSalvarPerfil = async () => {
    try {
      const response = await api.put(`/api/usuarios/${currentUser.id}`, {
        name: editData.name,
        email: editData.email
      });
      
      setCurrentUser({ ...currentUser, ...editData });
      setEditMode(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSalvarConfiguracoes = () => {
    // Aqui você salvaria as configurações no backend
    localStorage.setItem('configuracoes', JSON.stringify(configuracoes));
    alert('Configurações salvas com sucesso!');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'perito': return 'Perito';
      case 'assistente': return 'Assistente';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return colors.error;
      case 'perito': return colors.info;
      case 'assistente': return colors.warning;
      default: return colors.secondary;
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Carregando...">
        <Box sx={{ 
          minHeight: '100vh',
          background: colors.background,
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <Typography sx={{ color: colors.secondary }}>
            Carregando configurações...
          </Typography>
        </Box>
      </Layout>
    );
  }

  const tabs = [
    { label: 'Perfil', icon: <PersonIcon /> },
    { label: 'Preferências', icon: <SettingsIcon /> },
    { label: 'Notificações', icon: <NotificationsIcon /> },
    { label: 'Segurança', icon: <SecurityIcon /> }
  ];

  return (
    <Layout pageTitle="Configurações">
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
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  bgcolor: colors.accent,
                  fontSize: '1.5rem',
                  fontWeight: 600
                }}
              >
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                  <Typography variant="body1" sx={{ color: colors.secondary }}>
                    {currentUser?.name || 'Usuário'}
                  </Typography>
                  <Chip
                    label={getRoleLabel(currentUser?.role)}
                    size="small"
                    sx={{
                      bgcolor: getRoleColor(currentUser?.role),
                      color: 'white',
                      fontWeight: 500
                    }}
                  />
                </Box>
              </Box>
            </Box>
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
          
          {/* Perfil Tab */}
          {activeTab === 0 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
                  Informações do Perfil
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                    onClick={() => editMode ? handleSalvarPerfil() : setEditMode(true)}
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
                        setEditData(currentUser);
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
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                    Nome Completo
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      value={editData.name || ''}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: colors.secondary },
                          '&.Mui-focused fieldset': { borderColor: colors.primary }
                        }
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: colors.secondary }}>{currentUser?.name || 'Não informado'}</Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                    E-mail
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: colors.secondary },
                          '&.Mui-focused fieldset': { borderColor: colors.primary }
                        }
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: colors.secondary }}>{currentUser?.email || 'Não informado'}</Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                    Cargo/Função
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={getRoleLabel(currentUser?.role)}
                      sx={{
                        bgcolor: getRoleColor(currentUser?.role),
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                    ID do Usuário
                  </Typography>
                  <Typography sx={{ color: colors.secondary, fontFamily: 'monospace' }}>
                    {currentUser?.id || 'Não informado'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Preferências Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 600, mb: 3 }}>
                Preferências do Sistema
              </Typography>

              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 3, border: `1px solid ${colors.lightGray}20` }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <PaletteIcon sx={{ color: colors.accent }} />
                      <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
                        Aparência
                      </Typography>
                    </Box>
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Tema</InputLabel>
                      <Select
                        value={configuracoes.tema}
                        onChange={(e) => setConfiguracoes({
                          ...configuracoes,
                          tema: e.target.value
                        })}
                        label="Tema"
                        sx={{
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }
                        }}
                      >
                        <MenuItem value="claro">Claro</MenuItem>
                        <MenuItem value="escuro">Escuro</MenuItem>
                        <MenuItem value="automatico">Automático</MenuItem>
                      </Select>
                    </FormControl>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 3, border: `1px solid ${colors.lightGray}20` }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <LanguageIcon sx={{ color: colors.accent }} />
                      <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
                        Idioma e Região
                      </Typography>
                    </Box>
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Idioma</InputLabel>
                      <Select
                        value={configuracoes.idioma}
                        onChange={(e) => setConfiguracoes({
                          ...configuracoes,
                          idioma: e.target.value
                        })}
                        label="Idioma"
                        sx={{
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }
                        }}
                      >
                        <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
                        <MenuItem value="en-US">English (US)</MenuItem>
                        <MenuItem value="es-ES">Español</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel>Formato de Data</InputLabel>
                      <Select
                        value={configuracoes.preferencias.formatoData}
                        onChange={(e) => setConfiguracoes({
                          ...configuracoes,
                          preferencias: {
                            ...configuracoes.preferencias,
                            formatoData: e.target.value
                          }
                        })}
                        label="Formato de Data"
                        sx={{
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }
                        }}
                      >
                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                      </Select>
                    </FormControl>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ p: 3, border: `1px solid ${colors.lightGray}20` }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <ScheduleIcon sx={{ color: colors.accent }} />
                      <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
                        Exibição
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Itens por página</InputLabel>
                          <Select
                            value={configuracoes.preferencias.itensPerPage}
                            onChange={(e) => setConfiguracoes({
                              ...configuracoes,
                              preferencias: {
                                ...configuracoes.preferencias,
                                itensPerPage: e.target.value
                              }
                            })}
                            label="Itens por página"
                            sx={{
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }
                            }}
                          >
                            <MenuItem value={5}>5 itens</MenuItem>
                            <MenuItem value={10}>10 itens</MenuItem>
                            <MenuItem value={20}>20 itens</MenuItem>
                            <MenuItem value={50}>50 itens</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSalvarConfiguracoes}
                      sx={{
                        bgcolor: colors.charcoal,
                        '&:hover': { bgcolor: colors.primary }
                      }}
                    >
                      Salvar Preferências
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Notificações Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 600, mb: 3 }}>
                Configurações de Notificações
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ p: 3, border: `1px solid ${colors.lightGray}20` }}>
                    <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                      Canais de Notificação
                    </Typography>
                    
                    <Box display="flex" flexDirection="column" gap={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={configuracoes.notificacoes.email}
                            onChange={(e) => setConfiguracoes({
                              ...configuracoes,
                              notificacoes: {
                                ...configuracoes.notificacoes,
                                email: e.target.checked
                              }
                            })}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: colors.accent,
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: colors.accent,
                              },
                            }}
                          />
                        }
                        label="Notificações por E-mail"
                        sx={{ color: colors.secondary }}
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={configuracoes.notificacoes.push}
                            onChange={(e) => setConfiguracoes({
                              ...configuracoes,
                              notificacoes: {
                                ...configuracoes.notificacoes,
                                push: e.target.checked
                              }
                            })}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: colors.accent,
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: colors.accent,
                              },
                            }}
                          />
                        }
                        label="Notificações Push"
                        sx={{ color: colors.secondary }}
                      />
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ p: 3, border: `1px solid ${colors.lightGray}20` }}>
                    <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                      Tipos de Notificação
                    </Typography>
                    
                    <Box display="flex" flexDirection="column" gap={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={configuracoes.notificacoes.novosLaudos}
                            onChange={(e) => setConfiguracoes({
                              ...configuracoes,
                              notificacoes: {
                                ...configuracoes.notificacoes,
                                novosLaudos: e.target.checked
                              }
                            })}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: colors.accent,
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: colors.accent,
                              },
                            }}
                          />
                        }
                        label="Novos laudos criados"
                        sx={{ color: colors.secondary }}
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={configuracoes.notificacoes.relatorios}
                            onChange={(e) => setConfiguracoes({
                              ...configuracoes,
                              notificacoes: {
                                ...configuracoes.notificacoes,
                                relatorios: e.target.checked
                              }
                            })}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: colors.accent,
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: colors.accent,
                              },
                            }}
                          />
                        }
                        label="Relatórios finalizados"
                        sx={{ color: colors.secondary }}
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={configuracoes.notificacoes.alteracoesCaso}
                            onChange={(e) => setConfiguracoes({
                              ...configuracoes,
                              notificacoes: {
                                ...configuracoes.notificacoes,
                                alteracoesCaso: e.target.checked
                              }
                            })}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: colors.accent,
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: colors.accent,
                              },
                            }}
                          />
                        }
                        label="Alterações em casos"
                        sx={{ color: colors.secondary }}
                      />
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSalvarConfiguracoes}
                      sx={{
                        bgcolor: colors.charcoal,
                        '&:hover': { bgcolor: colors.primary }
                      }}
                    >
                      Salvar Notificações
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Segurança Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 600, mb: 3 }}>
                Configurações de Segurança
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <strong>Importante:</strong> Algumas configurações de segurança podem afetar o acesso ao sistema. 
                    Certifique-se de entender as implicações antes de fazer alterações.
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ p: 3, border: `1px solid ${colors.lightGray}20` }}>
                    <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                      Autenticação
                    </Typography>
                    
                    <Box display="flex" flexDirection="column" gap={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={configuracoes.seguranca.autenticacaoDupla}
                            onChange={(e) => setConfiguracoes({
                              ...configuracoes,
                              seguranca: {
                                ...configuracoes.seguranca,
                                autenticacaoDupla: e.target.checked
                              }
                            })}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: colors.accent,
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: colors.accent,
                              },
                            }}
                          />
                        }
                        label="Autenticação de dois fatores (2FA)"
                        sx={{ color: colors.secondary }}
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={configuracoes.seguranca.sessaoAutomatica}
                            onChange={(e) => setConfiguracoes({
                              ...configuracoes,
                              seguranca: {
                                ...configuracoes.seguranca,
                                sessaoAutomatica: e.target.checked
                              }
                            })}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: colors.accent,
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: colors.accent,
                              },
                            }}
                          />
                        }
                        label="Manter sessão ativa automaticamente"
                        sx={{ color: colors.secondary }}
                      />
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ p: 3, border: `1px solid ${colors.lightGray}20` }}>
                    <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                      Auditoria e Logs
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={configuracoes.seguranca.logAtividades}
                          onChange={(e) => setConfiguracoes({
                            ...configuracoes,
                            seguranca: {
                              ...configuracoes.seguranca,
                              logAtividades: e.target.checked
                            }
                          })}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: colors.accent,
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: colors.accent,
                            },
                          }}
                        />
                      }
                      label="Registrar log de atividades"
                      sx={{ color: colors.secondary }}
                    />
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ p: 3, border: `1px solid ${colors.lightGray}20` }}>
                    <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 600 }}>
                      Alterar Senha
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Senha atual"
                          type="password"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: colors.secondary },
                              '&.Mui-focused fieldset': { borderColor: colors.primary }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Nova senha"
                          type="password"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: colors.secondary },
                              '&.Mui-focused fieldset': { borderColor: colors.primary }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Confirmar nova senha"
                          type="password"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: colors.secondary },
                              '&.Mui-focused fieldset': { borderColor: colors.primary }
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                    
                    <Box display="flex" justifyContent="flex-end" mt={2}>
                      <Button
                        variant="outlined"
                        sx={{
                          color: colors.accent,
                          borderColor: colors.accent,
                          '&:hover': { 
                            borderColor: colors.error,
                            bgcolor: `${colors.accent}10`
                          }
                        }}
                      >
                        Alterar Senha
                      </Button>
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSalvarConfiguracoes}
                      sx={{
                        bgcolor: colors.charcoal,
                        '&:hover': { bgcolor: colors.primary }
                      }}
                    >
                      Salvar Configurações
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>
    </Layout>
  );
};

export default Ajustes;