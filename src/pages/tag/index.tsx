/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { GetServerSidePropsContext, NextPage } from 'next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { trpc } from '../../utils/trpc';
import { defaultBreakpointColumns } from '../../utils/constants';
import { validateUser } from '../../utils/validateUser';
import { HeartIcon } from '@heroicons/react/solid';
import Masonry from 'react-masonry-css';
import Container from '../../components/Container';
import Meta from '../../components/Meta';
import Modal from '../../components/Modal';
import TagForm from '../../components/forms/TagForm';
import Card from '../../components/Card';
import Search from '../../components/Search';
import Loader from '../../components/Loader';

interface QueryParams {
	string: string;
	sort: boolean;
}

const TagsPage: NextPage = () => {
	const { data: session } = useSession();
	const [query, setQuery] = useState<QueryParams>({ string: '', sort: true });
	const [modal, setModal] = useState<boolean>(false);

	const tagsQuery = trpc.useQuery(['tag.all'], {
		enabled: session ? true : false,
	});

	if (tagsQuery.isError) return <Container type="center">Something went wrong</Container>;

	if (tagsQuery.isLoading)
		return (
			<Container type="center">
				<Loader />
			</Container>
		);

	return (
		<>
			<Meta title="Tags" />
			<Container type="start">
				<h2 className="text-4xl font-extrabold my-4 text-start w-full mt-0 mb-2">Tags</h2>
				<div className="w-full flex items-center gap-1 md:flex-row flex-col mb-2">
					<Search
						setQuery={setQuery}
						query={query}
					/>
					<button
						type="button"
						title="Add tag"
						onClick={() => setModal(true)}
						className="btn md:w-auto w-full"
					>
						Add tag
					</button>
					<Modal
						open={modal}
						onClose={() => setModal(false)}
						modalTitle="New tag"
					>
						<TagForm closeModal={() => setModal(false)} />
					</Modal>
				</div>
				{tagsQuery.isSuccess && tagsQuery.data.length === 0 && (
					<Container type="center">Pretty empty in here 🏜</Container>
				)}
				<Masonry
					breakpointCols={defaultBreakpointColumns}
					className="flex w-full gap-4"
					columnClassName="masonry-grid-column"
				>
					{tagsQuery.isSuccess &&
						tagsQuery.data
							.filter((tag) => {
								return tag.name.toLowerCase().includes(query.string);
							})
							.sort((f, s) => {
								const fTagCharacterMedia = f.characters
									.map((character) => [...character.media, character.cover])
									.reduce((arr, media) => arr.concat(media), [])
									.filter((v, i, a) => a.findIndex((v2) => v2?.id === v?.id) === i)
									.reduce((acc, media) => {
										return acc + (media?.likeIds.length || 0);
									}, 0);
								const sTagCharacterMedia = s.characters
									.map((character) => [...character.media, character.cover])
									.reduce((arr, media) => arr.concat(media), [])
									.filter((v, i, a) => a.findIndex((v2) => v2?.id === v?.id) === i)
									.reduce((acc, media) => {
										return acc + (media?.likeIds.length || 0);
									}, 0);
								if (fTagCharacterMedia < sTagCharacterMedia) return query.sort ? 1 : -1;
								if (fTagCharacterMedia > sTagCharacterMedia) return query.sort ? -1 : 1;
								return 0;
							})
							.map((tag) => {
								const filteredTagLikes = tag.characters
									.map((character) => [...character.media, character.cover])
									.reduce((arr, media) => arr.concat(media), [])
									.filter((v, i, a) => a.findIndex((v2) => v2?.id === v?.id) === i)
									.reduce((acc, media) => {
										return acc + (media?.likeIds.length || 0);
									}, 0);
								return (
									<Link
										href={`/tag/${tag.id}`}
										key={tag.id}
									>
										<a>
											<Card
												media={tag.cover?.mimetype.includes('image') ? tag.cover : null}
												body={
													<div>
														<h2 className="card-title !mb-0 group-hover:link">{tag.name}</h2>
														<p className="truncate">{tag.description}</p>
													</div>
												}
												actions={
													<button className="flex gap-1 text-base">
														<HeartIcon className="w-6 fill-red-500" />
														{filteredTagLikes}
													</button>
												}
											/>
										</a>
									</Link>
								);
							})}
				</Masonry>
			</Container>
		</>
	);
};
export default TagsPage;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
	return validateUser(context, ({ session }: any) => {
		return { props: { session } };
	});
};
