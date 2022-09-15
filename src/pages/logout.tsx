import { NextPage } from 'next';
import Meta from '../components/Meta';
import Container from '../components/Container';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';

const Login: NextPage = () => {
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
			<Container type="center">...</Container>
		</>
	);
};

export default Login;
