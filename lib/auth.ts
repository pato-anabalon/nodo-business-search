import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  providers: [
    Google({
      clientId: env.googleClientId(),
      clientSecret: env.googleClientSecret(),
    }),
  ],
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      if (!email) return false;
      const whitelist = env.allowedEmails();
      if (whitelist.length === 0) return false;
      return whitelist.includes(email);
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
