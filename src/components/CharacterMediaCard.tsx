/* eslint-disable @next/next/no-img-element */
import { bunnyCDN } from '../utils/constants';
import { ExternalLinkIcon, HeartIcon, SparklesIcon, XIcon } from '@heroicons/react/solid';
import { trpc } from '../utils/trpc';
import { useSession } from 'next-auth/react';

interface CharacterMediaCardProps {
	mediaId: string;
	characterId: string;
	fileName: string;
	fileExtension: string;
	mimetype: string;
	likeIds: string[];
}

const CharacterMediaCard: React.FC<CharacterMediaCardProps> = ({
	mediaId,
	characterId,
	fileName,
	fileExtension,
	mimetype,
	likeIds,
}) => {
	const { data: session } = useSession();

	const utils = trpc.useContext();
	const characterSetMainMutation = trpc.useMutation(['character.setMain'], {
		onSuccess() {
			utils.invalidateQueries(['character.single']);
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
		},
	});

	return (
		<div className="card card-compact static w-full bg-base-300 col-span-1 card-bordered mb-4">
			{mimetype.includes('video') && (
				<video controls={true}>
					<source src={`${bunnyCDN}/${characterId}/${mediaId}.${fileExtension}`} type="video/mp4" />
				</video>
			)}
			{mimetype.includes('image') && (
				<img
					src={`${bunnyCDN}/${characterId}/${mediaId}.${fileExtension}`}
					alt={`${fileName}.${fileExtension}`}
				/>
			)}
			<div className="card-body">
				<div className="card-actions justify-end gap-0">
					<button
						type="button"
						title="Like image"
						className="btn btn-ghost p-2 gap-1"
						onClick={() => {
							characterRemoveMediaMutation.mutate({ characterId, mediaId });
						}}
					>
						<XIcon className="w-6 transition-all duration-300" />
					</button>
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
					{mimetype.includes('image') && (
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
					<a
						href={`${bunnyCDN}/${characterId}/${mediaId}.${fileExtension}`}
						target="_blank"
						rel="noreferrer"
						className="btn btn-ghost p-3"
					>
						<ExternalLinkIcon className="w-6" />
					</a>
				</div>
			</div>
		</div>
	);
};
export default CharacterMediaCard;
