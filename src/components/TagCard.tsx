/* eslint-disable @next/next/no-img-element */

import { ExternalLinkIcon, PencilAltIcon, PhotographIcon, TrashIcon } from '@heroicons/react/solid';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { bunnyCDN } from '../utils/constants';
import { closeModal } from '../utils/functions';
import { trpc } from '../utils/trpc';
import TagEditForm from './forms/TagEditFrom';
import Modal from './Modal';

interface TagCardProps {
	id: string;
	name: string;
	author: string;
	description: string | null;
	image?: {
		id: string;
		fileName: string;
		fileExtension: string;
		mimetype: string;
	} | null;
	sumOfLikes: number;
}

const TagCard: React.FC<TagCardProps> = ({ id, name, author, description, image, sumOfLikes }) => {
	const router = useRouter();
	const { data: session } = useSession();
	const [readMore, setReadMore] = useState<boolean>(false);
	const [confirm, setConfirm] = useState<string>('');
	const [editTag, setEditTag] = useState<boolean>(false);
	const [deleteTag, setDeleteTag] = useState<boolean>(false);

	const imageURL =
		image && image.mimetype.includes('image') && `${bunnyCDN}/${image.id}.${image.fileExtension}`;

	const tagQuery = trpc.useQuery(['tag.single', { tagId: id }], {
		enabled: session ? true : false,
	});
	const tagDeleteMutation = trpc.useMutation(['tag.delete'], {
		onSuccess() {
			toast.success('Tag has been removed', {
				className: '!bg-base-300 !text-base-content !rounded-xl',
			});
			setDeleteTag(false);
			router.push('/tag');
		},
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		tagDeleteMutation.mutate({ tagId: id });
	};

	return (
		<div className="card card-compact static w-full bg-base-300 col-span-4 card-bordered">
			{imageURL ? (
				<img src={imageURL} alt={`${image.fileName}.${image.fileExtension}`} />
			) : (
				<PhotographIcon />
			)}
			<div className="card-body justify-between">
				<div className="flex flex-col gap-2">
					<div>
						<h2 className="card-title !mb-0">{name}</h2>
						<h3 className="font-normal">
							Created by: <span className="font-bold hover:link">{author}</span>
						</h3>
					</div>
					<p className="break-words">
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
					<button
						type="button"
						title="Delete tag"
						className="btn btn-ghost"
						onClick={() => setDeleteTag(true)}
					>
						<TrashIcon className="w-6 group-hover:fill-error transition-all duration-200" />
					</button>
					<Modal open={deleteTag} setOpen={setDeleteTag} modalTitle="Delete tag">
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
								{tagDeleteMutation.isLoading && (
									<button type="button" title="Processing" className="btn loading">
										Processing...
									</button>
								)}
								{!tagDeleteMutation.isLoading && (
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
					<button
						type="button"
						title="Edit character"
						className="btn btn-ghost"
						onClick={() => setEditTag(true)}
					>
						<PencilAltIcon className="w-6" />
					</button>
					<Modal open={editTag} setOpen={setEditTag} modalTitle="Edit tag">
						<TagEditForm
							id={id}
							setEditTag={setEditTag}
							name={tagQuery.data?.name || ''}
							description={tagQuery.data?.description || ''}
						/>
					</Modal>

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
export default TagCard;
