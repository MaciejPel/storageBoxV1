/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { trpc } from '../../utils/trpc';
import { toast } from 'react-toastify';
import { bunnyCDN, defaultBreakpointColumns } from '../../utils/constants';
import { revalidateUser } from '../../utils/revalidateUser';
import {
	ExternalLinkIcon,
	HeartIcon,
	PencilAltIcon,
	SparklesIcon,
	TrashIcon,
	XIcon,
} from '@heroicons/react/solid';
import Masonry from 'react-masonry-css';
import Container from '../../components/Container';
import Meta from '../../components/Meta';
import Modal from '../../components/Modal';
import Card from '../../components/Card';
import UploadForm from '../../components/forms/UploadForm';
import CharacterEditForm from '../../components/forms/CharacterEditForm';

const CharacterPage = () => {
	const router = useRouter();
	const characterId = router.query.id as string;

	const { data: session } = useSession();
	const [readMore, setReadMore] = useState<boolean>(false);
	const [modal, setModal] = useState<{ edit: boolean; delete: boolean }>({
		edit: false,
		delete: false,
	});
	const [confirm, setConfirm] = useState<string>('');

	const characterQuery = trpc.useQuery(['character.single', { characterId }], {
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
			utils.invalidateQueries(['character.single', { characterId }]);
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
	const characterSetMainMutation = trpc.useMutation(['character.setMain'], {
		onSuccess() {
			utils.invalidateQueries(['character.single']);
			utils.invalidateQueries(['character.all']);
		},
	});
	const characterRemoveMediaMutation = trpc.useMutation(['character.removeMedia'], {
		onSuccess() {
			utils.invalidateQueries(['character.single']);
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
							media={
								characterQuery.data.cover?.mimetype.includes('image')
									? characterQuery.data.cover
									: null
							}
							body={
								<div className="flex flex-col gap-2">
									<div>
										<h2 className="card-title !mb-0">{characterQuery.data.name}</h2>
										<h3 className="font-normal">
											Created by:{' '}
											<Link href={`/user/${characterQuery.data.author.id}`}>
												<a className="font-bold hover:link">
													{characterQuery.data.author.username}
												</a>
											</Link>
										</h3>
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
									</div>
									<p className="flex gap-1 flex-wrap">
										{characterQuery.data.tags.map((tag) => (
											<Link
												href={`/tag/${tag.id}`}
												key={tag.id}
											>
												<a>
													<span className="badge badge-md hover:bg-base-content hover:text-base-100 font-semibold !py-3">
														{tag.name}
													</span>
												</a>
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
												characterDeleteMutation.mutate({ characterId });
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
											id={characterId}
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
													? 'fill-red-600'
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
					<div className="card card-compact card-bordered static text-base-content bg-base-300 2xl:col-span-3 lg:col-span-2 sm:col-span-1 mb-4">
						<div className="card-body items-center justify-between">
							<UploadForm characterId={characterId} />
						</div>
					</div>
				</div>
				<Masonry
					breakpointCols={{ ...defaultBreakpointColumns, default: 4 }}
					className="flex w-full gap-4"
					columnClassName="masonry-grid-column"
				>
					{characterQuery?.data?.media
						.sort((f, s) => s.likeIds.length - f.likeIds.length)
						.map((media) => (
							<Card
								key={media.id}
								media={media}
								actions={
									<>
										<button
											type="button"
											title="Remove image from character"
											className="btn btn-ghost p-3"
											onClick={() => {
												characterRemoveMediaMutation.mutate({ characterId, mediaId: media.id });
											}}
										>
											<XIcon className="w-6 transition-all duration-300" />
										</button>
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
													characterSetMainMutation.mutate({ mediaId: media.id, characterId });
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
						))}
				</Masonry>
			</Container>
		</>
	);
};

export default CharacterPage;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
	return revalidateUser(context, ({ session }: any) => {
		return { props: { session } };
	});
};
