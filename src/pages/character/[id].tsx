/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { trpc } from '../../utils/trpc';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import { toast } from 'react-toastify';
import Masonry from 'react-masonry-css';
import Container from '../../components/Container';
import UploadForm from '../../components/forms/UploadForm';
import Meta from '../../components/Meta';
import MediaCard from '../../components/MediaCard';
import { GetServerSidePropsContext } from 'next';
import Card from '../../components/Card';
import { useState } from 'react';
import Link from 'next/link';
import { ExternalLinkIcon, HeartIcon, PencilAltIcon, TrashIcon } from '@heroicons/react/solid';
import Modal from '../../components/Modal';
import CharacterEditForm from '../../components/forms/CharacterEditForm';
import { bunnyCDN } from '../../utils/constants';

const breakpointColumnsObj = {
	default: 4,
	1536: 4,
	1280: 3,
	1024: 3,
	768: 2,
	640: 1,
};

const CharacterPage = () => {
	const router = useRouter();
	const { id } = router.query;

	const { data: session } = useSession();
	const [readMore, setReadMore] = useState<boolean>(false);
	const [modal, setModal] = useState<{ edit: boolean; delete: boolean }>({
		edit: false,
		delete: false,
	});
	const [confirm, setConfirm] = useState<string>('');

	const characterQuery = trpc.useQuery(['character.single', { characterId: id as string }], {
		enabled: session ? true : false,
		onError(err) {
			if (err.data?.code === 'NOT_FOUND') {
				toast.error('Character not found', {
					className: '!bg-base-300 !text-base-content !rounded-xl',
				});
			} else {
				toast.error('Something went wrong', {
					className: '!bg-base-300 !text-base-content !rounded-xl',
				});
			}
			router.push('/');
		},
	});
	const utils = trpc.useContext();
	const mediaUpdateMutation = trpc.useMutation(['media.update'], {
		onSuccess() {
			utils.invalidateQueries(['character.single', { characterId: id as string }]);
		},
	});
	const characterDeleteMutation = trpc.useMutation(['character.delete'], {
		onSuccess() {
			toast.success('Character has been removed', {
				className: '!bg-base-300 !text-base-content !rounded-xl',
			});
			setModal({ ...modal, delete: false });
			router.push('/');
		},
	});

	if (characterQuery.isLoading) return <Container type="center">Loading character ⌚</Container>;

	if (characterQuery.isError) return <Container type="center">Error occurred ⚠</Container>;

	return (
		<>
			<Meta title={characterQuery.data?.name + ' | Character' || '...'} />
			<Container type="start">
				<div className="grid 2xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 w-full gap-4 mb-4">
					{characterQuery.data && (
						<Card
							image={characterQuery.data.cover}
							body={
								<div className="flex flex-col gap-2">
									<div>
										<h2 className="card-title !mb-0">{characterQuery.data.name}</h2>
										<h3 className="font-normal">
											Created by:{' '}
											<span className="font-bold hover:link">
												{characterQuery.data.author.username}
											</span>
										</h3>
									</div>
									<p className="break-words">
										{!readMore
											? characterQuery.data.description?.slice(0, 50) +
											  (characterQuery.data.description &&
											  characterQuery.data.description?.length >= 60
													? '... '
													: '')
											: characterQuery.data.description + ' '}
										{characterQuery.data.description &&
											characterQuery.data.description?.length >= 60 && (
												<span
													className="font-bold btn-link text-base-content cursor-pointer"
													onClick={() => setReadMore(!readMore)}
												>
													{!readMore ? 'Read more' : 'Hide'}
												</span>
											)}
									</p>
									<p className="flex gap-1 flex-wrap">
										{characterQuery.data.tags.map((tag) => (
											<Link
												href={`/tag/${tag.id}`}
												key={tag.id}
											>
												<span className="badge badge-md badge-outline hover:bg-base-100 !py-3 cursor-pointer">
													{tag.name}
												</span>
											</Link>
										))}
									</p>
								</div>
							}
							actions={
								<>
									<button
										type="button"
										title="Delete character"
										className="btn btn-ghost"
										onClick={() => setModal({ ...modal, delete: true })}
									>
										<TrashIcon className="w-6 group-hover:fill-error transition-all duration-200" />
									</button>
									<Modal
										open={modal.delete}
										onClose={() => setModal({ ...modal, delete: false })}
										modalTitle="Delete character"
									>
										<form
											className="flex flex-col gap-4"
											onSubmit={(e) => {
												e.preventDefault();
												characterDeleteMutation.mutate({ characterId: id as string });
											}}
										>
											<div>
												<label
													className="label pb-1 cursor-pointer"
													htmlFor="name"
												>
													<span className="label-text">
														Confirm by typing{' '}
														<span className="font-extrabold">{characterQuery.data.name}</span> in
													</span>
												</label>
												<input
													id="name"
													type="text"
													placeholder={characterQuery.data.name}
													className="input w-full input-bordered"
													required
													value={confirm}
													onChange={(e) => setConfirm(e.target.value)}
												/>
											</div>
											<div className="flex justify-end">
												{characterDeleteMutation.isLoading && (
													<button
														type="button"
														title="Processing"
														className="btn loading"
													>
														Processing...
													</button>
												)}
												{!characterDeleteMutation.isLoading && (
													<input
														type="submit"
														className="btn btn-error"
														value="Delete"
														disabled={characterQuery.data.name !== confirm}
													/>
												)}
											</div>
										</form>
									</Modal>

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
										modalTitle="Edit character"
									>
										<CharacterEditForm
											id={id as string}
											closeModal={() => setModal({ ...modal, edit: false })}
											name={characterQuery.data?.name || ''}
											description={characterQuery.data?.description || ''}
											tags={characterQuery.data?.tags.map((tag) => tag.id) || []}
										/>
									</Modal>
									<button
										type="button"
										title="Like image"
										className="btn btn-ghost p-3 gap-1"
										onClick={() => {
											if (characterQuery.data.cover)
												mediaUpdateMutation.mutate({ mediaId: characterQuery.data.cover.id });
										}}
									>
										<HeartIcon
											className={`w-6 group-hover:fill-warning transition-all duration-200 ${
												characterQuery.data.cover &&
												characterQuery.data.cover.likeIds.includes(session?.user.id || '')
													? 'fill-red-600 '
													: ''
											}`}
										/>
										<span className="text-md font-bold">
											{characterQuery.data.media.reduce(
												(acc, media) => acc + media.likeIds.length,
												0
											) + (characterQuery.data.cover?.likeIds.length || 0)}
											{characterQuery.data.cover &&
												`(${characterQuery.data.cover?.likeIds.length})`}
										</span>
									</button>
									{characterQuery.data.cover && (
										<a
											href={`${bunnyCDN}/${characterQuery.data.cover.id}.${characterQuery.data.cover.fileExtension}`}
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
					<div className="card card-compact card-bordered static text-base-content bg-base-300 2xl:col-span-3 lg:col-span-2 sm:col-span-1">
						<div className="card-body items-center justify-between">
							<UploadForm />
						</div>
					</div>
				</div>
				<Masonry
					breakpointCols={breakpointColumnsObj}
					className="flex w-full gap-4"
					columnClassName="masonry-grid-column"
				>
					{characterQuery?.data?.media
						.sort((f, s) => s.likeIds.length - f.likeIds.length)
						.map((media) => (
							<MediaCard
								cardType="character-media"
								key={media.id}
								characterId={id as string}
								mediaId={media.id}
								fileName={media.fileName}
								fileExtension={media.fileExtension}
								mimetype={media.mimetype}
								likeIds={media.likeIds}
							/>
						))}
				</Masonry>
			</Container>
		</>
	);
};

export default CharacterPage;

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
