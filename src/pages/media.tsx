import { NextPage } from 'next';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import Container from '../components/Container';
import Meta from '../components/Meta';
import { authOptions } from './api/auth/[...nextauth]';

const media: NextPage = () => {
	return (
		<>
			<Meta title="Media" />
			<Container type="center">media</Container>
		</>
	);
};
export default media;

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
