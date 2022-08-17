import Link from 'next/link';
import { prisma } from '../../server/db/client';
import { NextPage, GetStaticProps } from 'next';

interface Character {
	id: string;
	name: string;
	mediaIds: string[];
	authorId: string;
}

interface CharacterProps {
	characters: Character[];
}

export const getStaticProps: GetStaticProps<CharacterProps> = async () => {
	const characters = (await prisma.character.findMany()) as Character[];

	return {
		props: { characters },
	};
};

const Characters: NextPage<CharacterProps> = ({ characters }) => {
	return (
		<div>
			<Link href="/">Back</Link>
			{characters &&
				characters.map((character: Character) => (
					<Link href={'/character/' + character.id} key={character.id}>
						<a>
							<h3>{character.name}</h3>
						</a>
					</Link>
				))}
		</div>
	);
};

export default Characters;
