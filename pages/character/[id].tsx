import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import { useSession } from 'next-auth/react';
import Container from '../../components/Container';

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
		<Container type="">
			<h1>{character?.name}</h1>
			<p>{character?.description}</p>
		</Container>
	);
};

export default CharacterPage;
