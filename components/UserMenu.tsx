'use client';

import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';

interface UserMenuProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function UserMenu({ name, email, image }: UserMenuProps) {
  const t = useTranslations('common');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const initial = (name ?? email ?? '?').charAt(0).toUpperCase();

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="small"
        sx={{ ml: 1 }}
        aria-label={name ?? email ?? 'account'}
      >
        <Avatar src={image ?? undefined} sx={{ width: 32, height: 32 }}>
          {initial}
        </Avatar>
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
          {name && <Typography variant="body2">{name}</Typography>}
          {email && (
            <Typography variant="caption" color="text.secondary">
              {email}
            </Typography>
          )}
        </Box>
        <MenuItem onClick={() => signOut({ callbackUrl: '/signin' })}>{t('signOut')}</MenuItem>
      </Menu>
    </>
  );
}
