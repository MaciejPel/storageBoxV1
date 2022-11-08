import { NextPage } from 'next';
import Meta from '../components/Meta';
import Container from '../components/Container';
import Loader from '../components/Loader';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';

const LogoutPage: NextPage = () => {
	const router = useRouter();

	useEffect(() => {
		const out = signOut({ redirect: false });
		out.then(() => {
			router.push('/');
		});
	}, [router]);

	return (
		<>
			<Meta title="Logging out" />
			<Container type="center">
				<Loader />
			</Container>
		</>
	);
};

export default LogoutPage;
