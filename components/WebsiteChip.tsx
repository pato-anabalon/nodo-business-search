'use client';

import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import LanguageIcon from '@mui/icons-material/Language';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkIcon from '@mui/icons-material/Link';
import PublicIcon from '@mui/icons-material/Public';
import BlockIcon from '@mui/icons-material/Block';

export type WebsiteType =
  | 'NONE'
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'LINKEDIN'
  | 'WHATSAPP'
  | 'LINKTREE'
  | 'OTHER_SOCIAL'
  | 'REAL';

interface WebsiteChipProps {
  type: WebsiteType;
  handle?: string | null;
  uri?: string | null;
}

const CONFIG: Record<
  WebsiteType,
  {
    label: string;
    color: 'default' | 'primary' | 'secondary' | 'success' | 'error';
    icon: React.ReactElement;
  }
> = {
  NONE: { label: 'No web', color: 'error', icon: <BlockIcon /> },
  FACEBOOK: { label: 'Facebook', color: 'primary', icon: <FacebookIcon /> },
  INSTAGRAM: { label: 'Instagram', color: 'secondary', icon: <InstagramIcon /> },
  LINKEDIN: { label: 'LinkedIn', color: 'primary', icon: <LinkedInIcon /> },
  WHATSAPP: { label: 'WhatsApp', color: 'success', icon: <WhatsAppIcon /> },
  LINKTREE: { label: 'Linktree', color: 'default', icon: <LinkIcon /> },
  OTHER_SOCIAL: { label: 'Social', color: 'default', icon: <PublicIcon /> },
  REAL: { label: 'Website', color: 'default', icon: <LanguageIcon /> },
};

export function WebsiteChip({ type, handle, uri }: WebsiteChipProps) {
  const cfg = CONFIG[type];
  const label = handle ? `${cfg.label} · @${handle}` : cfg.label;
  const tooltip = uri ?? cfg.label;

  return (
    <Tooltip title={tooltip}>
      <Chip size="small" color={cfg.color} icon={cfg.icon} label={label} />
    </Tooltip>
  );
}
