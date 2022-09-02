import { ExternalLinkIcon, PencilAltIcon, TrashIcon } from '@heroicons/react/solid';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Masonry from 'react-masonry-css';
import { toast } from 'react-toastify';
import Card from '../../components/Card';
import Container from '../../components/Container';
import TagEditForm from '../../components/forms/TagEditFrom';
import MediaCard from '../../components/MediaCard';
import Meta from '../../components/Meta';
import Modal from '../../components/Modal';
import { bunnyCDN } from '../../utils/constants';
import { trpc } from '../../utils/trpc';

const breakpointColumnsObj = {
	default: 5,
	1536: 4,
	1280: 3,
	1024: 3,
	768: 2,
	640: 1,
};

const TagPage = () => {
	const router = useRouter();
	const { id } = router.query;
	const { data: session } = useSession();
	const [readMore, setReadMore] = useState<boolean>(false);
	const [confirm, setConfirm] = useState<string>('');
	const [modal, setModal] = useState<{ edit: boolean; delete: boolean }>({
		edit: false,
		delete: false,
	});

	const tagQuery = trpc.useQuery(['tag.single', { tagId: id as string }], {
		enabled: session ? true : false,
	});
	const tagMediaQuery = trpc.useQuery(['tag.media', { tagId: id as string }], {
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

	const tagsCharacterMedia = tagMediaQuery.data?.characters.map((character) => [
		...character.media,
		character.cover,
	]);
	const mergedMedia = tagsCharacterMedia?.reduce((a, b) => a.concat(b), []);
	const filteredMedia = mergedMedia?.filter(
		(v, i, a) => a.findIndex((v2) => v2?.id === v?.id) === i
	);

	return (
		<>
			<Meta title={`${tagQuery.data?.name} | Tag `} />
			<Container type="start">
				<div className="grid grid-cols-1 w-full gap-4 mb-4">
					{tagQuery.data && (
						<Card
							image={tagQuery.data.cover}
							body={
								<div className="flex flex-col gap-2">
									<div>
										<h2 className="card-title !mb-0">{tagQuery.data.name}</h2>
										<h3 className="font-normal">
											Created by:&nbsp;
											<span className="font-bold hover:link">{tagQuery.data.author.username}</span>
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
												tagDeleteMutation.mutate({ tagId: id as string });
											}}
										>
											<div>
												<label
													className="label pb-1 cursor-pointer"
													htmlFor="name"
												>
													<span className="label-text">
														Confirm by typing
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
											id={id as string}
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
								<MediaCard
									key={media.id}
									cardType="tag-media"
									fileName={media.fileName}
									fileExtension={media.fileExtension}
									mimetype={media.mimetype}
									likeIds={media.likeIds}
									mediaId={media.id}
									tagId={id as string}
									tagCover={tagQuery.data?.cover?.id}
								/>
							);
					})}
				</Masonry>
			</Container>
		</>
	);
};
export default TagPage;
