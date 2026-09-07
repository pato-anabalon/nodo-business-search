export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';
export const LOCALE_COOKIE = 'nodo-locale';

export const isLocale = (value: string | undefined): value is Locale =>
  value === 'es' || value === 'en';
