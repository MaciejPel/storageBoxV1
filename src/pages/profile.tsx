import Container from '../components/Container';
import Meta from '../components/Meta';
import { NextPage } from 'next';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';

const profile: NextPage = () => {
	return (
		<>
			<Meta title="Profile" />
			<Container type="center">
				<div>profile</div>
			</Container>
		</>
	);
};

export default profile;

export const getServerSideProps = async (context: any) => {
	const session = await getServerSession(context.req, context.res, authOptions);

	if (!session) {
		return {
			redirect: {
				destination: '/login',
				pernament: false,
			},
		};
	}
	return { props: { session } };
};
