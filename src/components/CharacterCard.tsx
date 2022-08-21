/* eslint-disable @next/next/no-img-element */
import {
	ExternalLinkIcon,
	HeartIcon,
	PencilAltIcon,
	PhotographIcon,
	TrashIcon,
} from '@heroicons/react/solid';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { trpc } from '../utils/trpc';
import CharacterEditForm from './forms/CharacterEditForm';
import Modal from './Modal';

interface CharacterCardProps {
	id: string;
	name: string;
	description: string | null;
	image?: {
		id: string;
		fileName: string;
		fileType: string;
		likeIds: string[];
	};
}

const CharacterCard: React.FC<CharacterCardProps> = ({ id, name, description, image }) => {
	const { data: session } = useSession();
	const [readMore, setReadMore] = useState<boolean>(false);
	const imageURL =
		image &&
		`${process.env.NEXT_PUBLIC_CDN_URL}/${process.env.NEXT_PUBLIC_STORAGE_FOLDER}/${id}/${image.id}.${image.fileType}`;
	const utils = trpc.useContext();
	const mediaUpdate = trpc.useMutation(['media.update'], {
		onSuccess() {
			utils.invalidateQueries(['character.single']);
		},
	});
	const characterQuery = trpc.useQuery(['character.single', { characterId: id as string }], {
		enabled: session ? true : false,
	});

	return (
		<div className="card card-compact static w-full bg-base-300 col-span-1 card-bordered">
			{image ? (
				<img src={imageURL} alt={`${image.fileName}.${image.fileType}`} />
			) : (
				<PhotographIcon />
			)}
			<div className="card-body">
				<h2 className="card-title">{name}</h2>
				<div className="flex flex-col gap-1">
					<p>
						{!readMore
							? description?.slice(0, 50) + (description && description?.length >= 60 ? '... ' : '')
							: description + ' '}
						{description && description?.length >= 60 && (
							<span
								className="font-bold btn-link text-base-content cursor-pointer"
								onClick={() => setReadMore(!readMore)}
							>
								{!readMore ? 'Read more' : 'Hide'}
							</span>
						)}
					</p>
				</div>
				<div className="card-actions justify-end gap-0">
					<button className="btn btn-ghost p-3">
						<TrashIcon className="w-6 group-hover:fill-error transition-all duration-200" />
					</button>
					{image && (
						<>
							<Modal
								buttonContent={<PencilAltIcon className="w-6" />}
								buttonType="card"
								id="characterEdit"
								modalTitle="Edit character"
							>
								<CharacterEditForm
									id={id}
									name={characterQuery.data?.name || ''}
									description={characterQuery.data?.description || ''}
									tags={characterQuery.data?.tags.map((tag) => tag.id) || []}
								/>
							</Modal>
							<button
								className="btn btn-ghost p-3"
								onClick={() => mediaUpdate.mutate({ mediaId: image.id })}
							>
								<HeartIcon
									className={`w-6 group-hover:fill-warning transition-all duration-200 ${
										image.likeIds.includes(session?.user.id || '') ? 'fill-red-600 ' : ''
									}`}
								/>
							</button>
							<a href={imageURL} target="_blank" rel="noreferrer" className="btn btn-ghost p-3">
								<ExternalLinkIcon className="w-6" />
							</a>
						</>
					)}
				</div>
			</div>
		</div>
	);
};
export default CharacterCard;
