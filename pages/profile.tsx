import { getSession } from 'next-auth/react';
import Container from '../components/Container';
import Meta from '../components/Meta';

const profile = () => {
	return (
		<Container type="center">
			<Meta title="Profile" />
			<div>profile</div>
		</Container>
	);
};

export default profile;

export async function getServerSideProps(context: any) {
	const session = await getSession(context);
	if (!session) {
		return {
			redirect: {
				destination: '/',
				pernament: false,
			},
		};
	}
	return { props: { session } };
}
