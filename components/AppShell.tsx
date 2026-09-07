'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslations } from 'next-intl';
import { NodoLogo } from './NodoLogo';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserMenu } from './UserMenu';

const DRAWER_WIDTH = 240;

interface AppShellProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: t('dashboard'), icon: <DashboardIcon /> },
    { href: '/search', label: t('search'), icon: <SearchIcon /> },
    { href: '/leads', label: t('leads'), icon: <PeopleIcon /> },
    { href: '/settings', label: t('settings'), icon: <SettingsIcon /> },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 2 }}>
        <NodoLogo height={28} priority />
      </Toolbar>
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => {
          const selected = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={selected}
              onClick={() => setMobileOpen(false)}
              sx={{
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'inherit' },
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, ml: { md: `${DRAWER_WIDTH}px` } }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen((v) => !v)}
            sx={{ mr: 2, display: { md: 'none' } }}
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <LanguageSwitcher />
          <ThemeSwitcher />
          <UserMenu name={user.name} email={user.email} image={user.image} />
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
