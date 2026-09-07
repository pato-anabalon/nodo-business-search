'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useTranslations } from 'next-intl';

interface Lead {
  id: string;
  placeId: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  category?: string | null;
}

interface SearchResponse {
  searchId: string;
  totalResults: number;
  leadsWithoutWebsite: number;
  leadsCreated: number;
  leads: Lead[];
}

export function SearchForm() {
  const t = useTranslations('search');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);

  const runSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        throw new Error(body.message ?? body.error ?? `HTTP ${res.status}`);
      }
      const json = (await res.json()) as SearchResponse;
      setResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown_error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label={t('queryPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void runSearch();
            }}
            disabled={loading}
          />
          <Button
            variant="contained"
            size="large"
            onClick={runSearch}
            disabled={loading || query.trim().length < 3}
          >
            {loading ? '…' : t('run')}
          </Button>
        </Stack>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      {result && (
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
            <Chip label={t('resultsFound', { count: result.leadsWithoutWebsite })} />
            <Chip label={t('leadsCreated', { count: result.leadsCreated })} color="primary" />
          </Stack>
          {result.leads.length === 0 ? (
            <Typography color="text.secondary">
              No leads without a website in this search.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>
                        {lead.category && <Chip size="small" label={lead.category} />}
                      </TableCell>
                      <TableCell>{lead.phone ?? '—'}</TableCell>
                      <TableCell>{lead.address ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      <Box sx={{ opacity: 0.7 }}>
        <Typography variant="caption">
          Tip: use queries like &ldquo;cafe in Ponsonby auckland&rdquo; or &ldquo;plumber in
          Henderson auckland&rdquo;.
        </Typography>
      </Box>
    </Stack>
  );
}
