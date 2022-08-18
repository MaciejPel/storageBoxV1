import { getSession } from 'next-auth/react';
import Container from '../components/Container';
import Meta from '../components/Meta';
import { NextPage } from 'next';

const profile: NextPage = () => {
	return (
		<Container type="center">
			<Meta title="Profile" />
			<div>profile</div>
		</Container>
	);
};

export default profile;

export const getServerSideProps = async (context: any) => {
	const session = await getSession(context);
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
