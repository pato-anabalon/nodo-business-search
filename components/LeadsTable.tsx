'use client';

import { useMemo, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { DataGrid, type GridColDef, type GridRowSelectionModel } from '@mui/x-data-grid';
import { useTranslations } from 'next-intl';
import { ExportDialog } from './ExportDialog';

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DISCARDED' | 'EXPORTED';

export interface LeadRow {
  id: string;
  placeId: string;
  name: string;
  address: string | null;
  phone: string | null;
  category: string | null;
  status: LeadStatus;
  createdAt: string;
}

const statusColor: Record<LeadStatus, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  NEW: 'primary',
  CONTACTED: 'warning',
  QUALIFIED: 'success',
  DISCARDED: 'error',
  EXPORTED: 'default',
};

interface LeadsTableProps {
  initialItems: LeadRow[];
}

export function LeadsTable({ initialItems }: LeadsTableProps) {
  const t = useTranslations('leads');
  const [rows, setRows] = useState<LeadRow[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  });
  const [exportOpen, setExportOpen] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/leads?take=200');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { items: LeadRow[] };
      setRows(json.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown_error');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectedIds = useMemo(
    () => (selection.type === 'include' ? Array.from(selection.ids) : []),
    [selection],
  );

  const columns: GridColDef<LeadRow>[] = [
    { field: 'name', headerName: t('columns.name'), flex: 1.5, minWidth: 180 },
    {
      field: 'category',
      headerName: t('columns.category'),
      flex: 1,
      minWidth: 140,
      renderCell: (params) => (params.value ? <Chip size="small" label={params.value} /> : null),
    },
    { field: 'phone', headerName: t('columns.phone'), flex: 1, minWidth: 140 },
    { field: 'address', headerName: t('columns.address'), flex: 2, minWidth: 220 },
    {
      field: 'status',
      headerName: t('columns.status'),
      minWidth: 130,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value as string}
          color={statusColor[params.value as LeadStatus]}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: t('columns.createdAt'),
      minWidth: 160,
      valueFormatter: (value) => new Date(value as string).toLocaleString(),
    },
  ];

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Button
          variant="contained"
          disabled={selectedIds.length === 0}
          onClick={() => setExportOpen(true)}
        >
          {t('export')} ({selectedIds.length})
        </Button>
        <Button variant="outlined" onClick={reload} disabled={loading}>
          {loading ? '…' : 'Reload'}
        </Button>
      </Stack>
      <Box sx={{ height: 640, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={setSelection}
          rowSelectionModel={selection}
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        />
      </Box>
      <ExportDialog
        open={exportOpen}
        leadIds={selectedIds.map(String)}
        onClose={() => setExportOpen(false)}
        onExported={reload}
      />
    </Stack>
  );
}
