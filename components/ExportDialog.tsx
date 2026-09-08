'use client';

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslations } from 'next-intl';

interface ExportDialogProps {
  open: boolean;
  leadIds: string[];
  onClose: () => void;
  onExported: () => void;
}

interface ExportResponse {
  ok: number;
  failed: number;
  errors: { leadId: string; error: string }[];
}

export function ExportDialog({ open, leadIds, onClose, onExported }: ExportDialogProps) {
  const t = useTranslations('common');
  const tLeads = useTranslations('leads');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runExport = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/leads/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ExportResponse;
      setResult(json);
      if (json.ok > 0) onExported();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown_error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setResult(null);
    setError(null);
    onClose();
  };

  const isSuccess = result !== null && result.failed === 0;
  const showExportButton = !isSuccess;
  const closeLabel = isSuccess ? t('close') : t('cancel');

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{tLeads('export')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {!result && <Typography>{tLeads('exportConfirm', { count: leadIds.length })}</Typography>}
          {error && <Alert severity="error">{error}</Alert>}
          {result && (
            <Alert severity={result.failed === 0 ? 'success' : 'warning'}>
              {tLeads('exportResult', { ok: result.ok, failed: result.failed })}
              {result.errors.length > 0 && (
                <ul>
                  {result.errors.slice(0, 3).map((e) => (
                    <li key={e.leadId}>{e.error}</li>
                  ))}
                </ul>
              )}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {closeLabel}
        </Button>
        {showExportButton && (
          <Button
            onClick={runExport}
            variant="contained"
            disabled={loading || leadIds.length === 0}
          >
            {loading ? <CircularProgress size={20} /> : tLeads('export')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
