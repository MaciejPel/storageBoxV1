import { useState } from 'react';
import { GetServerSidePropsContext, NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { trpc } from '../utils/trpc';
import { toast } from 'react-toastify';
import { bunnyCDN } from '../utils/constants';
import { validateUser } from '../utils/validateUser';
import { ExternalLinkIcon, HeartIcon, TrashIcon } from '@heroicons/react/solid';
import Masonry from 'react-masonry-css';
import Meta from '../components/Meta';
import Container from '../components/Container';
import Search from '../components/Search';
import Modal from '../components/Modal';
import Card from '../components/Card';
import Loader from '../components/Loader';
import UploadForm from '../components/forms/UploadForm';

interface DataProps {
	characterIds: string[];
	mediaIds: string[];
}

interface QueryParams {
	string: string;
	sort: boolean;
}

const breakpointColumnsObj = {
	default: 4,
	1536: 3,
	1280: 2,
	1024: 2,
	768: 2,
	640: 1,
};

const MediaPage: NextPage = () => {
	const { data: session } = useSession();
	const [data, setData] = useState<DataProps>({ characterIds: [], mediaIds: [] });
	const [assign, setAssign] = useState<boolean>(false);
	const [modal, setModal] = useState<{ delete: boolean; upload: boolean }>({
		delete: false,
		upload: false,
	});
	const [confirm, setConfirm] = useState<{ name: string; input: string; id: string }>({
		name: '',
		input: '',
		id: '',
	});
	const [query, setQuery] = useState<QueryParams>({ string: '', sort: true });

	const utils = trpc.useContext();
	const mediaQuery = trpc.useQuery(['media.all'], { enabled: session ? true : false });
	const charactersQuery = trpc.useQuery(['character.all'], { enabled: session ? true : false });
	const mediaAssignMutation = trpc.useMutation(['media.assign'], {
		onSuccess() {
			utils.invalidateQueries(['character.all']);
			utils.invalidateQueries(['character.single']);
			setData({ characterIds: [], mediaIds: [] });
			toast.success('Media assigned', {
				className: '!bg-base-300 !text-base-content !rounded-xl',
			});
		},
	});
	const mediaUpdateMutation = trpc.useMutation(['media.update'], {
		onSuccess() {
			utils.invalidateQueries(['character.single']);
			utils.invalidateQueries(['media.all']);
			utils.invalidateQueries(['tag.media']);
		},
	});
	const mediaDeleteMutation = trpc.useMutation(['media.delete'], {
		onSuccess() {
			utils.invalidateQueries(['character.single']);
			utils.invalidateQueries(['media.all']);
			setModal({ ...modal, delete: false });
		},
	});

	if (mediaQuery.isLoading)
		return (
			<Container type="center">
				<Loader />
			</Container>
		);

	return (
		<>
			<Meta title="Media" />
			<Container type="start">
				<div className="w-full flex justify-between items-center">
					<h2 className="text-4xl font-extrabold my-4 text-start w-1/4 mt-0 mb-2">Media</h2>
					{mediaQuery.isSuccess &&
						mediaQuery.data.length > 0 &&
						charactersQuery.isSuccess &&
						charactersQuery.data.length > 0 && (
							<div className="flex gap-2 w-3/4 justify-end items-center">
								<label
									htmlFor="assign"
									className="label cursor-pointer"
								>
									Assign mode
								</label>
								<input
									type="checkbox"
									className="toggle"
									id="assign"
									onChange={() => setAssign(!assign)}
								/>
							</div>
						)}
				</div>
				<div className="w-full flex items-center gap-1 md:flex-row flex-col mb-2">
					<Search
						setQuery={setQuery}
						query={query}
					/>
					<button
						title="Upload media"
						type="button"
						className="btn w-full md:w-auto"
						onClick={() => setModal({ ...modal, upload: true })}
					>
						Add media
					</button>
					<Modal
						modalTitle="Upload media"
						open={modal.upload}
						onClose={() => setModal({ ...modal, upload: false })}
					>
						<div className="w-full mt-1">
							<UploadForm closeModal={() => setModal({ ...modal, upload: false })} />
						</div>
					</Modal>
				</div>
				{mediaQuery.data?.length === 0 && <Container type="center">No media yet 🤐</Container>}
				{mediaQuery.isSuccess && mediaQuery.data?.length > 0 && (
					<div className="w-full gap-4 md:flex">
						<Modal
							open={modal.delete}
							onClose={() => setModal({ ...modal, delete: false })}
							modalTitle="Delete media"
						>
							<form
								className="flex flex-col gap-4"
								onSubmit={(e) => {
									e.preventDefault();
									mediaDeleteMutation.mutate({ mediaId: confirm.id });
								}}
							>
								<div>
									<label
										className="label pb-1 cursor-pointer"
										htmlFor="name"
									>
										<span className="label-text">
											Confirm by typing <span className="font-extrabold">{confirm.name}</span> in
										</span>
									</label>
									<input
										id="name"
										type="text"
										placeholder={confirm.name}
										className="input w-full input-bordered"
										required
										value={confirm.input}
										onChange={(e) => setConfirm({ ...confirm, input: e.target.value })}
									/>
								</div>
								<div className="flex justify-end">
									{mediaDeleteMutation.isLoading && (
										<button
											type="button"
											title="Processing"
											className="btn loading"
										>
											Processing...
										</button>
									)}
									{!mediaDeleteMutation.isLoading && (
										<input
											type="submit"
											className="btn btn-error"
											value="Delete"
											disabled={confirm.name !== confirm.input}
										/>
									)}
								</div>
							</form>
						</Modal>
						<div className={`${assign ? 'md:w-3/4' : 'md:w-full'}`}>
							<Masonry
								breakpointCols={breakpointColumnsObj}
								className="flex w-full gap-4"
								columnClassName="masonry-grid-column"
							>
								{mediaQuery.data
									?.filter((media) =>
										(
											media.fileName.toLowerCase() +
											'.' +
											media.fileExtension.toLowerCase()
										).includes(query.string)
									)
									.sort((f, s) => {
										if (f.likeIds.length < s.likeIds.length) return query.sort ? 1 : -1;
										if (f.likeIds.length > s.likeIds.length) return query.sort ? -1 : 1;
										return 0;
									})
									.map((media) => (
										<Card
											key={media.id}
											media={media}
											actions={
												<>
													<button
														type="button"
														title="Delete media"
														className="btn btn-ghost"
														onClick={() => {
															setConfirm({
																name: media.fileName + '.' + media.fileExtension,
																input: '',
																id: media.id,
															});
															setModal({ ...modal, delete: true });
														}}
													>
														<TrashIcon className="w-6" />
													</button>
													{assign && (
														<label
															htmlFor={'assignMedia-' + media.id}
															className="btn btn-ghost p-3"
														>
															<input
																type="checkbox"
																className="checkbox"
																id={'assignMedia-' + media.id}
																checked={data?.mediaIds.includes(media.id)}
																disabled={!assign}
																onChange={(e) =>
																	setData({
																		...data,
																		mediaIds: e.target.checked
																			? [...data.mediaIds, media.id]
																			: data.mediaIds.filter((id) => id !== media.id),
																	})
																}
															/>
														</label>
													)}
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
																media.likeIds.includes(session?.user.id || '')
																	? 'fill-red-600 '
																	: ''
															}`}
														/>
														<span className="text-md font-bold">{media.likeIds.length}</span>
													</button>
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
						</div>
						<div className={`flex flex-col mb-2 ${assign ? 'md:w-1/4' : 'hidden'}`}>
							<h2 className="text-2xl font-bold">Characters</h2>
							<div className="grid grid-cols-2 md:grid-cols-1">
								{charactersQuery.data?.map((character) => (
									<label
										key={character.id}
										className="w-full cursor-pointer flex gap-2 p-2 hover:bg-base-300 rounded-lg"
										htmlFor={'assignCharacter-' + character.id}
									>
										<input
											type="checkbox"
											className="checkbox"
											id={'assignCharacter-' + character.id}
											checked={data.characterIds.includes(character.id)}
											disabled={!assign}
											onChange={(e) =>
												setData({
													...data,
													characterIds: e.target.checked
														? [...data.characterIds, character.id]
														: data.characterIds.filter(
																(characterId) => characterId !== character.id
														  ),
												})
											}
										/>
										{character.name}
									</label>
								))}
							</div>
							<div className="md:btn-group-vertical w-full mt-2">
								<button
									title="Reset form"
									type="button"
									className="btn btn-warning w-1/3 md:w-full md:rounded rounded-r-none"
									onClick={() => setData({ characterIds: [], mediaIds: [] })}
								>
									Reset
								</button>
								<button
									title="Submit form"
									type="submit"
									className="btn btn-primary w-2/3 md:w-full md:rounded rounded-l-none"
									disabled={!assign}
									onClick={() => mediaAssignMutation.mutate(data)}
								>
									Submit
								</button>
							</div>
						</div>
					</div>
				)}
			</Container>
		</>
	);
};
export default MediaPage;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
	return validateUser(context, ({ session }: any) => {
		return { props: { session } };
	});
};
