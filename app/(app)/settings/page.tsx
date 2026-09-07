import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

export default async function SettingsPage() {
  const t = await getTranslations('common');
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('theme')} / {t('language')}
      </Typography>
      <Paper sx={{ p: 3, mt: 2, maxWidth: 480 }}>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Usa los controles del encabezado para cambiar tema e idioma. Persisten via cookie.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
