import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { getTranslations } from 'next-intl/server';
import type { DashboardMetrics } from '@/lib/metrics';

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <Paper sx={{ p: 3, minWidth: 180, flex: '1 1 200px' }}>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      )}
    </Paper>
  );
}

interface DashboardProps {
  metrics: DashboardMetrics;
}

export async function Dashboard({ metrics }: DashboardProps) {
  const t = await getTranslations('dashboard');

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <MetricCard
          label={t('searchesTotal')}
          value={metrics.searches.last30d}
          hint={`7d: ${metrics.searches.last7d}`}
        />
        <MetricCard
          label={t('leadsTotal')}
          value={metrics.leads.total}
          hint={`Today: ${metrics.leads.today}`}
        />
        <MetricCard
          label={t('leadsExported')}
          value={metrics.exports.total}
          hint={`Today: ${metrics.exports.today}`}
        />
        <MetricCard label={t('exportRate')} value={`${metrics.exportRate}%`} />
      </Stack>

      <Box>
        <Typography variant="h6" gutterBottom>
          {t('topCategories')}
        </Typography>
        <Paper sx={{ p: 2 }}>
          {metrics.topCategories.length === 0 ? (
            <Typography color="text.secondary">—</Typography>
          ) : (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {metrics.topCategories.map((c) => (
                <Chip key={c.category ?? 'unknown'} label={`${c.category ?? '—'} · ${c.count}`} />
              ))}
            </Stack>
          )}
        </Paper>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          {t('recentSearches')}
        </Typography>
        <Paper sx={{ p: 2 }}>
          {metrics.recentSearches.length === 0 ? (
            <Typography color="text.secondary">—</Typography>
          ) : (
            <Stack spacing={1}>
              {metrics.recentSearches.map((s) => (
                <Stack
                  key={s.id}
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                >
                  <Typography sx={{ flex: 1 }}>{s.query}</Typography>
                  <Chip size="small" label={`${s.resultsCount} results`} />
                  <Chip size="small" color="primary" label={`${s.leadsCreated} new`} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(s.createdAt).toLocaleString()}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    </Stack>
  );
}
