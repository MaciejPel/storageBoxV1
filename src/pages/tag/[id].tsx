import { useState } from 'react';
import { GetServerSidePropsContext, NextPage } from 'next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import { toast } from 'react-toastify';
import { bunnyCDN, defaultBreakpointColumns } from '../../utils/constants';
import { validateUser } from '../../utils/validateUser';
import {
	ExternalLinkIcon,
	HeartIcon,
	PencilAltIcon,
	SparklesIcon,
	TrashIcon,
	UsersIcon,
} from '@heroicons/react/solid';
import Masonry from 'react-masonry-css';
import Meta from '../../components/Meta';
import Container from '../../components/Container';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import Error from '../../components/Error';
import TagEditForm from '../../components/forms/TagEditFrom';

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

	if (tagQuery.isLoading)
		return (
			<Container type="center">
				<Loader />
			</Container>
		);

	if (tagQuery.isError)
		return (
			<Container type="center">
				<Error message="Something went wrong" />
			</Container>
		);

	return (
		<>
			<Meta title={tagQuery.data?.name + ' | Tag'} />
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
										<TrashIcon className="w-6 hover:fill-error transition-all duration-200" />
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
									>
										<UsersIcon className="w-6" />
										{tagQuery.data.characterIds.length}
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
					breakpointCols={defaultBreakpointColumns}
					className="flex w-full gap-4"
					columnClassName="masonry-grid-column"
				>
					{tagQuery.data?.characters?.map((character) => {
						return (
							<Card
								key={character.id}
								media={character.cover}
								body={
									<>
										<div>
											<h2 className="card-title !mb-0 group-hover:link">{character.name}</h2>
										</div>
										<p className="flex gap-1 flex-wrap">
											{character.tags.map((tag) => (
												<Link
													href={`/tag/${tag.id}`}
													key={tag.id}
												>
													<span
														className={`badge badge-md hover:bg-base-content hover:text-base-100 !py-3 cursor-pointer font-semibold`}
													>
														{tag.name}
													</span>
												</Link>
											))}
										</p>
									</>
								}
								actions={
									<button className="flex gap-1 text-base">
										<HeartIcon className="w-6 fill-red-500" />
										{character.media.reduce((acc, media) => acc + media.likeIds.length, 0) +
											(character.cover?.likeIds.length || 0)}
									</button>
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
	return validateUser(context, ({ session }: any) => {
		return { props: { session } };
	});
};
