import { useState } from 'react';
import { GetServerSidePropsContext, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { trpc } from '../../utils/trpc';
import { bunnyCDN, defaultBreakpointColumns } from '../../utils/constants';
import { validateUser } from '../../utils/validateUser';
import {
	ExternalLinkIcon,
	HashtagIcon,
	HeartIcon,
	UploadIcon,
	UserGroupIcon,
} from '@heroicons/react/solid';
import Masonry from 'react-masonry-css';
import Container from '../../components/Container';
import Meta from '../../components/Meta';
import Card from '../../components/Card';

type activeTabProps = 'liked' | 'uploaded' | 'characters' | 'tags';

const tabsDesc = {
	liked: 'Liked media',
	uploaded: 'Uploaded media',
	characters: 'Created characters',
	tags: 'Created tags',
};

const UserPage: NextPage = () => {
	const router = useRouter();
	const userId = router.query.id as string;
	const { data: session } = useSession();
	const [activeTab, setActiveTab] = useState<activeTabProps>('liked');

	const utils = trpc.useContext();
	const userQuery = trpc.useQuery(['user.single', { userId }], { enabled: session ? true : false });
	const mediaUpdateMutation = trpc.useMutation(['media.update'], {
		onSuccess() {
			utils.invalidateQueries(['character.single']);
			utils.invalidateQueries(['media.all']);
			utils.invalidateQueries(['tag.media']);
			utils.invalidateQueries(['user.single']);
		},
	});

	if (userQuery.isLoading) return <Container type="center">Loading user ⌚</Container>;

	if (userQuery.isError) return <Container type="center">Error occurred ⚠</Container>;

	return (
		<>
			<Meta title={`${userQuery.data?.username} | User`} />
			<Container type="start">
				<div className="w-full flex items-center gap-2 justify-between flex-col md:flex-row mb-2">
					<div className="text-4xl font-extrabold">
						{session?.user.username} - {tabsDesc[activeTab]}
					</div>
					<div className="tabs tabs-boxed">
						<a
							className={`tab gap-1 static ${activeTab === 'liked' ? 'tab-active' : ''}`}
							onClick={() => setActiveTab('liked')}
						>
							<HeartIcon className="w-5" />
							{userQuery.data?.likedMedia.length}
						</a>
						<a
							className={`tab gap-1 static ${activeTab === 'characters' ? 'tab-active' : ''}`}
							onClick={() => setActiveTab('characters')}
						>
							<UserGroupIcon className="w-5" /> {userQuery.data?.createdCharacters.length}
						</a>
						<a
							className={`tab gap-1 static ${activeTab === 'tags' ? 'tab-active' : ''}`}
							onClick={() => setActiveTab('tags')}
						>
							<HashtagIcon className="w-5" /> {userQuery.data?.createdTags.length}
						</a>
						<a
							className={`tab gap-1 static ${activeTab === 'uploaded' ? 'tab-active' : ''}`}
							onClick={() => setActiveTab('uploaded')}
						>
							<UploadIcon className="w-5" /> {userQuery.data?.uploadedMedia.length}
						</a>
					</div>
				</div>
				<Masonry
					breakpointCols={defaultBreakpointColumns}
					className="flex w-full gap-4"
					columnClassName="masonry-grid-column"
				>
					{activeTab === 'liked' &&
						userQuery.data?.likedMedia
							.sort((f, s) => s.likeIds.length - f.likeIds.length)
							.map((media) => (
								<Card
									key={media.id}
									media={media}
									actions={
										<>
											<button
												type="button"
												title="Like image"
												className="btn btn-ghost p-2 gap-1"
												onClick={() => {
													mediaUpdateMutation.mutate({ mediaId: media.id });
												}}
											>
												<HeartIcon
													className={`w-6 transition-all duration-300 ${
														media.likeIds.includes(session?.user.id || '') ? 'fill-red-600 ' : ''
													}`}
												/>
												<span className="font-bold">{media.likeIds.length}</span>
											</button>
											<a
												className="btn btn-ghost"
												target="_blank"
												href={`${bunnyCDN}/${media.id}.${media.fileExtension}`}
												rel="noreferrer"
											>
												<ExternalLinkIcon className="w-6" />
											</a>
										</>
									}
								/>
							))}
					{activeTab === 'characters' &&
						userQuery.data?.createdCharacters
							.sort(
								(f, s) =>
									(s.cover?.likeIds.length || 0) +
									s.media.reduce((acc, media) => acc + media.likeIds.length, 0) -
									((f.cover?.likeIds.length || 0) +
										f.media.reduce((acc, media) => acc + media.likeIds.length, 0))
							)
							.map((character) => (
								<Link
									href={`/character/${character.id}`}
									key={character.id}
								>
									<a>
										<Card
											media={character.cover}
											body={
												<>
													<div>
														<h2 className="card-title !mb-0">{character.name}</h2>
														<p className="truncate">{character.description}</p>
													</div>
													<p className="flex gap-1 flex-wrap">
														{character.tags.map((tag) => (
															<Link
																href={`/tag/${tag.id}`}
																key={tag.id}
															>
																<span className="badge badge-md hover:bg-base-content hover:text-base-100 !py-3 cursor-pointer font-semibold">
																	{tag.name}
																</span>
															</Link>
														))}
													</p>
												</>
											}
											actions={
												<div className="flex items-center gap-1 font-bold">
													<HeartIcon
														className={`w-6  ${
															character.cover?.likeIds.includes(session?.user.id || '')
																? 'fill-red-600'
																: ''
														}`}
													/>
													{(character.cover?.likeIds.length || 0) +
														character.media.reduce((acc, media) => {
															return acc + media.likeIds.length;
														}, 0)}
												</div>
											}
										/>
									</a>
								</Link>
							))}
					{activeTab === 'tags' &&
						userQuery.data?.createdTags.map((tag) => (
							<Link
								href={`/tag/${tag.id}`}
								key={tag.id}
							>
								<a>
									<Card
										media={tag.cover}
										body={
											<div>
												<h2 className="card-title !mb-0">{tag.name}</h2>
												<p className="truncate">{tag.description}</p>
											</div>
										}
									/>
								</a>
							</Link>
						))}
					{activeTab === 'uploaded' &&
						userQuery.data?.uploadedMedia
							.sort((f, s) => s.likeIds.length - f.likeIds.length)
							.map((media) => (
								<Card
									key={media.id}
									media={media}
									actions={
										<>
											<button
												type="button"
												title="Like image"
												className="btn btn-ghost p-2 gap-1"
												onClick={() => {
													mediaUpdateMutation.mutate({ mediaId: media.id });
												}}
											>
												<HeartIcon
													className={`w-6 transition-all duration-300 ${
														media.likeIds.includes(session?.user.id || '') ? 'fill-red-600 ' : ''
													}`}
												/>
												<span className="font-bold">{media.likeIds.length}</span>
											</button>
											<a
												className="btn btn-ghost"
												target="_blank"
												href={`${bunnyCDN}/${media.id}.${media.fileExtension}`}
												rel="noreferrer"
											>
												<ExternalLinkIcon className="w-6" />
											</a>
										</>
									}
								/>
							))}
				</Masonry>
			</Container>
		</>
	);
};

export default UserPage;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
	return validateUser(context, ({ session }: any) => {
		return { props: { session } };
	});
};
