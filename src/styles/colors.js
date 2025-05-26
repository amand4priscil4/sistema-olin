// src/styles/colors.js
export const colors = {
  // Azuis
  midnightNavy: '#071739',    // Azul-marinho escuro, quase preto
  steelBlue: '#4B6382',       // Azul aço suave
  lightSlateGray: '#A4B5C4',  // Cinza azulado claro
  gainsboro: '#CDD5DB',       // Cinza muito claro com toque azulado
  
  // Terrosos
  khakiBrown: '#A68866',      // Marrom cáqui suave
  desertSand: '#E3C39D',      // Areia do deserto, bege quente
  
  // Aliases para facilitar uso
  primary: '#071739',         // midnightNavy
  secondary: '#4B6382',       // steelBlue
  accent: '#A68866',          // khakiBrown
  background: '#F5F5F5',      // cinza claro 
  surface: '#A4B5C4',         // lightSlateGray
  warm: '#E3C39D'             // desertSand
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
  }
};

export default colors;