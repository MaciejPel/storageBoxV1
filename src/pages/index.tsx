/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import type { GetServerSidePropsContext, NextPage } from 'next';
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

const breakpointColumnsObj = {
	default: 5,
	1536: 4,
	1280: 3,
	1024: 3,
	768: 2,
	640: 1,
};
interface QueryParams {
	string: string;
	tags?: string[];
	sort: boolean;
}

const Home: NextPage = () => {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [query, setQuery] = useState<QueryParams>({ string: '', tags: [], sort: true });

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
					{charactersQuery.isSuccess && charactersQuery.data.length === 0 && (
						<Container type="center">Pretty empty in here 🏜</Container>
					)}
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
										query.tags &&
										query.tags.every((tag) => characterTags.includes(tag))
									);
								})
								.sort((f, s) => {
									const likesF =
											f.media.reduce((acc, media) => acc + media.likeIds.length, 0) +
											(f.mainMedia?.likeIds.length || 0),
										likesS =
											s.media.reduce((acc, media) => acc + media.likeIds.length, 0) +
											(s.mainMedia?.likeIds.length || 0);
									if (likesF < likesS) return query.sort ? 1 : -1;
									if (likesF > likesS) return query.sort ? -1 : 1;
									return 0;
								})
								.map((character, index) => (
									<Link href={`/character/${character.id}`} key={character.id}>
										<div
											data-test={index}
											className="card card-compact static bg-base-100 card-bordered cursor-pointer mb-4"
										>
											{character?.mainMedia && character?.mainMedia.mimetype.includes('image') ? (
												<img
													src={`${bunnyCDN}/${character.id}/${character.mainMedia.id}.${character.mainMedia.fileExtension}`}
													alt={`${character.mainMedia.fileName}.${character.mainMedia.fileExtension}`}
												/>
											) : (
												<PhotographIcon />
											)}
											<div className="card-body w-full bg-base-300">
												<div>
													<h2 className="card-title !mb-0">{character.name}</h2>
													<p className="truncate">{character.description}</p>
												</div>
												<p className="flex gap-1 flex-wrap">
													{character.tags.map((tag) => (
														<span
															key={tag.id}
															className={`badge badge-md badge-outline hover:bg-base-100 !py-3 ${
																query.tags && query.tags.includes(tag.id)
																	? 'bg-success text-success-content'
																	: ''
															}`}
															onClick={(e) => {
																e.preventDefault();
																query.tags &&
																	setQuery({
																		...query,
																		tags: query.tags.includes(tag.id)
																			? query.tags.filter((tagId) => tagId !== tag.id)
																			: [...query.tags, tag.id],
																	});
															}}
														>
															{tag.name}
														</span>
													))}
												</p>
												<div className="card-actions justify-end">
													<button className="flex gap-1 text-base">
														<HeartIcon className="w-6 fill-red-500" />
														{character.media.reduce((acc, media) => acc + media.likeIds.length, 0) +
															(character.mainMedia?.likeIds.length || 0)}
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
