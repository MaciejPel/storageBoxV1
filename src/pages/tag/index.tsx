/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { GetServerSidePropsContext, NextPage } from 'next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { trpc } from '../../utils/trpc';
import { defaultBreakpointColumns } from '../../utils/constants';
import { validateUser } from '../../utils/validateUser';
import { UsersIcon } from '@heroicons/react/solid';
import Masonry from 'react-masonry-css';
import Container from '../../components/Container';
import Meta from '../../components/Meta';
import Modal from '../../components/Modal';
import TagForm from '../../components/forms/TagForm';
import Card from '../../components/Card';
import Search from '../../components/Search';
import Loader from '../../components/Loader';
import Error from '../../components/Error';

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

	if (tagsQuery.isError)
		return (
			<Container type="center">
				<Error message="Something went wrong" />
			</Container>
		);

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
							.sort((f, s) => s.characterIds.length - f.characterIds.length)
							.map((tag) => {
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
														<UsersIcon className="w-6" />
														{tag.characterIds.length}
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
