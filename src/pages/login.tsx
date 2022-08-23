import { GetServerSidePropsContext, NextPage } from 'next';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import Container from '../components/Container';
import LoginForm from '../components/forms/LoginForm';
import Meta from '../components/Meta';
import { authOptions } from './api/auth/[...nextauth]';

const Login: NextPage = () => {
	return (
		<>
			<Meta title="Login" />
			<Container type="center">
				<LoginForm />
			</Container>
		</>
	);
};
export default Login;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
	const session = await getServerSession(context.req, context.res, authOptions);

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
