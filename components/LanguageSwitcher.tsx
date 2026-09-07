'use client';

import { useState, useTransition } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import TranslateIcon from '@mui/icons-material/Translate';
import { useLocale, useTranslations } from 'next-intl';
import { setLocaleAction } from '@/lib/locale-actions';
import { locales, type Locale } from '@/i18n/config';

const LABELS: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};

export function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale;
  const t = useTranslations('common');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [, startTransition] = useTransition();

  const handleSelect = (locale: Locale) => {
    setAnchorEl(null);
    startTransition(() => {
      void setLocaleAction(locale);
    });
  };

  return (
    <>
      <Tooltip title={t('language')}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label={t('language')}
          color="inherit"
        >
          <TranslateIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {locales.map((locale) => (
          <MenuItem
            key={locale}
            selected={locale === currentLocale}
            onClick={() => handleSelect(locale)}
          >
            {LABELS[locale]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
