/* eslint-disable @next/next/no-img-element */
import { ExternalLinkIcon, HeartIcon, PhotographIcon, TrashIcon } from '@heroicons/react/solid';
import { useState } from 'react';

interface CharacterCardProps {
	id: string;
	name: string;
	description: string | null;
	image?: {
		id: string;
		fileName: string;
		fileType: string;
	};
}

const CharacterCard: React.FC<CharacterCardProps> = ({ id, name, description, image }) => {
	const [readMore, setReadMore] = useState<boolean>(false);
	const imageURL =
		image &&
		`${process.env.NEXT_PUBLIC_CDN_URL}/${process.env.NEXT_PUBLIC_STORAGE_FOLDER}/${id}/${image.id}.${image.fileType}`;

	return (
		<div className="card card-compact static w-full bg-base-300 shadow-xl">
			{image ? (
				<img src={imageURL} alt={`${image.fileName}.${image.fileType}`} />
			) : (
				<PhotographIcon />
			)}
			<div className="card-body">
				<h2 className="card-title">{name}</h2>
				<div className="flex flex-col gap-1">
					<p>
						{!readMore ? `${description?.slice(0, 50)}... ` : description + ' '}
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
						<TrashIcon className="w-6 h-full" />
					</button>
					<button className="btn btn-ghost p-3">
						<HeartIcon className="w-6 h-full" />
					</button>
					{imageURL && (
						<a href={imageURL} target="_blank" rel="noreferrer" className="btn btn-ghost p-3">
							<ExternalLinkIcon className="w-6 h-full" />
						</a>
					)}
				</div>
			</div>
		</div>
	);
};
export default CharacterCard;
