import type { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

type Credentials = Record<'email' | 'password', string>;

const EMAIL = process.env.AUTH_DEMO_EMAIL ?? 'demo@chai.vc';
const PASSWORD = process.env.AUTH_DEMO_PASSWORD ?? 'changeme123!';

const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const creds = credentials as Credentials | null;
        if (!creds?.email || !creds?.password) {
          return null;
        }

        const email = creds.email.trim().toLowerCase();
        const password = creds.password;

        if (email === EMAIL.toLowerCase() && password === PASSWORD) {
          return {
            id: email,
            email,
            name: 'Demo User',
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { authOptions };
export default handler;
