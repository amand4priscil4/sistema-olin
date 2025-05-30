// src/styles/colors.js
export const colors = {
  // Azuis
  midnightNavy: '#071739',      // Azul-marinho escuro, quase preto
  steelBlue: '#4B6382',         // Azul aço suave
  lightSlateGray: '#A4B5C4',    // Cinza azulado claro
  gainsboro: '#CDD5DB',         // Cinza muito claro com toque azulado
  
  // Nova paleta - tons terrosos e neutros
  darkTeal: '#3D4D55',          // Azul petróleo escuro
  grayBlue: '#A79E9C',          // Cinza azulado
  lightGray: '#D3C3B9',         // Cinza claro
  warmBeige: '#B58863',         // Bege/caramelo
  
  // Terrosos originais
  desertSand: '#E3C39D',        // Areia do deserto, bege quente
  
  // Aliases para facilitar uso
  primary: '#3D4D55',           // darkTeal
  secondary: '#A79E9C',         // grayBlue
  accent: '#B58863',            // warmBeige
  background: '#F5F5F5',        // cinza claro neutro
  surface: '#FFFFFF',           // branco para cards/modais
  warm: '#E3C39D',              // desertSand
  
  // Estados e feedback
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Texto
  textPrimary: '#3D4D55',
  textSecondary: '#A79E9C',
  textDisabled: '#D3C3B9'
};

// Variações automáticas (mais claro/escuro)
export const colorVariants = {
  midnightNavy: {
    50: '#E8EAED',
    100: '#C5CAD3',
    200: '#9FA6B6',
    300: '#788299',
    400: '#5B6883',
    500: '#071739',   // cor base
    600: '#061530',
    700: '#051225',
    800: '#040E1B',
    900: '#020812'
  },
  
  steelBlue: {
    50: '#F0F2F5',
    100: '#D9DFE6',
    200: '#C0CAD5',
    300: '#A7B4C4',
    400: '#94A3B7',
    500: '#4B6382',   // cor base
    600: '#435A76',
    700: '#394F67',
    800: '#2F4458',
    900: '#1F2D3C'
  },
  
  darkTeal: {
    50: '#F2F3F4',
    100: '#E0E2E4',
    200: '#CCCED2',
    300: '#B7BBBF',
    400: '#A8ADB2',
    500: '#3D4D55',   // cor base
    600: '#37464C',
    700: '#2F3C42',
    800: '#273338',
    900: '#1A2327'
  },
  
  warmBeige: {
    50: '#FAF8F6',
    100: '#F2EDE8',
    200: '#E9E1D8',
    300: '#E0D4C8',
    400: '#D9CABB',
    500: '#B58863',   // cor base
    600: '#A67B59',
    700: '#956C4D',
    800: '#845D41',
    900: '#6A4A2F'
  }
};

// Utilitários para uso comum
export const getColorWithOpacity = (color, opacity) => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

// Paletas pré-definidas para casos específicos
export const statusColors = {
  'em andamento': colors.warmBeige,
  'finalizado': colors.darkTeal,
  'arquivado': colors.grayBlue,
  'pendente': colors.warning,
  'cancelado': colors.error
};

export const buttonVariants = {
  primary: {
    background: colors.lightGray,
    color: colors.darkTeal,
    hover: colors.darkTeal,
    hoverText: '#FFFFFF'
  },
  secondary: {
    background: colors.grayBlue,
    color: '#FFFFFF',
    hover: colors.darkTeal,
    hoverText: '#FFFFFF'
  },
  accent: {
    background: colors.warmBeige,
    color: '#FFFFFF',
    hover: colors.darkTeal,
    hoverText: '#FFFFFF'
  }
};

export default colors;