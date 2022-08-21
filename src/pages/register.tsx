import { NextPage } from 'next';
import Container from '../components/Container';
import Meta from '../components/Meta';
import RegisterForm from '../components/forms/RegisterForm';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';

const register: NextPage = () => {
	return (
		<>
			<Meta title="Register" />
			<Container type="center">
				<RegisterForm />
			</Container>
		</>
	);
};
export default register;

export const getServerSideProps = async (context: any) => {
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
