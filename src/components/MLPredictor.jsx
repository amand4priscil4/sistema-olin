// src/components/MLPredictor.jsx
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { PsychologyOutlined } from '@mui/icons-material';
import { useMLPredict } from '../hooks/useML';

const TIPOS_CASO = [
  'acidente',
  'identificação de vítima', 
  'exame criminal',
  'exumação',
  'violência doméstica',
  'avaliação de idade',
  'avaliação de lesões',
  'avaliação de danos corporais'
];

function MLPredictor() {
  const [tipo, setTipo] = useState('');
  const [localDoCaso, setLocalDoCaso] = useState('');
  const [prediction, setPrediction] = useState(null);
  const { predict, loading, error } = useMLPredict();

  const handlePredict = async () => {
    if (!tipo || !localDoCaso) return;
    
    try {
      const result = await predict(tipo, localDoCaso);
      setPrediction(result);
    } catch (err) {
      console.error('Erro na predição:', err);
      setPrediction(null);
    }
  };

  return (
    <Card sx={{ 
      border: '1px solid rgba(75, 99, 130, 0.05)',
      boxShadow: '0 4px 24px rgba(7, 23, 57, 0.06)'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PsychologyOutlined sx={{ mr: 1, color: '#4B6382' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#071739' }}>
            Predição de Status - IA
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            select
            label="Tipo do Caso"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            fullWidth
          >
            {TIPOS_CASO.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Local do Caso"
            value={localDoCaso}
            onChange={(e) => setLocalDoCaso(e.target.value)}
            fullWidth
            placeholder="Ex: Recife - PE"
          />
        </Box>

        <Button
          variant="contained"
          onClick={handlePredict}
          disabled={!tipo || !localDoCaso || loading}
          sx={{ 
            bgcolor: '#071739',
            '&:hover': { bgcolor: '#0a1d42' },
            mb: 2
          }}
        >
          {loading ? <CircularProgress size={20} /> : 'Prever Status'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {prediction && prediction.predicted_status && prediction.probabilities && (
          <Box sx={{ 
            p: 2, 
            bgcolor: 'rgba(7, 23, 57, 0.02)', 
            borderRadius: 1,
            border: '1px solid rgba(7, 23, 57, 0.1)'
          }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#071739' }}>
              Status Predito: <strong>{prediction.predicted_status}</strong>
            </Typography>
            
            {Object.entries(prediction.probabilities || {}).map(([status, prob]) => (
              <Box key={status} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">{status}</Typography>
                  <Typography variant="caption">{(prob * 100).toFixed(1)}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={prob * 100}
                  sx={{ 
                    bgcolor: 'rgba(75, 99, 130, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: status === prediction.predicted_status ? '#071739' : '#4B6382'
                    }
                  }}
                />
              </Box>
            ))}
          </Box>
        )}

        {prediction && prediction.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro do servidor: {prediction.error}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default MLPredictor;