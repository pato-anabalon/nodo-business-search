import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { LeadsTable, type LeadRow } from '@/components/LeadsTable';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const t = await getTranslations('leads');
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  const initialItems: LeadRow[] = leads.map((l) => ({
    id: l.id,
    placeId: l.placeId,
    name: l.name,
    address: l.address,
    phone: l.phone,
    category: l.category,
    status: l.status,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('title')}
      </Typography>
      <LeadsTable initialItems={initialItems} />
    </Box>
  );
}
