import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import type { AppRouter } from '../server/router';
import { withTRPC } from '@trpc/next';
import superjson from 'superjson';
import { getBaseUrl } from '../utils/functions';
import { ToastContainer } from 'react-toastify';
import Layout from '../components/Layout';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';

export const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
	return (
		<SessionProvider session={session}>
			<ThemeProvider defaultTheme="system">
				<Layout>
					<Component {...pageProps} />
				</Layout>
				<ToastContainer
					position="bottom-left"
					hideProgressBar={true}
				/>
			</ThemeProvider>
		</SessionProvider>
	);
};

export default withTRPC<AppRouter>({
	config({ ctx }) {
		const url = `${getBaseUrl()}/api/trpc`;
		return { transformer: superjson, url };
	},
	ssr: true,
})(App);

