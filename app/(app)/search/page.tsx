import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';
import { SearchForm } from '@/components/SearchForm';

export default async function SearchPage() {
  const t = await getTranslations('search');
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('title')}
      </Typography>
      <SearchForm />
    </Box>
  );
}
