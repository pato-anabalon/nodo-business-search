import { env } from '@/lib/env';

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

interface PlacesTextSearchResponse {
  places?: PlaceResult[];
  nextPageToken?: string;
}

export interface TextSearchOptions {
  textQuery: string;
  languageCode?: string;
  regionCode?: string;
  maxResultCount?: number;
}

export async function searchPlacesText(options: TextSearchOptions): Promise<PlaceResult[]> {
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

  const data = (await response.json()) as PlacesTextSearchResponse;
  return data.places ?? [];
}

export const hasNoWebsite = (place: PlaceResult): boolean =>
  !place.websiteUri || place.websiteUri.trim().length === 0;

export const pickCategory = (place: PlaceResult): string | undefined =>
  place.primaryType ?? place.types?.[0];

export const pickPhone = (place: PlaceResult): string | undefined =>
  place.nationalPhoneNumber ?? place.internationalPhoneNumber;
