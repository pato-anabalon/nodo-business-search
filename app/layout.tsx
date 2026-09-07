import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import { ThemeRegistry } from '@/theme/ThemeRegistry';
import type { ThemeMode } from '@/theme/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nodo Business Search',
  description: 'Auckland lead prospecting for businesses without a website.',
  icons: { icon: '/favicon.ico' },
};

const THEME_COOKIE = 'nodo-theme';

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const [locale, messages, cookieStore] = await Promise.all([
    getLocale(),
    getMessages(),
    cookies(),
  ]);
  const cookieMode = cookieStore.get(THEME_COOKIE)?.value;
  const initialMode: ThemeMode = cookieMode === 'light' ? 'light' : 'dark';

  return (
    <html lang={locale} data-mui-color-scheme={initialMode}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeRegistry initialMode={initialMode}>{children}</ThemeRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
