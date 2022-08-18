import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../../../server/db/client';
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
	session: { strategy: 'jwt' },
	jwt: {
		maxAge: 60 * 60 * 24 * 30,
	},
	secret: process.env.JWT_SECRET,
	adapter: PrismaAdapter(prisma),
	callbacks: {
		async session({ session, token }) {
			session.user.id = token.user.id;
			session.user.username = token.user.username;
			return session;
		},
		async jwt({ token, user }) {
			if (user) token.user = user;
			return token;
		},
	},

	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				username: { label: 'Username', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				const username = credentials?.username || '';
				const password = credentials?.password || '';
				const user = await prisma.user.findFirst({
					where: { username, verified: true },
					select: { id: true, username: true, password: true },
				});
				if (user && (await bcrypt.compare(password, user.password)))
					return { id: user.id, username: user.username };
				return null;
			},
		}),
	],
	pages: {
		signIn: '/login',
	},
};

export default NextAuth(authOptions);
