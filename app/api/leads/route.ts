import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LeadStatus, Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const take = Math.min(Number(url.searchParams.get('take') ?? '100'), 500);
  const skip = Number(url.searchParams.get('skip') ?? '0');

  const where: Prisma.LeadWhereInput = {};
  if (status && status in LeadStatus) {
    where.status = status as LeadStatus;
  }

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({ items, total });
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(LeadStatus).optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let payload: z.infer<typeof patchSchema>;
  try {
    payload = patchSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { id, ...updates } = payload;
  const lead = await prisma.lead.update({
    where: { id },
    data: updates,
  });
  return NextResponse.json(lead);
}
