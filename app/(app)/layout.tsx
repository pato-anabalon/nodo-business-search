import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AppShell } from '@/components/AppShell';

export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const session = await auth();
  if (!session?.user) redirect('/signin');

  return <AppShell user={session.user}>{children}</AppShell>;
}
