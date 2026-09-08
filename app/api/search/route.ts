import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import {
  searchPlacesText,
  classifyWebsite,
  pickCategory,
  pickPhone,
  type PlacesTextSearchResponse,
} from '@/lib/google-places';
import { WebsiteType } from '@prisma/client';

const bodySchema = z.object({
  query: z.string().min(3).max(200),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const gate = rateLimit(`search:${session.user.id}`, { limit: 10, windowMs: 60_000 });
  if (!gate.ok) {
    return NextResponse.json(
      { error: 'rate_limited', resetAt: gate.resetAt },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((gate.resetAt - Date.now()) / 1000)) },
      },
    );
  }

  let payload: z.infer<typeof bodySchema>;
  try {
    payload = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  let response: PlacesTextSearchResponse;
  try {
    response = await searchPlacesText({ textQuery: payload.query });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'places_error';
    return NextResponse.json({ error: 'places_error', message }, { status: 502 });
  }

  const places = response.places ?? [];
  let leadsCreated = 0;

  const upserted = await Promise.all(
    places.map(async (place) => {
      const existing = await prisma.lead.findUnique({ where: { placeId: place.id } });
      const classification = classifyWebsite(place.websiteUri);
      const lead = await prisma.lead.upsert({
        where: { placeId: place.id },
        create: {
          placeId: place.id,
          name: place.displayName?.text ?? 'Unknown',
          address: place.formattedAddress,
          phone: pickPhone(place),
          category: pickCategory(place),
          types: place.types ?? [],
          lat: place.location?.latitude,
          lng: place.location?.longitude,
          websiteType: classification.type,
          websiteUri: place.websiteUri,
          socialHandle: classification.handle,
          rawJson: place as unknown as object,
        },
        update: {
          name: place.displayName?.text ?? undefined,
          address: place.formattedAddress,
          phone: pickPhone(place),
          category: pickCategory(place),
          types: place.types ?? [],
          lat: place.location?.latitude,
          lng: place.location?.longitude,
          websiteType: classification.type,
          websiteUri: place.websiteUri,
          socialHandle: classification.handle,
          rawJson: place as unknown as object,
        },
      });
      if (!existing) leadsCreated += 1;
      return lead;
    }),
  );

  const search = await prisma.search.create({
    data: {
      userId: session.user.id,
      query: payload.query,
      resultsCount: places.length,
      leadsCreated,
      rawResponse: response as unknown as object,
    },
  });

  if (upserted.length > 0) {
    await prisma.lead.updateMany({
      where: {
        placeId: { in: upserted.map((l) => l.placeId) },
        sourceSearchId: null,
      },
      data: { sourceSearchId: search.id },
    });
  }

  const actionable = upserted.filter((l) => l.websiteType !== WebsiteType.REAL).length;

  return NextResponse.json({
    searchId: search.id,
    totalResults: places.length,
    actionableLeads: actionable,
    leadsCreated,
    leads: upserted,
  });
}
