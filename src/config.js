// Configuración global de la aplicación

export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  info: '#5856D6',
  light: '#F2F2F7',
  dark: '#1C1C1E',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    100: '#F2F2F7',
    200: '#E5E5EA',
    300: '#D1D1D6',
    400: '#C7C7CC',
    500: '#AEAEB2',
    600: '#8E8E93',
    700: '#636366',
    800: '#48484A',
    900: '#3A3A3C'
  }
};

export const VALIDATION_RULES = {
  email: {
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'Por favor ingrese un email válido'
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
  },
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'El nombre de usuario debe tener entre 3 y 20 caracteres y solo puede contener letras, números y guiones bajos'
  }
};

export const BREAKPOINTS = {
  xs: '320px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px'
};

export const SPACING = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  xxl: '3rem'     // 48px
};

export const TYPOGRAPHY = {
  fontFamily: {
    primary: 'Inter, sans-serif',
    secondary: 'Roboto, sans-serif'
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    xxl: '1.5rem'     // 24px
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
};

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060
};

// Configuración de la API
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
}; 