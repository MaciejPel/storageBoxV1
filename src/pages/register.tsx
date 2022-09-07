import { NextPage } from 'next';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import Meta from '../components/Meta';
import Container from '../components/Container';
import RegisterForm from '../components/forms/RegisterForm';

const Register: NextPage = () => {
	return (
		<>
			<Meta title="Register" />
			<Container type="center">
				<RegisterForm />
			</Container>
		</>
	);
};
export default Register;

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
