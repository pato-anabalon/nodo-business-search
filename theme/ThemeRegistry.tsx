'use client';

import { useMemo, useState, useCallback } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createNodoTheme, type ThemeMode } from './theme';
import { ThemeModeContext } from './ThemeModeContext';

const THEME_COOKIE = 'nodo-theme';

interface ThemeRegistryProps {
  initialMode: ThemeMode;
  children: React.ReactNode;
}

export function ThemeRegistry({ initialMode, children }: ThemeRegistryProps) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
      return next;
    });
  }, []);

  const theme = useMemo(() => createNodoTheme(mode), [mode]);
  const contextValue = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeModeContext.Provider value={contextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          {children}
        </ThemeProvider>
      </ThemeModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
