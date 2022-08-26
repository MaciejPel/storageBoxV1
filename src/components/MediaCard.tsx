/* eslint-disable @next/next/no-img-element */
import { bunnyCDN } from '../utils/constants';
import {
	ExternalLinkIcon,
	HeartIcon,
	SparklesIcon,
	TrashIcon,
	XIcon,
} from '@heroicons/react/solid';
import { trpc } from '../utils/trpc';
import { useSession } from 'next-auth/react';
import Modal from './Modal';
import { useState } from 'react';

interface CharacterMediaCardProps {
	cardType: 'media' | 'character-media' | 'tag-media';
	assign?: boolean;
	data?: {
		characterIds: string[];
		mediaIds: string[];
	};
	setData?: React.Dispatch<React.SetStateAction<{ characterIds: string[]; mediaIds: string[] }>>;
	name?: string;
	mediaId: string;
	characterId?: string;
	fileName: string;
	fileExtension: string;
	mimetype: string;
	likeIds: string[];
	tagId?: string;
	tagCover?: string | null;
}

const MediaCard: React.FC<CharacterMediaCardProps> = ({
	cardType,
	assign,
	data,
	setData,
	name,
	mediaId,
	characterId,
	fileName,
	fileExtension,
	mimetype,
	likeIds,
	tagId,
	tagCover,
}) => {
	const { data: session } = useSession();
	const [confirm, setConfirm] = useState<string>('');
	const [toConfirm, setToConfirm] = useState<string>('');
	const src = `${bunnyCDN}/${mediaId}.${fileExtension}`;

	const utils = trpc.useContext();
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
		},
	});
	const tagSetMainMutation = trpc.useMutation(['tag.setMain'], {
		onSuccess() {
			utils.invalidateQueries(['tag.single']);
			utils.invalidateQueries(['tag.all']);
			utils.invalidateQueries(['tag.media']);
		},
	});

	return (
		<div className="card card-compact static w-full bg-base-300 card-bordered mb-4">
			{mimetype.includes('video') && (
				<video controls={true}>
					<source src={src} type="video/mp4" />
				</video>
			)}
			{mimetype.includes('image') && <img src={src} alt={`${fileName}.${fileExtension}`} />}
			<div className="card-body">
				{name && <h2 className="text-lg break-words">{name}</h2>}
				<div className="card-actions justify-end gap-0">
					{cardType === 'character-media' && characterId && (
						<button
							type="button"
							title="Remove image from character"
							className="btn btn-ghost p-3"
							onClick={() => {
								characterRemoveMediaMutation.mutate({ characterId, mediaId });
							}}
						>
							<XIcon className="w-6 transition-all duration-300" />
						</button>
					)}
					{/* {cardType === 'media' && (
						<Modal
							buttonContent={<TrashIcon className="w-6 transition-all duration-200" />}
							buttonType="card"
							id="mediaDelete"
							modalTitle="Delete media"
						>
							<form
								className="flex flex-col gap-4"
								onSubmit={(e) => {
									e.preventDefault();
									mediaDeleteMutation.mutate({ mediaId });
								}}
							>
								<div>
									<label className="label pb-1 cursor-pointer" htmlFor="name">
										<span className="label-text">
											Confirm by typing <span className="font-extrabold">{name}</span> in
										</span>
									</label>
									<input
										id="name"
										type="text"
										placeholder={name}
										className="input w-full input-bordered"
										required
										value={confirm}
										onChange={(e) => setConfirm(e.target.value)}
									/>
								</div>
								<div className="flex justify-end">
									{mediaDeleteMutation.isLoading && (
										<button type="button" title="Processing" className="btn loading">
											Processing...
										</button>
									)}
									{!mediaDeleteMutation.isLoading && (
										<input
											type="submit"
											className="btn btn-error"
											value="Delete"
											disabled={name !== confirm}
										/>
									)}
								</div>
							</form>
						</Modal>
					)} */}
					{assign && data && setData && (
						<label htmlFor={'assignMedia-' + mediaId} className="btn btn-ghost p-3">
							<input
								type="checkbox"
								className="checkbox"
								id={'assignMedia-' + mediaId}
								checked={data?.mediaIds.includes(mediaId)}
								onChange={(e) =>
									setData({
										...data,
										mediaIds: e.target.checked
											? [...data.mediaIds, mediaId]
											: data.mediaIds.filter((id) => id !== mediaId),
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
							mediaUpdateMutation.mutate({ mediaId });
						}}
					>
						<HeartIcon
							className={`w-6 transition-all duration-300 ${
								likeIds.includes(session?.user.id || '') ? 'fill-red-600 ' : ''
							}`}
						/>
						<span className="text-md font-bold">{likeIds.length}</span>
					</button>
					{cardType === 'character-media' && characterId && mimetype.includes('image') && (
						<button
							type="button"
							title="Set image as main"
							className="btn btn-ghost p-3 gap-1 group"
							onClick={() => {
								characterSetMainMutation.mutate({ mediaId, characterId });
							}}
						>
							<SparklesIcon className="w-6 group-hover:fill-warning duration-300 transition-all" />
						</button>
					)}
					{cardType === 'tag-media' && tagId && mediaId !== tagCover && mimetype.includes('image') && (
						<button
							type="button"
							title="Set image as main"
							className="btn btn-ghost p-3 gap-1 group"
							onClick={() => {
								tagSetMainMutation.mutate({ mediaId, tagId });
							}}
						>
							<SparklesIcon className="w-6 group-hover:fill-warning duration-300 transition-all" />
						</button>
					)}
					<a href={src} target="_blank" rel="noreferrer" className="btn btn-ghost p-3">
						<ExternalLinkIcon className="w-6" />
					</a>
				</div>
			</div>
		</div>
	);
};
export default MediaCard;