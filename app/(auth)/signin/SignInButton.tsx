'use client';

import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';
import { signIn } from 'next-auth/react';

interface SignInButtonProps {
  label: string;
  callbackUrl?: string;
}

export function SignInButton({ label, callbackUrl }: SignInButtonProps) {
  return (
    <Button
      variant="contained"
      size="large"
      startIcon={<GoogleIcon />}
      onClick={() => signIn('google', { callbackUrl: callbackUrl ?? '/dashboard' })}
      fullWidth
    >
      {label}
    </Button>
  );
}
