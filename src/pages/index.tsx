/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import { trpc } from '../utils/trpc';
import { bunnyCDN } from '../utils/constants';
import { HeartIcon, PhotographIcon } from '@heroicons/react/solid';
import Link from 'next/link';
import Container from '../components/Container';
import Search from '../components/Search';
import Modal from '../components/Modal';
import CharacterForm from '../components/forms/CharacterForm';
import TagForm from '../components/forms/TagForm';
import Masonry from 'react-masonry-css';

interface QueryParams {
	string: string;
	tags: string[];
	sort: boolean;
}

const Home: NextPage = () => {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [query, setQuery] = useState<QueryParams>({ string: '', tags: [], sort: true });

	const charactersQuery = trpc.useQuery(['character.all'], {
		enabled: session ? true : false,
	});

	const breakpointColumnsObj = {
		default: 5,
		1536: 4,
		1280: 3,
		1024: 3,
		768: 2,
		640: 1,
	};

	useEffect(() => {
		// solve problem with invalid redirect on signOut, however this solution causes problem with `Loading initial props cancelled`
		if (status === 'unauthenticated') router.push('/login');
	}, [status, router]);

	return (
		<>
			{status === 'authenticated' && (
				<Container type="start">
					<div className="w-full flex items-center gap-1 md:flex-row flex-col mb-2">
						<Search setQuery={setQuery} query={query} />
						<Modal modalTitle="New tag" buttonType="button" buttonContent="Add tag" id="tag">
							<TagForm />
						</Modal>
						<Modal
							modalTitle="New character"
							buttonContent="Add character"
							buttonType="button"
							id="character"
						>
							<CharacterForm />
						</Modal>
					</div>
					{charactersQuery.isError && <Container type="center">Something went wrong</Container>}
					{charactersQuery.isLoading && <Container type="center">Loading data ⌚</Container>}
					<Masonry
						breakpointCols={breakpointColumnsObj}
						className="flex w-full gap-4"
						columnClassName="masonry-grid-column"
					>
						{charactersQuery.isSuccess &&
							charactersQuery.data
								.filter((character) => {
									const characterTags = character.tags.map((tag) => tag.id);
									return (
										(character.name.toLowerCase().includes(query.string) ||
											(character.description &&
												character.description.toLowerCase().includes(query.string))) &&
										query.tags.every((tag) => characterTags.includes(tag))
									);
								})
								.sort((a, b) => {
									const la = a.media.reduce((acc, media) => acc + media.likeIds.length, 0),
										lb = b.media.reduce((acc, media) => acc + media.likeIds.length, 0);
									if (la < lb) return query.sort ? 1 : -1;
									if (la > lb) return query.sort ? -1 : 1;
									return 0;
								})
								.map((character, index) => (
									<Link href={`/character/${character.id}`} key={character.id}>
										<div
											data-test={index}
											className="card card-compact static bg-base-100 card-bordered cursor-pointer mb-4"
										>
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
														<React.Fragment key={tag.id}>
															{index ? ', ' : ''}
															<span
																className={`btn-link text-base-content`}
																onClick={(e) => {
																	e.preventDefault();
																	setQuery({ ...query, tags: [tag.id] });
																}}
															>
																{tag.name}
															</span>
														</React.Fragment>
													))}
												</p>
												<div className="card-actions justify-end">
													<button className="flex gap-2 text-base">
														<HeartIcon className="w-6" />
														{character.media.reduce((acc, media) => acc + media.likeIds.length, 0)}
													</button>
												</div>
											</div>
										</div>
									</Link>
								))}
					</Masonry>
				</Container>
			)}
		</>
	);
};

export default Home;

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
