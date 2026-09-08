import { env } from '@/lib/env';
import { WebsiteType } from '@prisma/client';

const TRELLO_API = 'https://api.trello.com/1';

export interface CreateCardInput {
  name: string;
  desc: string;
  listId: string;
}

export interface TrelloCard {
  id: string;
  idList: string;
  idBoard: string;
  url: string;
  name: string;
}

export async function createCard(input: CreateCardInput): Promise<TrelloCard> {
  const params = new URLSearchParams({
    key: env.trelloApiKey(),
    token: env.trelloToken(),
    idList: input.listId,
    name: input.name,
    desc: input.desc,
  });

  const res = await fetch(`${TRELLO_API}/cards?${params.toString()}`, {
    method: 'POST',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Trello error ${res.status}: ${text.slice(0, 300)}`);
  }

  return (await res.json()) as TrelloCard;
}

const WEBSITE_TYPE_LABELS: Record<WebsiteType, string> = {
  NONE: 'No website',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  LINKEDIN: 'LinkedIn',
  WHATSAPP: 'WhatsApp',
  LINKTREE: 'Linktree',
  OTHER_SOCIAL: 'Other social',
  REAL: 'Has website',
};

export function buildLeadDescription(lead: {
  name: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  placeId: string;
  lat: number | null;
  lng: number | null;
  createdAt: Date;
  websiteType: WebsiteType;
  websiteUri: string | null;
  socialHandle: string | null;
}): string {
  const webLine =
    lead.websiteType === WebsiteType.NONE
      ? 'Website: — (none)'
      : `Website: ${WEBSITE_TYPE_LABELS[lead.websiteType]}${
          lead.socialHandle ? ` — @${lead.socialHandle}` : ''
        }${lead.websiteUri ? ` (${lead.websiteUri})` : ''}`;

  const parts = [
    `**${lead.name}**`,
    lead.category ? `Category: ${lead.category}` : null,
    lead.address ? `Address: ${lead.address}` : null,
    lead.phone ? `Phone: ${lead.phone}` : null,
    webLine,
    `Captured: ${lead.createdAt.toISOString().slice(0, 10)}`,
    `Google Maps: https://www.google.com/maps/place/?q=place_id:${lead.placeId}`,
    lead.lat && lead.lng ? `Coords: ${lead.lat}, ${lead.lng}` : null,
    `Source: Nodo Business Search`,
  ].filter(Boolean);
  return parts.join('\n\n');
}
