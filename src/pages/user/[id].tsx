import { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import { useSession } from 'next-auth/react';
import { authOptions } from '../api/auth/[...nextauth]';
import Meta from '../../components/Meta';
import Container from '../../components/Container';
import { trpc } from '../../utils/trpc';
import Masonry from 'react-masonry-css';

const breakpointColumnsObj = {
	default: 5,
	1536: 4,
	1280: 3,
	1024: 3,
	768: 2,
	640: 1,
};

const UserPage: NextPage = () => {
	const router = useRouter();
	const userId = router.query.id as string;
	const { data: session } = useSession();

	const userQuery = trpc.useQuery(['user.single', { userId }], { enabled: session ? true : false });

	return (
		<>
			<Meta title={`${userQuery.data?.username} | User`} />
			<Container type="start">
				<div>Characters: {userQuery.data?.createdCharacters.length}</div>
				<div>Media: {userQuery.data?.uploadedMedia.length}</div>
				<div>Tags: {userQuery.data?.createdTags.length}</div>
				<div>Liked: {userQuery.data?.likedMedia.length}</div>
			</Container>
		</>
	);
};

export default UserPage;

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
