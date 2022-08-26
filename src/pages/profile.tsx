import Container from '../components/Container';
import Meta from '../components/Meta';
import { GetServerSidePropsContext, NextPage } from 'next';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';

const Profile: NextPage = () => {
	return (
		<>
			<Meta title="Profile" />
			<Container type="start">
				<h2 className="text-4xl font-extrabold my-4 text-start w-full mt-0 mb-2">Profile</h2>
			</Container>
		</>
	);
};

export default Profile;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
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
