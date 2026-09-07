'use client';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTranslations } from 'next-intl';
import { useThemeMode } from '@/theme/ThemeModeContext';

export function ThemeSwitcher() {
  const { mode, toggleMode } = useThemeMode();
  const t = useTranslations('common');
  const label = mode === 'dark' ? t('themeLight') : t('themeDark');

  return (
    <Tooltip title={label}>
      <IconButton onClick={toggleMode} aria-label={label} color="inherit">
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
