/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import { useSession, getSession } from 'next-auth/react';
import Container from '../components/Container';
import Search from '../components/Search';
import Modal from '../components/Modal';
import CharacterForm from '../components/forms/CharacterForm';
import Masonry from '../components/Masonry';
import TagForm from '../components/forms/TagForm';
import { trpc } from '../utils/trpc';
import Link from 'next/link';
import { PhotographIcon } from '@heroicons/react/solid';
import { bunnyCDN } from '../utils/constants';

interface QueryParams {
	string: string;
	tags: string[];
}

const Home: NextPage = () => {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [query, setQuery] = useState<QueryParams>({ string: '', tags: [] });

	const charactersQuery = trpc.useQuery(['character.all'], {
		enabled: session ? true : false,
	});

	useEffect(() => {
		// solve problem with invalid redirect on signOut, however this solution causes problem with `Loading initial props cancelled`
		if (status === 'unauthenticated') router.push('/login');
	}, [status, router]);

	return (
		<>
			{status === 'authenticated' && (
				<Container type="start">
					<div className="w-full flex items-center gap-1 md:flex-row flex-col">
						<Search setQuery={setQuery} query={query} />
						<Modal modalTitle="New tag" buttonTitle="Add tag" id="tag">
							<TagForm />
						</Modal>
						<Modal modalTitle="New character" buttonTitle="Add character" id="character">
							<CharacterForm />
						</Modal>
					</div>
					{charactersQuery.isError && <Container type="center">Something went wrong</Container>}
					{charactersQuery.isLoading && <Container type="center">Loading data ⌚</Container>}
					<Masonry>
						{charactersQuery.isSuccess && (
							<>
								{charactersQuery.data
									.filter((character) => {
										const characterTags = character.tags.map((tag) => tag.id);
										return (
											(character.name.toLowerCase().includes(query.string) ||
												(character.description &&
													character.description.toLowerCase().includes(query.string))) &&
											query.tags.every((tag) => {
												return characterTags.includes(tag);
											})
										);
									})
									.map((character) => (
										<Link href={`/character/${character.id}`} key={character.id}>
											<a>
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
											</a>
										</Link>
									))}
							</>
						)}
					</Masonry>
				</Container>
			)}
		</>
	);
};

export default Home;

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
