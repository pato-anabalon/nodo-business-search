import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { env } from '@/lib/env';
import { createCard, buildLeadDescription } from '@/lib/trello';
import { LeadStatus } from '@prisma/client';

const bodySchema = z.object({
  leadIds: z.array(z.string().min(1)).min(1).max(50),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const gate = rateLimit(`export:${session.user.id}`, { limit: 10, windowMs: 60_000 });
  if (!gate.ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let payload: z.infer<typeof bodySchema>;
  try {
    payload = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const listId = env.trelloListId();
  const boardId = env.trelloBoardId();

  const leads = await prisma.lead.findMany({ where: { id: { in: payload.leadIds } } });

  const results = await Promise.allSettled(
    leads.map(async (lead) => {
      const desc = buildLeadDescription(lead);
      const card = await createCard({
        listId,
        name: `${lead.name}${lead.category ? ` — ${lead.category}` : ''}`,
        desc,
      });
      await prisma.$transaction([
        prisma.leadExport.upsert({
          where: { leadId_trelloBoardId: { leadId: lead.id, trelloBoardId: boardId } },
          create: {
            leadId: lead.id,
            userId: session.user.id,
            trelloCardId: card.id,
            trelloListId: card.idList,
            trelloBoardId: card.idBoard,
          },
          update: {
            trelloCardId: card.id,
            trelloListId: card.idList,
          },
        }),
        prisma.lead.update({ where: { id: lead.id }, data: { status: LeadStatus.EXPORTED } }),
      ]);
      return { leadId: lead.id, cardId: card.id };
    }),
  );

  const ok = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.length - ok;
  const errors = results
    .map((r, i) =>
      r.status === 'rejected'
        ? {
            leadId: leads[i]?.id ?? 'unknown',
            error: r.reason instanceof Error ? r.reason.message : 'unknown',
          }
        : null,
    )
    .filter((v): v is { leadId: string; error: string } => v !== null);

  return NextResponse.json({ ok, failed, errors });
}
