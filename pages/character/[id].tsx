import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import { getSession, useSession } from 'next-auth/react';
import Container from '../../components/Container';
import Upload from '../../components/Upload';

const CharacterPage = () => {
	const router = useRouter();
	const { data: session } = useSession();
	const characterId = router.query.id as string;

	const { data: character, isLoading } = trpc.useQuery(['character.single', { characterId }], {
		enabled: session ? true : false,
	});

	if (isLoading) {
		return <Container type="start">Loading character ⌚</Container>;
	}

	return (
		<Container type="start">
			<h1>{character?.name}</h1>
			<p>{character?.description}</p>
			<Upload />
		</Container>
	);
};

export default CharacterPage;

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
