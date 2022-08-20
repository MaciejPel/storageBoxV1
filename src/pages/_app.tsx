import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import '../styles/globals.css';
import Layout from '../components/Layout';
import { SessionProvider } from 'next-auth/react';
import { withTRPC } from '@trpc/next';
import type { AppRouter } from '../server/router';
import superjson from 'superjson';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getBaseUrl } from '../utils/functions';

export const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
	return (
		<SessionProvider session={session}>
			<ThemeProvider defaultTheme="system">
				<Layout>
					<Component {...pageProps} />
				</Layout>
				<ToastContainer position="bottom-left" hideProgressBar={true} />
			</ThemeProvider>
		</SessionProvider>
	);
};

export default withTRPC<AppRouter>({
	config({ ctx }) {
		const url = `${getBaseUrl()}/api/trpc`;
		return {
			queryClientConfig: {
				defaultOptions: {
					queries: {
						staleTime: 60000,
						cacheTime: 60000,
					},
				},
			},
			transformer: superjson,
			url,
		};
	},
	ssr: true,
})(App);
