import { NextPage } from 'next';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import Container from '../components/Container';
import Meta from '../components/Meta';
import { authOptions } from './api/auth/[...nextauth]';

const Media: NextPage = () => {
	return (
		<>
			<Meta title="Media" />
			<Container type="start">
				<h2 className="text-4xl font-extrabold my-4">Media</h2>
			</Container>
		</>
	);
};
export default Media;

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
