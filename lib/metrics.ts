import { LeadStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export interface DashboardMetrics {
  searches: { last7d: number; last30d: number };
  leads: { total: number; today: number; withPhone: number };
  exports: { total: number; today: number };
  exportRate: number;
  topCategories: { category: string | null; count: number }[];
  recentSearches: {
    id: string;
    query: string;
    resultsCount: number;
    leadsCreated: number;
    createdAt: string;
  }[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [
    searches7d,
    searches30d,
    leadsTotal,
    leadsToday,
    leadsWithPhone,
    exportsTotal,
    exportsToday,
    topCategories,
    recentSearches,
  ] = await Promise.all([
    prisma.search.count({ where: { createdAt: { gte: daysAgo(7) } } }),
    prisma.search.count({ where: { createdAt: { gte: daysAgo(30) } } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: daysAgo(1) } } }),
    prisma.lead.count({ where: { phone: { not: null } } }),
    prisma.leadExport.count(),
    prisma.leadExport.count({ where: { exportedAt: { gte: daysAgo(1) } } }),
    prisma.lead.groupBy({
      by: ['category'],
      _count: { _all: true },
      where: { category: { not: null }, status: { not: LeadStatus.DISCARDED } },
      orderBy: { _count: { category: 'desc' } },
      take: 5,
    }),
    prisma.search.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        query: true,
        resultsCount: true,
        leadsCreated: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    searches: { last7d: searches7d, last30d: searches30d },
    leads: { total: leadsTotal, today: leadsToday, withPhone: leadsWithPhone },
    exports: { total: exportsTotal, today: exportsToday },
    exportRate: leadsTotal === 0 ? 0 : Math.round((exportsTotal / leadsTotal) * 100),
    topCategories: topCategories.map((c) => ({
      category: c.category,
      count: c._count._all,
    })),
    recentSearches: recentSearches.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
    })),
  };
}
