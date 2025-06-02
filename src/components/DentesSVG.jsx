// src/components/DentesSVG.jsx
import React from 'react';

// Função para determinar o tipo de dente baseado no número
const getTipoDente = (numeroDente, tipoOdontograma) => {
  const numero = parseInt(numeroDente);
  
  if (tipoOdontograma === 'adulto') {
    // Dentes permanentes
    const ultimoDigito = numero % 10;
    if (ultimoDigito === 1 || ultimoDigito === 2) return 'incisivo';
    if (ultimoDigito === 3) return 'canino';
    if (ultimoDigito === 4 || ultimoDigito === 5) return 'pre-molar';
    if (ultimoDigito === 6 || ultimoDigito === 7 || ultimoDigito === 8) return 'molar';
  } else {
    // Dentes decíduos
    const ultimoDigito = numero % 10;
    if (ultimoDigito === 1 || ultimoDigito === 2) return 'incisivo';
    if (ultimoDigito === 3) return 'canino';
    if (ultimoDigito === 4 || ultimoDigito === 5) return 'molar'; // Em decíduos, 4 e 5 são molares
  }
  
  return 'incisivo'; // fallback
};

// Componente principal do ícone do dente
export const DenteIcon = ({ numero, presente, cor, tamanho = 50, tipoOdontograma = 'adulto' }) => {
  const tipo = getTipoDente(numero, tipoOdontograma);
  
  return (
    <svg 
      width={tamanho} 
      height={tamanho * 1.2} 
      viewBox="0 0 32 40"
      style={{ filter: !presente ? 'grayscale(100%)' : 'none' }}
    >
      {/* Formato tradicional de odontograma - escudo com raízes */}
      <g>
        {/* Coroa - formato de escudo invertido */}
        <path
          d="M 8 4 C 6 4 4 6 4 8 L 4 16 C 4 20 8 24 16 24 C 24 24 28 20 28 16 L 28 8 C 28 6 26 4 24 4 Z"
          fill={presente ? cor : '#F5F5F5'}
          stroke={presente ? '#333' : '#F44336'}
          strokeWidth="1.5"
          opacity={presente ? 1 : 0.7}
        />
        
        {/* Raízes - baseadas no tipo de dente */}
        {tipo === 'incisivo' && (
          <g>
            {/* Uma raiz central */}
            <path
              d="M 15 24 L 15 34 C 15 35 15.5 36 16 36 C 16.5 36 17 35 17 34 L 17 24"
              fill="none"
              stroke={presente ? '#333' : '#F44336'}
              strokeWidth="1.5"
              opacity={presente ? 1 : 0.7}
            />
          </g>
        )}
        
        {tipo === 'canino' && (
          <g>
            {/* Uma raiz mais longa */}
            <path
              d="M 15 24 L 15 36 C 15 37 15.5 38 16 38 C 16.5 38 17 37 17 36 L 17 24"
              fill="none"
              stroke={presente ? '#333' : '#F44336'}
              strokeWidth="1.5"
              opacity={presente ? 1 : 0.7}
            />
          </g>
        )}
        
        {tipo === 'pre-molar' && (
          <g>
            {/* Duas raízes */}
            <path
              d="M 12 24 L 12 34 C 12 35 12.5 36 13 36 C 13.5 36 14 35 14 34 L 14 24"
              fill="none"
              stroke={presente ? '#333' : '#F44336'}
              strokeWidth="1.5"
              opacity={presente ? 1 : 0.7}
            />
            <path
              d="M 18 24 L 18 34 C 18 35 18.5 36 19 36 C 19.5 36 20 35 20 34 L 20 24"
              fill="none"
              stroke={presente ? '#333' : '#F44336'}
              strokeWidth="1.5"
              opacity={presente ? 1 : 0.7}
            />
          </g>
        )}
        
        {tipo === 'molar' && (
          <g>
            {/* Três raízes */}
            <path
              d="M 10 24 L 10 34 C 10 35 10.5 36 11 36 C 11.5 36 12 35 12 34 L 12 24"
              fill="none"
              stroke={presente ? '#333' : '#F44336'}
              strokeWidth="1.5"
              opacity={presente ? 1 : 0.7}
            />
            <path
              d="M 15 24 L 15 36 C 15 37 15.5 38 16 38 C 16.5 38 17 37 17 36 L 17 24"
              fill="none"
              stroke={presente ? '#333' : '#F44336'}
              strokeWidth="1.5"
              opacity={presente ? 1 : 0.7}
            />
            <path
              d="M 20 24 L 20 34 C 20 35 20.5 36 21 36 C 21.5 36 22 35 22 34 L 22 24"
              fill="none"
              stroke={presente ? '#333' : '#F44336'}
              strokeWidth="1.5"
              opacity={presente ? 1 : 0.7}
            />
          </g>
        )}
      </g>
      
      {/* X para dente ausente */}
      {!presente && (
        <>
          <line 
            x1="8" y1="8" 
            x2="24" y2="20" 
            stroke="#F44336" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <line 
            x1="24" y1="8" 
            x2="8" y2="20" 
            stroke="#F44336" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
};

export default DenteIcon;