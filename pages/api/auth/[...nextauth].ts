import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';

// ✅ تعريف نوع موسع للـ Session ليشمل accessToken
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: '/login',  // تخصيص صفحة تسجيل الدخول
  },
};

export default NextAuth(authOptions);
