/* eslint-disable @next/next/no-img-element */
import {
	ExternalLinkIcon,
	HeartIcon,
	PencilAltIcon,
	PhotographIcon,
	TrashIcon,
} from '@heroicons/react/solid';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import { toast } from 'react-toastify';
import { bunnyCDN } from '../utils/constants';
import { closeModal } from '../utils/functions';
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
		fileExtension: string;
		mimetype: string;
		likeIds: string[];
	} | null;
	tags: {
		id: string;
		name: string;
	}[];
	sumOfLikes: number;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
	id,
	name,
	description,
	image,
	tags,
	sumOfLikes,
}) => {
	const router = useRouter();
	const { data: session } = useSession();
	const [readMore, setReadMore] = useState<boolean>(false);
	const [confirm, setConfirm] = useState<string>('');

	const imageURL =
		image &&
		image.mimetype.includes('image') &&
		`${bunnyCDN}/${id}/${image.id}.${image.fileExtension}`;

	const utils = trpc.useContext();
	const mediaUpdateMutation = trpc.useMutation(['media.update'], {
		onSuccess() {
			utils.invalidateQueries(['character.single', { characterId: id }]);
		},
	});
	const characterQuery = trpc.useQuery(['character.single', { characterId: id as string }], {
		enabled: session ? true : false,
	});
	const characterDeleteMutation = trpc.useMutation(['character.delete'], {
		onSuccess() {
			toast.success('Character has been removed', {
				className: '!bg-base-300 !text-base-content !rounded-xl',
			});
			closeModal('characterDelete');
			router.push('/');
		},
	});

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		characterDeleteMutation.mutate({ characterId: id });
	};

	return (
		<div className="card card-compact static w-full bg-base-300 col-span-1 card-bordered">
			{imageURL ? (
				<img src={imageURL} alt={`${image.fileName}.${image.fileExtension}`} />
			) : (
				<PhotographIcon />
			)}
			<div className="card-body justify-between">
				<div className="flex flex-col gap-2">
					<h2 className="card-title !mb-0">{name}</h2>
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
					<p className="flex gap-1 flex-wrap">
						{tags.map((tag) => (
							<span
								key={tag.id}
								className="badge badge-md badge-outline hover:bg-base-100 !py-3 cursor-pointer"
							>
								{tag.name}
							</span>
						))}
					</p>
				</div>
				<div className="card-actions justify-end gap-0">
					<Modal
						buttonContent={
							<TrashIcon className="w-6 group-hover:fill-error transition-all duration-200" />
						}
						buttonType="card"
						id="characterDelete"
						modalTitle="Delete character"
					>
						<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
								<input
									type="submit"
									className="btn btn-error"
									value="Delete"
									disabled={name !== confirm}
								/>
							</div>
						</form>
					</Modal>
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
						type="button"
						title="Like image"
						className="btn btn-ghost p-3 gap-1"
						onClick={() => {
							if (imageURL) mediaUpdateMutation.mutate({ mediaId: image.id });
						}}
					>
						<HeartIcon
							className={`w-6 group-hover:fill-warning transition-all duration-200 ${
								imageURL && image.likeIds.includes(session?.user.id || '') ? 'fill-red-600 ' : ''
							}`}
						/>
						<span className="text-md font-bold">{sumOfLikes}</span>
					</button>
					{imageURL && (
						<a href={imageURL} target="_blank" rel="noreferrer" className="btn btn-ghost p-3">
							<ExternalLinkIcon className="w-6" />
						</a>
					)}
				</div>
			</div>
		</div>
	);
};
export default CharacterCard;
