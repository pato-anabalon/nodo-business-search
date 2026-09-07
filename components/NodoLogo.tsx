'use client';

import Image from 'next/image';
import { useTheme } from '@mui/material/styles';

interface NodoLogoProps {
  height?: number;
  priority?: boolean;
}

export function NodoLogo({ height = 32, priority = false }: NodoLogoProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const src = isDark ? '/nodo-logo-transparent.png' : '/nodo-logo-black.png';
  const width = Math.round(height * (766 / 320));

  return (
    <Image
      src={src}
      alt="Nodo"
      width={width}
      height={height}
      priority={priority}
      style={{ height, width: 'auto' }}
    />
  );
}
