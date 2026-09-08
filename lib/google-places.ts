import { env } from '@/lib/env';
import { WebsiteType } from '@prisma/client';

const PLACES_TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.types',
  'places.primaryType',
  'places.location',
  'places.googleMapsUri',
  'places.businessStatus',
].join(',');

export interface PlaceResult {
  id: string;
  displayName?: { text?: string; languageCode?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  types?: string[];
  primaryType?: string;
  location?: { latitude: number; longitude: number };
  googleMapsUri?: string;
  businessStatus?: string;
}

export interface PlacesTextSearchResponse {
  places?: PlaceResult[];
  nextPageToken?: string;
}

export interface TextSearchOptions {
  textQuery: string;
  languageCode?: string;
  regionCode?: string;
  maxResultCount?: number;
}

export async function searchPlacesText(
  options: TextSearchOptions,
): Promise<PlacesTextSearchResponse> {
  const response = await fetch(PLACES_TEXT_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env.googlePlacesKey(),
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: options.textQuery,
      languageCode: options.languageCode ?? 'en',
      regionCode: options.regionCode ?? 'NZ',
      maxResultCount: options.maxResultCount ?? 20,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Google Places error ${response.status}: ${errorBody.slice(0, 300)}`);
  }

  return (await response.json()) as PlacesTextSearchResponse;
}

export const pickCategory = (place: PlaceResult): string | undefined =>
  place.primaryType ?? place.types?.[0];

export const pickPhone = (place: PlaceResult): string | undefined =>
  place.nationalPhoneNumber ?? place.internationalPhoneNumber;

interface SocialMatcher {
  type: WebsiteType;
  hostPatterns: RegExp[];
  extractHandle?: (url: URL) => string | undefined;
}

const stripTrailingSlash = (s: string): string => s.replace(/\/+$/, '');

const firstPathSegment = (url: URL): string | undefined => {
  const seg = url.pathname.split('/').filter(Boolean)[0];
  return seg ? stripTrailingSlash(seg) : undefined;
};

const SOCIAL_MATCHERS: SocialMatcher[] = [
  {
    type: WebsiteType.FACEBOOK,
    hostPatterns: [/(?:^|\.)facebook\.com$/, /(?:^|\.)fb\.com$/, /(?:^|\.)fb\.me$/],
    extractHandle: firstPathSegment,
  },
  {
    type: WebsiteType.INSTAGRAM,
    hostPatterns: [/(?:^|\.)instagram\.com$/, /(?:^|\.)instagr\.am$/],
    extractHandle: firstPathSegment,
  },
  {
    type: WebsiteType.LINKEDIN,
    hostPatterns: [/(?:^|\.)linkedin\.com$/],
    extractHandle: (url) => {
      const parts = url.pathname.split('/').filter(Boolean);
      return parts.length >= 2 ? parts.slice(0, 2).join('/') : parts[0];
    },
  },
  {
    type: WebsiteType.WHATSAPP,
    hostPatterns: [/(?:^|\.)wa\.me$/, /(?:^|\.)whatsapp\.com$/, /(?:^|\.)api\.whatsapp\.com$/],
    extractHandle: firstPathSegment,
  },
  {
    type: WebsiteType.LINKTREE,
    hostPatterns: [/(?:^|\.)linktr\.ee$/, /(?:^|\.)linktree\.com$/],
    extractHandle: firstPathSegment,
  },
  {
    type: WebsiteType.OTHER_SOCIAL,
    hostPatterns: [
      /(?:^|\.)tiktok\.com$/,
      /(?:^|\.)twitter\.com$/,
      /(?:^|\.)x\.com$/,
      /(?:^|\.)youtube\.com$/,
      /(?:^|\.)youtu\.be$/,
      /(?:^|\.)pinterest\.com$/,
      /(?:^|\.)snapchat\.com$/,
    ],
    extractHandle: firstPathSegment,
  },
];

export interface WebsiteClassification {
  type: WebsiteType;
  handle?: string;
}

export function classifyWebsite(uri: string | null | undefined): WebsiteClassification {
  if (!uri || !uri.trim()) return { type: WebsiteType.NONE };
  let url: URL;
  try {
    url = new URL(uri);
  } catch {
    return { type: WebsiteType.REAL };
  }
  const host = url.hostname.toLowerCase();
  for (const matcher of SOCIAL_MATCHERS) {
    if (matcher.hostPatterns.some((re) => re.test(host))) {
      return { type: matcher.type, handle: matcher.extractHandle?.(url) };
    }
  }
  return { type: WebsiteType.REAL };
}

export const ACTIONABLE_WEBSITE_TYPES: WebsiteType[] = [
  WebsiteType.NONE,
  WebsiteType.FACEBOOK,
  WebsiteType.INSTAGRAM,
  WebsiteType.WHATSAPP,
  WebsiteType.LINKTREE,
];
