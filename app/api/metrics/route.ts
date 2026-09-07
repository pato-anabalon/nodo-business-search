import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDashboardMetrics } from '@/lib/metrics';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const metrics = await getDashboardMetrics();
  return NextResponse.json(metrics);
}
