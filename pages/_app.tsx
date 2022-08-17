import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import '../styles/globals.css';
import Layout from '../components/Layout';
import { SessionProvider } from 'next-auth/react';
import { withTRPC } from '@trpc/next';
import type { AppRouter } from '../server/router';
import superjson from 'superjson';

export const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
	return (
		<SessionProvider session={session}>
			<ThemeProvider defaultTheme="system">
				<Layout>
					<Component {...pageProps} />
				</Layout>
			</ThemeProvider>
		</SessionProvider>
	);
};

const getBaseUrl = () => {
	if (typeof window !== 'undefined') return '';
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
	return `http://localhost:${process.env.PORT ?? 3000}`;
};

export default withTRPC<AppRouter>({
	config({ ctx }) {
		const url = `${getBaseUrl()}/api/trpc`;
		return { transformer: superjson, url };
	},
	ssr: true,
})(App);
