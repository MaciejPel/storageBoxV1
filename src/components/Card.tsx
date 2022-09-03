/* eslint-disable @next/next/no-img-element */
import { PhotographIcon } from '@heroicons/react/solid';
import { ReactNode } from 'react';
import { bunnyCDN } from '../utils/constants';

interface CardProps {
	image?: {
		id: string;
		fileName: string;
		fileExtension: string;
		mimetype: string;
		likeIds?: string[];
	} | null;
	body?: ReactNode;
	actions?: ReactNode;
}

const Card: React.FC<CardProps> = ({ image, body, actions }) => {
	return (
		<div className="card card-compact static bg-base-100 card-bordered mb-4">
			{image?.mimetype?.includes('image') && (
				<img
					src={`${bunnyCDN}/${image.id}.${image.fileExtension}`}
					alt={`${image.fileName}.${image.fileExtension}`}
				/>
			)}
			{image?.mimetype?.includes('video') && (
				<video controls={true}>
					<source
						src={`${bunnyCDN}/${image.id}.${image.fileExtension}`}
						type={image.mimetype}
					/>
				</video>
			)}
			{!image && <PhotographIcon />}
			<div className="card-body w-full bg-base-300">
				{body} {actions && <div className="card-actions justify-end gap-0">{actions}</div>}
			</div>
		</div>
	);
};
export default Card;
