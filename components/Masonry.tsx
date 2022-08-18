import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { trpc } from '../utils/trpc';
import Container from './Container';

const Masonry: React.FC<{ query: string }> = ({ query }) => {
	const { data: session } = useSession();

	const charactersQuery = trpc.useQuery(['character.all'], {
		enabled: session ? true : false,
	});

	return (
		<>
			{charactersQuery.isError && <Container type="center">Something went wrong</Container>}
			{charactersQuery.isLoading && <Container type="center">Loading data ⌚</Container>}
			{charactersQuery.isSuccess && (
				<div className="md:columns-3 columns-1 py-2 w-full">
					{charactersQuery.data
						.filter(
							(character) =>
								character.name.toLowerCase().includes(query) ||
								(character.description && character.description.toLowerCase().includes(query)) ||
								character.author.username.toLowerCase().includes(query)
						)
						.map((character) => (
							<Link href={`/character/${character.id}`} key={character.id}>
								<div className="card bg-base-100 card-bordered cursor-pointer mb-2 static">
									<div className="card-body py-2 px-4 w-full bg-base-300 gap-0">
										<h2 className="card-title">
											{character.name} -<button>{character.author.username}</button>
										</h2>
										<p>{character.description}</p>
										<div>
											{character.tags.map((tag, index) => (
												<span key={tag.id}>{(index ? ', ' : '') + tag.name}</span>
											))}
										</div>
									</div>
								</div>
							</Link>
						))}
				</div>
			)}
		</>
	);
};
export default Masonry;
