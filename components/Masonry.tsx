/* eslint-disable @next/next/no-img-element */
import { PhotographIcon } from '@heroicons/react/solid';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { trpc } from '../utils/trpc';
import Container from './Container';

const Masonry: React.FC<{ query: string }> = ({ query }) => {
	const { data: session } = useSession();

	const charactersQuery = trpc.useQuery(['character.all'], {
		enabled: session ? true : false,
	});

	const bunnyCDN = `${process.env.NEXT_PUBLIC_CDN_URL}/${process.env.NEXT_PUBLIC_STORAGE_FOLDER}`;

	return (
		<>
			{charactersQuery.isError && <Container type="center">Something went wrong</Container>}
			{charactersQuery.isLoading && <Container type="center">Loading data ⌚</Container>}
			{charactersQuery.isSuccess && (
				<div className="2xl:columns-5 md:columns-3 columns-1 py-2 w-full">
					{charactersQuery.data
						.filter(
							(character) =>
								character.name.toLowerCase().includes(query) ||
								(character.description && character.description.toLowerCase().includes(query))
						)
						.map((character) => (
							<Link href={`/character/${character.id}`} key={character.id}>
								<div className="card card-compact static bg-base-100 card-bordered cursor-pointer mb-2">
									{character?.media[0] ? (
										<img
											src={`${bunnyCDN}/${character.id}/${character.media[0].id}.${character.media[0].fileType}`}
											alt={`${character.media[0].fileName}.${character.media[0].fileType}`}
										/>
									) : (
										<PhotographIcon />
									)}
									<div className="card-body py-2 px-4 w-full bg-base-300 gap-0">
										<h2 className="card-title !mb-0">{character.name}</h2>
										<p className="truncate mb-2">{character.description}</p>
										<p>
											{character.tags.map((tag, index) => (
												<span key={tag.id}>
													{index ? ', ' : ''}
													<span className="btn-link text-base-content">{tag.name}</span>
												</span>
											))}
										</p>
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
