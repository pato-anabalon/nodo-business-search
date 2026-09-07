import { createTheme, type Theme } from '@mui/material/styles';
import { nodoColors } from './palette';

export type ThemeMode = 'light' | 'dark';

const commonTypography = {
  fontFamily: [
    'system-ui',
    '-apple-system',
    'Segoe UI',
    'Roboto',
    'Helvetica',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: { fontWeight: 700 },
  h2: { fontWeight: 700 },
  h3: { fontWeight: 600 },
  button: { textTransform: 'none' as const, fontWeight: 600 },
};

const commonShape = { borderRadius: 12 };

export const createNodoTheme = (mode: ThemeMode): Theme =>
  createTheme({
    palette: {
      mode,
      primary: { main: nodoColors.purple, light: nodoColors.violet, dark: '#5b21b6' },
      secondary: { main: nodoColors.pink },
      background:
        mode === 'dark'
          ? { default: nodoColors.background, paper: nodoColors.ink }
          : { default: '#fafafa', paper: nodoColors.white },
      text:
        mode === 'dark'
          ? { primary: nodoColors.foreground, secondary: nodoColors.muted }
          : { primary: nodoColors.black, secondary: '#4b4757' },
      divider: mode === 'dark' ? nodoColors.line : 'rgba(0, 0, 0, 0.12)',
    },
    typography: commonTypography,
    shape: commonShape,
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: mode === 'dark' ? nodoColors.headerSurface : nodoColors.white,
            color: mode === 'dark' ? nodoColors.foreground : nodoColors.black,
            borderBottom: `1px solid ${mode === 'dark' ? nodoColors.line : 'rgba(0,0,0,0.08)'}`,
            backdropFilter: 'blur(8px)',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
    },
  });
