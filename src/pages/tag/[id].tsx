import {
	ExternalLinkIcon,
	HeartIcon,
	PencilAltIcon,
	SparklesIcon,
	TrashIcon,
} from '@heroicons/react/solid';
import { GetServerSidePropsContext, NextPage } from 'next';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Masonry from 'react-masonry-css';
import { toast } from 'react-toastify';
import Card from '../../components/Card';
import Container from '../../components/Container';
import TagEditForm from '../../components/forms/TagEditFrom';
import Meta from '../../components/Meta';
import Modal from '../../components/Modal';
import { bunnyCDN } from '../../utils/constants';
import { trpc } from '../../utils/trpc';
import { authOptions } from '../api/auth/[...nextauth]';

const breakpointColumnsObj = {
	default: 5,
	1536: 4,
	1280: 3,
	1024: 3,
	768: 2,
	640: 1,
};

const TagPage: NextPage = () => {
	const router = useRouter();
	const tagId = router.query.id as string;
	const { data: session } = useSession();
	const [readMore, setReadMore] = useState<boolean>(false);
	const [confirm, setConfirm] = useState<string>('');
	const [modal, setModal] = useState<{ edit: boolean; delete: boolean }>({
		edit: false,
		delete: false,
	});

	const utils = trpc.useContext();
	const tagQuery = trpc.useQuery(['tag.single', { tagId }], {
		enabled: session ? true : false,
	});
	const tagMediaQuery = trpc.useQuery(['tag.media', { tagId }], {
		enabled: session ? true : false,
	});
	const tagDeleteMutation = trpc.useMutation(['tag.delete'], {
		onSuccess() {
			toast.success('Tag has been removed', {
				className: '!bg-base-300 !text-base-content !rounded-xl',
			});
			setModal({ ...modal, delete: false });
			router.push('/tag');
		},
	});
	const mediaUpdateMutation = trpc.useMutation(['media.update'], {
		onSuccess() {
			utils.invalidateQueries(['character.single']);
			utils.invalidateQueries(['media.all']);
			utils.invalidateQueries(['tag.media']);
			utils.invalidateQueries(['tag.single', { tagId }]);
		},
	});
	const tagSetMainMutation = trpc.useMutation(['tag.setMain'], {
		onSuccess() {
			utils.invalidateQueries(['tag.single']);
			utils.invalidateQueries(['tag.all']);
			utils.invalidateQueries(['tag.media']);
		},
	});

	const tagsCharacterMedia = tagMediaQuery.data?.characters.map((character) => [
		...character.media,
		character.cover,
	]);
	const mergedMedia = tagsCharacterMedia?.reduce((a, b) => a.concat(b), []);
	const filteredMedia = mergedMedia
		?.filter(
			(v, i, a) => a.findIndex((v2) => v2?.id === v?.id) === i && v?.id !== tagQuery.data?.cover?.id
		)
		?.sort((f, s) => {
			if (f && s) return s.likeIds.length - f.likeIds.length;
			return 0;
		});

	if (tagQuery.isLoading) return <Container type="center">Loading tag ⌚</Container>;

	if (tagQuery.isError) return <Container type="center">Error occurred ⚠</Container>;

	return (
		<>
			<Meta title={(tagQuery.data?.name || '...') + ' | Tag'} />
			<Container type="start">
				<div className="grid grid-cols-1 w-full gap-4 mb-4">
					{tagQuery.data && (
						<Card
							media={tagQuery.data.cover?.mimetype.includes('image') ? tagQuery.data.cover : null}
							body={
								<div className="flex flex-col gap-2">
									<div>
										<h2 className="card-title !mb-0">{tagQuery.data.name}</h2>
										<h3 className="font-normal">
											Created by:{' '}
											<Link href={`/user/${tagQuery.data.author.id}`}>
												<a className="font-bold hover:link">{tagQuery.data.author.username}</a>
											</Link>
										</h3>
									</div>
									<p className="break-words">
										{!readMore
											? tagQuery.data.description?.slice(0, 50) +
											  (tagQuery.data.description && tagQuery.data.description?.length >= 60
													? '... '
													: '')
											: tagQuery.data.description + ' '}
										{tagQuery.data.description && tagQuery.data.description?.length >= 60 && (
											<span
												className="font-bold btn-link text-base-content cursor-pointer"
												onClick={() => setReadMore(!readMore)}
											>
												{!readMore ? 'Read more' : 'Hide'}
											</span>
										)}
									</p>
								</div>
							}
							actions={
								<>
									<button
										type="button"
										title="Delete tag"
										className="btn btn-ghost"
										onClick={() => setModal({ ...modal, delete: true })}
									>
										<TrashIcon className="w-6 group-hover:fill-error transition-all duration-200" />
									</button>
									<Modal
										open={modal.delete}
										onClose={() => setModal({ ...modal, delete: false })}
										modalTitle="Delete tag"
									>
										<form
											className="flex flex-col gap-4"
											onSubmit={(e) => {
												e.preventDefault();
												tagDeleteMutation.mutate({ tagId });
											}}
										>
											<div>
												<label
													className="label pb-1 cursor-pointer"
													htmlFor="name"
												>
													<span className="label-text">
														Confirm by typing{' '}
														<span className="font-extrabold">{tagQuery.data.name}</span> in
													</span>
												</label>
												<input
													id="name"
													type="text"
													placeholder={tagQuery.data.name}
													className="input w-full input-bordered"
													required
													value={confirm}
													onChange={(e) => setConfirm(e.target.value)}
												/>
											</div>
											<div className="flex justify-end">
												{tagDeleteMutation.isLoading && (
													<button
														type="button"
														title="Processing"
														className="btn loading"
													>
														Processing...
													</button>
												)}
												{!tagDeleteMutation.isLoading && (
													<input
														type="submit"
														className="btn btn-error"
														value="Delete"
														disabled={tagQuery.data.name !== confirm}
													/>
												)}
											</div>
										</form>
									</Modal>
									<button
										type="button"
										title="Like image"
										className="btn btn-ghost gap-1"
										onClick={() =>
											tagQuery.data?.cover &&
											mediaUpdateMutation.mutate({ mediaId: tagQuery.data.cover.id })
										}
									>
										<HeartIcon
											className={`w-6 ${
												tagQuery.data.cover?.likeIds.includes(session?.user.id || '')
													? 'fill-red-600'
													: ''
											}`}
										/>
										{`${
											(filteredMedia?.reduce((acc, media) => {
												return acc + (media?.likeIds.length || 0);
											}, 0) || 0) + (tagQuery.data.cover?.likeIds.length || 0)
										}
											 (${tagQuery.data.cover?.likeIds.length || 0})`}
									</button>
									<button
										type="button"
										title="Edit character"
										className="btn btn-ghost"
										onClick={() => setModal({ ...modal, edit: true })}
									>
										<PencilAltIcon className="w-6" />
									</button>
									<Modal
										open={modal.edit}
										onClose={() => setModal({ ...modal, edit: false })}
										modalTitle="Edit tag"
									>
										<TagEditForm
											id={tagId}
											closeModal={() => setModal({ ...modal, edit: false })}
											name={tagQuery.data?.name || ''}
											description={tagQuery.data?.description || ''}
										/>
									</Modal>

									{tagQuery.data.cover && (
										<a
											href={`${bunnyCDN}/${tagQuery.data.cover.id}.${tagQuery.data.cover.fileExtension}`}
											target="_blank"
											rel="noreferrer"
											className="btn btn-ghost p-3"
										>
											<ExternalLinkIcon className="w-6" />
										</a>
									)}
								</>
							}
						/>
					)}
				</div>
				<Masonry
					breakpointCols={breakpointColumnsObj}
					className="flex w-full gap-4"
					columnClassName="masonry-grid-column"
				>
					{filteredMedia?.map((media) => {
						if (media)
							return (
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
												<span className="text-md font-bold">{media.likeIds.length}</span>
											</button>
											{media.mimetype.includes('image') && (
												<button
													type="button"
													title="Set image as main"
													className="btn btn-ghost p-3 gap-1 group"
													onClick={() => {
														tagSetMainMutation.mutate({ mediaId: media.id, tagId });
													}}
												>
													<SparklesIcon className="w-6 group-hover:fill-warning duration-300 transition-all" />
												</button>
											)}
											<a
												href={`${bunnyCDN}/${media.id}.${media.fileExtension}`}
												target="_blank"
												rel="noreferrer"
												className="btn btn-ghost p-3"
											>
												<ExternalLinkIcon className="w-6" />
											</a>
										</>
									}
								/>
							);
					})}
				</Masonry>
			</Container>
		</>
	);
};
export default TagPage;

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
