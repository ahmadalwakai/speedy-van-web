import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    primary: {
      50: '#e6f0ff',
      100: '#b3d1ff',
      500: '#3b82f6',
      900: '#1e40af',
    },
    secondary: {
      50: '#f5e8ff',
      100: '#d8b4fe',
      500: '#8b5cf6',
      900: '#4c1d95',
    },
    background: {
      light: 'gray.50',
      dark: 'gray.800',
    },
    text: {
      primary: {
        light: 'blue.800',
        dark: 'blue.300',
      },
      secondary: {
        light: 'gray.600',
        dark: 'gray.300',
      },
    },
    header: {
      bg: {
        light: 'white',
        dark: 'gray.800',
      },
      text: {
        light: 'blue.800',
        dark: 'blue.300',
      },
    },
    footer: {
      bg: {
        light: 'blue.800',
        dark: 'gray.900',
      },
      text: 'white',
    },
  },
  fonts: {
    heading: 'Tajawal, Poppins, sans-serif',
    body: 'Tajawal, Poppins, sans-serif',
  },
});

export default theme;