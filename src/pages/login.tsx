import { NextPage } from 'next';
import { getSession } from 'next-auth/react';
import Container from '../components/Container';
import LoginForm from '../components/forms/LoginForm';
import Meta from '../components/Meta';

const login: NextPage = () => {
	return (
		<>
			<Meta title="Login" />
			<Container type="center">
				<LoginForm />
			</Container>
		</>
	);
};
export default login;

export const getServerSideProps = async (context: any) => {
	const session = await getSession(context);
	if (session) {
		return {
			redirect: {
				destination: '/',
				pernament: false,
			},
		};
	}
	return { props: { session } };
};
