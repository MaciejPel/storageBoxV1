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
	secret: process.env.NEXTAUTH_SECRET,
	adapter: PrismaAdapter(prisma),
	callbacks: {
		async session({ session, token }) {
			return {
				user: { id: token.user.id, username: token.user.username },
				expires: session.expires,
			};
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
					where: { username, verified: true, banned: false },
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
		signOut: '/logout',
	},
};

export default NextAuth(authOptions);
