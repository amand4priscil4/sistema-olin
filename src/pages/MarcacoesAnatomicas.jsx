import React, { useState, useEffect, useRef } from 'react';
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
  ListItemSecondaryAction,
  Tooltip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  NavigateNext as NavigateNextIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  ZoomIn as ZoomInIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { colors } from '../styles/colors';
import api from '../service/api';

const MarcacoesAnatomicas = () => {
  const { vitimaId } = useParams();
  const navigate = useNavigate();
  const imageRef = useRef(null);
  
  const [vitima, setVitima] = useState(null);
  const [marcacoes, setMarcacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Estados para seleção de anatomia
  const [anatomiaSelecionada, setAnatomiaSelecionada] = useState({
    categoria: 'corpo_inteiro',
    vista: 'anterior',
    faixaEtaria: 'adulto',
    sexo: 'masculino',
    lateralidade: 'direita'
  });

  // Estados para modal de marcação
  const [showMarcacaoModal, setShowMarcacaoModal] = useState(false);
  const [marcacaoEditando, setMarcacaoEditando] = useState(null);
  const [novaMarcacao, setNovaMarcacao] = useState({
    tipo: '',
    regiao: { codigo: '', nome: '' },
    descricao: '',
    observacoes: '',
    cor: '#FF0000',
    tamanho: 8,
    coordenadas: { x: 0, y: 0 }
  });

  // Estados para tipos de anatomia
  const [tiposAnatomia, setTiposAnatomia] = useState({
    categorias: [],
    vistas: {},
    tipos: []
  });

  // Configuração de imagens anatômicas
  const imagensAnatomicas = {
    corpo_inteiro: {
      anterior: {
        masculino: { adulto: '/images/anatomia/homem_anterior.png' },
        feminino: { adulto: '/images/anatomia/mulher_anterior.png' }
      },
      posterior: {
        masculino: { adulto: '/images/anatomia/homem_posterior.png' },
        feminino: { adulto: '/images/anatomia/mulher_posterior.png' }
      },
      lateral_direita: {
        masculino: { adulto: '/images/anatomia/homem_lateral_direita.png' },
        feminino: { adulto: '/images/anatomia/mulher_lateral_direita.png' }
      }
    },
    cabeca_cranio: {
      anterior: { 
        masculino: { adulto: '/images/anatomia/cranio_anterior.png' },
        feminino: { adulto: '/images/anatomia/cranio_anterior.png' }
      },
      lateral_direita: { 
        masculino: { adulto: '/images/anatomia/cranio_lateral.png' },
        feminino: { adulto: '/images/anatomia/cranio_lateral.png' }
      }
    },
    maos: {
      palmar: {
        direita: { adulto: '/images/anatomia/mao_direita_palmar.png' },
        esquerda: { adulto: '/images/anatomia/mao_esquerda_palmar.png' }
      },
      dorsal: {
        direita: { adulto: '/images/anatomia/mao_direita_dorsal.png' },
        esquerda: { adulto: '/images/anatomia/mao_esquerda_dorsal.png' }
      }
    },
    pes: {
      plantar: {
        direito: { adulto: '/images/anatomia/pe_direito_plantar.png' },
        esquerdo: { adulto: '/images/anatomia/pe_esquerdo_plantar.png' }
      },
      anterior: {
        direito: { adulto: '/images/anatomia/pe_direito_anterior.png' },
        esquerdo: { adulto: '/images/anatomia/pe_esquerdo_anterior.png' }
      }
    }
  };

  useEffect(() => {
    carregarDados();
    carregarTiposAnatomia();
  }, [vitimaId]);

  useEffect(() => {
    if (anatomiaSelecionada) {
      carregarMarcacoes();
    }
  }, [anatomiaSelecionada]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/vitimas/${vitimaId}`);
      setVitima(response.data);
    } catch (error) {
      console.error('Erro ao carregar vítima:', error);
      setError('Erro ao carregar dados da vítima');
    } finally {
      setLoading(false);
    }
  };

  const carregarTiposAnatomia = async () => {
    try {
      const response = await api.get('/api/marcacoes/tipos/anatomia');
      setTiposAnatomia(response.data);
    } catch (error) {
      console.error('Erro ao carregar tipos anatomia:', error);
    }
  };

  const carregarMarcacoes = async () => {
    try {
      const params = new URLSearchParams({
        categoria: anatomiaSelecionada.categoria,
        vista: anatomiaSelecionada.vista
      });

      const response = await api.get(`/api/marcacoes/vitima/${vitimaId}?${params}`);
      setMarcacoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar marcações:', error);
    }
  };

  const obterImagemAtual = () => {
    const { categoria, vista, sexo, faixaEtaria, lateralidade } = anatomiaSelecionada;
    
    try {
      if (categoria === 'corpo_inteiro') {
        return imagensAnatomicas[categoria][vista][sexo][faixaEtaria];
      } else if (categoria === 'cabeca_cranio') {
        return imagensAnatomicas[categoria][vista][sexo || 'masculino'][faixaEtaria];
      } else if (['maos', 'pes'].includes(categoria)) {
        return imagensAnatomicas[categoria][vista][lateralidade][faixaEtaria];
      }
    } catch (error) {
      console.error('Erro ao obter imagem:', error);
    }
    
    return '/images/anatomia/default.png';
  };

  const handleImagemClick = (event) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setNovaMarcacao({
      ...novaMarcacao,
      coordenadas: { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 }
    });
    setShowMarcacaoModal(true);
  };

  const handleSalvarMarcacao = async () => {
    try {
      if (!novaMarcacao.tipo || !novaMarcacao.regiao.nome || !novaMarcacao.descricao) {
        alert('Preencha todos os campos obrigatórios');
        return;
      }

      setSaving(true);

      const dadosMarcacao = {
        ...novaMarcacao,
        anatomia: {
          ...anatomiaSelecionada,
          imagemArquivo: obterImagemAtual()
        }
      };

      if (marcacaoEditando) {
        await api.put(`/api/marcacoes/${marcacaoEditando._id}`, dadosMarcacao);
      } else {
        await api.post(`/api/marcacoes/vitima/${vitimaId}`, dadosMarcacao);
      }

      await carregarMarcacoes();
      setShowMarcacaoModal(false);
      resetarMarcacao();

    } catch (error) {
      console.error('Erro ao salvar marcação:', error);
      alert('Erro ao salvar marcação');
    } finally {
      setSaving(false);
    }
  };

  const handleEditarMarcacao = (marcacao) => {
    setMarcacaoEditando(marcacao);
    setNovaMarcacao({
      tipo: marcacao.tipo,
      regiao: marcacao.regiao,
      descricao: marcacao.descricao,
      observacoes: marcacao.observacoes || '',
      cor: marcacao.cor,
      tamanho: marcacao.tamanho,
      coordenadas: marcacao.coordenadas
    });
    setShowMarcacaoModal(true);
  };

  const handleRemoverMarcacao = async (marcacaoId) => {
    if (!window.confirm('Tem certeza que deseja remover esta marcação?')) return;

    try {
      await api.delete(`/api/marcacoes/${marcacaoId}`);
      await carregarMarcacoes();
    } catch (error) {
      console.error('Erro ao remover marcação:', error);
      alert('Erro ao remover marcação');
    }
  };

  const resetarMarcacao = () => {
    setMarcacaoEditando(null);
    setNovaMarcacao({
      tipo: '',
      regiao: { codigo: '', nome: '' },
      descricao: '',
      observacoes: '',
      cor: '#FF0000',
      tamanho: 8,
      coordenadas: { x: 0, y: 0 }
    });
  };

  const renderMarcacoes = () => {
    return marcacoes.map((marcacao) => (
      <Box
        key={marcacao._id}
        sx={{
          position: 'absolute',
          left: `${marcacao.coordenadas.x}%`,
          top: `${marcacao.coordenadas.y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 10
        }}
      >
        <Tooltip title={`${marcacao.tipo}: ${marcacao.regiao.nome}`}>
          <Box
            sx={{
              width: marcacao.tamanho,
              height: marcacao.tamanho,
              borderRadius: '50%',
              backgroundColor: marcacao.cor,
              border: '2px solid white',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              '&:hover': {
                transform: 'scale(1.2)',
                transition: 'transform 0.2s ease'
              }
            }}
            onClick={() => handleEditarMarcacao(marcacao)}
          />
        </Tooltip>
      </Box>
    ));
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
          <CircularProgress size={50} sx={{ color: colors.primary }} />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Marcações Anatômicas">
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
              Marcações Anatômicas - {vitima?.nome}
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
                Marcações Anatômicas
              </Typography>
              <Typography variant="h6" sx={{ color: colors.secondary, mb: 1 }}>
                Vítima: {vitima?.nome}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.lightSlateGray }}>
                NIC: {vitima?.nic} | Caso: {vitima?.caso.titulo}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/casos/ver/${vitima?.caso._id}`)}
              sx={{
                bgcolor: colors.steelBlue,
                color: 'white',
                '&:hover': { bgcolor: colors.primary }
              }}
            >
              Voltar ao Caso
            </Button>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Painel de Controle */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600, mb: 2 }}>
                Seleção de Anatomia
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={anatomiaSelecionada.categoria}
                  onChange={(e) => setAnatomiaSelecionada({
                    ...anatomiaSelecionada,
                    categoria: e.target.value,
                    vista: tiposAnatomia.vistas[e.target.value]?.[0] || ''
                  })}
                  label="Categoria"
                >
                  {tiposAnatomia.categorias.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat.replace('_', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Vista</InputLabel>
                <Select
                  value={anatomiaSelecionada.vista}
                  onChange={(e) => setAnatomiaSelecionada({
                    ...anatomiaSelecionada,
                    vista: e.target.value
                  })}
                  label="Vista"
                >
                  {(tiposAnatomia.vistas[anatomiaSelecionada.categoria] || []).map((vista) => (
                    <MenuItem key={vista} value={vista}>
                      {vista.replace('_', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {anatomiaSelecionada.categoria === 'corpo_inteiro' && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Sexo</InputLabel>
                  <Select
                    value={anatomiaSelecionada.sexo}
                    onChange={(e) => setAnatomiaSelecionada({
                      ...anatomiaSelecionada,
                      sexo: e.target.value
                    })}
                    label="Sexo"
                  >
                    <MenuItem value="masculino">Masculino</MenuItem>
                    <MenuItem value="feminino">Feminino</MenuItem>
                  </Select>
                </FormControl>
              )}

              {['maos', 'pes'].includes(anatomiaSelecionada.categoria) && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Lateralidade</InputLabel>
                  <Select
                    value={anatomiaSelecionada.lateralidade}
                    onChange={(e) => setAnatomiaSelecionada({
                      ...anatomiaSelecionada,
                      lateralidade: e.target.value
                    })}
                    label="Lateralidade"
                  >
                    <MenuItem value="direita">Direita</MenuItem>
                    <MenuItem value="esquerda">Esquerda</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Paper>

            {/* Lista de Marcações */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600, mb: 2 }}>
                Marcações ({marcacoes.length})
              </Typography>

              <List>
                {marcacoes.map((marcacao) => (
                  <ListItem key={marcacao._id} divider>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: marcacao.cor
                            }}
                          />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {marcacao.regiao.nome}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: colors.secondary }}>
                            Tipo: {marcacao.tipo}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.lightSlateGray }}>
                            {marcacao.descricao}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        onClick={() => handleEditarMarcacao(marcacao)}
                        sx={{ color: colors.primary, mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleRemoverMarcacao(marcacao._id)}
                        sx={{ color: '#F44336' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {marcacoes.length === 0 && (
                  <Typography variant="body2" sx={{ color: colors.lightSlateGray, textAlign: 'center', py: 2 }}>
                    Nenhuma marcação encontrada
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>

          {/* Área da Imagem */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600, mb: 2 }}>
                {anatomiaSelecionada.categoria.replace('_', ' ').toUpperCase()} - {anatomiaSelecionada.vista.replace('_', ' ').toUpperCase()}
              </Typography>

              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 400,
                  border: `2px dashed ${colors.lightSlateGray}40`,
                  borderRadius: 2,
                  cursor: 'crosshair'
                }}
                onClick={handleImagemClick}
              >
                <img
                  ref={imageRef}
                  src={obterImagemAtual()}
                  alt="Anatomia"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '600px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.src = '/images/anatomia/default.png';
                  }}
                />
                {renderMarcacoes()}
              </Box>

              <Typography variant="caption" sx={{ color: colors.lightSlateGray, display: 'block', mt: 2, textAlign: 'center' }}>
                Clique na imagem para adicionar uma nova marcação
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Modal para Adicionar/Editar Marcação */}
        <Dialog 
          open={showMarcacaoModal} 
          onClose={() => setShowMarcacaoModal(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: colors.primary, color: 'white', fontWeight: 600 }}>
            {marcacaoEditando ? 'Editar Marcação' : 'Nova Marcação'}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
              <InputLabel>Tipo de Marcação</InputLabel>
              <Select
                value={novaMarcacao.tipo}
                onChange={(e) => setNovaMarcacao({...novaMarcacao, tipo: e.target.value})}
                label="Tipo de Marcação"
              >
                {tiposAnatomia.tipos.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Nome da Região"
              value={novaMarcacao.regiao.nome}
              onChange={(e) => setNovaMarcacao({
                ...novaMarcacao,
                regiao: { ...novaMarcacao.regiao, nome: e.target.value }
              })}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Descrição"
              multiline
              rows={3}
              value={novaMarcacao.descricao}
              onChange={(e) => setNovaMarcacao({...novaMarcacao, descricao: e.target.value})}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Observações"
              multiline
              rows={2}
              value={novaMarcacao.observacoes}
              onChange={(e) => setNovaMarcacao({...novaMarcacao, observacoes: e.target.value})}
              sx={{ mb: 2 }}
            />

            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <TextField
                label="Cor"
                type="color"
                value={novaMarcacao.cor}
                onChange={(e) => setNovaMarcacao({...novaMarcacao, cor: e.target.value})}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Tamanho"
                type="number"
                value={novaMarcacao.tamanho}
                onChange={(e) => setNovaMarcacao({...novaMarcacao, tamanho: parseInt(e.target.value)})}
                inputProps={{ min: 4, max: 20 }}
                sx={{ flex: 1 }}
              />
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                label="X (%)"
                type="number"
                value={novaMarcacao.coordenadas.x}
                onChange={(e) => setNovaMarcacao({
                  ...novaMarcacao,
                  coordenadas: { ...novaMarcacao.coordenadas, x: parseFloat(e.target.value) }
                })}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Y (%)"
                type="number"
                value={novaMarcacao.coordenadas.y}
                onChange={(e) => setNovaMarcacao({
                  ...novaMarcacao,
                  coordenadas: { ...novaMarcacao.coordenadas, y: parseFloat(e.target.value) }
                })}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                sx={{ flex: 1 }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setShowMarcacaoModal(false)}
              sx={{ color: colors.secondary }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSalvarMarcacao}
              variant="contained"
              disabled={saving}
              sx={{
                bgcolor: colors.primary,
                '&:hover': { bgcolor: colors.secondary }
              }}
            >
              {saving ? <CircularProgress size={20} /> : 'Salvar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default MarcacoesAnatomicas;