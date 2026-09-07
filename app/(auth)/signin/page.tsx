import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { NodoLogo } from '@/components/NodoLogo';
import { SignInButton } from './SignInButton';

interface SignInPageProps {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  if (session) redirect('/dashboard');

  const params = await searchParams;
  const t = await getTranslations('auth');
  const error = params.error;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 3,
        background: 'radial-gradient(circle at top, rgba(124,58,237,0.15), transparent 60%)',
      }}
    >
      <Paper sx={{ p: 5, maxWidth: 420, width: '100%', textAlign: 'center' }} elevation={2}>
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <NodoLogo height={36} priority />
          <Typography variant="h5" component="h1">
            {t('signInTitle')}
          </Typography>
          {error && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'error.main',
                color: 'error.contrastText',
                width: '100%',
              }}
            >
              <Typography variant="subtitle2">{t('unauthorizedTitle')}</Typography>
              <Typography variant="body2">{t('unauthorizedBody')}</Typography>
            </Box>
          )}
          <SignInButton label={t('signInWithGoogle')} callbackUrl={params.callbackUrl} />
        </Stack>
      </Paper>
    </Box>
  );
}
