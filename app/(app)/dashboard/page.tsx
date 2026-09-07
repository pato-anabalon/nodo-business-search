import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';
import { Dashboard } from '@/components/Dashboard';
import { getDashboardMetrics } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [t, metrics] = await Promise.all([getTranslations('dashboard'), getDashboardMetrics()]);
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('title')}
      </Typography>
      <Dashboard metrics={metrics} />
    </Box>
  );
}
