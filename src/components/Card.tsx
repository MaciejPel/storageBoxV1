/* eslint-disable @next/next/no-img-element */
import { PhotographIcon } from '@heroicons/react/solid';
import { ReactNode } from 'react';
import { bunnyCDN } from '../utils/constants';

interface CardProps {
	media?: {
		id: string;
		fileName: string;
		fileExtension: string;
		mimetype: string;
		likeIds?: string[];
	} | null;
	body?: ReactNode;
	actions?: ReactNode;
}

const Card: React.FC<CardProps> = ({ media, body, actions }) => {
	return (
		<div className="card card-compact static bg-base-100 card-bordered mb-4">
			{media?.mimetype?.includes('image') && (
				<img
					src={`${bunnyCDN}/${media.id}.${media.fileExtension}`}
					alt={`${media.fileName}.${media.fileExtension}`}
					title={`${media.fileName}.${media.fileExtension}`}
				/>
			)}
			{media?.mimetype?.includes('video') && (
				<video controls={true}>
					<source
						src={`${bunnyCDN}/${media.id}.${media.fileExtension}`}
						type={media.mimetype}
					/>
				</video>
			)}
			{!media && <PhotographIcon />}
			<div className="card-body w-full bg-base-300">
				{body} {actions && <div className="card-actions justify-end gap-0">{actions}</div>}
			</div>
		</div>
	);
};
export default Card;
