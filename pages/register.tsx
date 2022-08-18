import { NextPage } from 'next';
import { getSession } from 'next-auth/react';
import Container from '../components/Container';
import RegisterForm from '../components/RegisterForm';

const register: NextPage = () => {
	return (
		<Container type="center">
			<RegisterForm />
		</Container>
	);
};
export default register;

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
