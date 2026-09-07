import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from './config';

const detectFromHeader = (acceptLanguage: string | null): Locale | undefined => {
  if (!acceptLanguage) return undefined;
  const preferred = acceptLanguage.split(',')[0]?.split('-')[0]?.toLowerCase();
  return isLocale(preferred) ? preferred : undefined;
};

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(cookieLocale)
    ? cookieLocale
    : (detectFromHeader(headerStore.get('accept-language')) ?? defaultLocale);

  const messages = (await import(`../messages/${locale}.json`)).default;

  return { locale, messages };
});
