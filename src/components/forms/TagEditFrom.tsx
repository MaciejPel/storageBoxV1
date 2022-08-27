import { useState } from 'react';
import { closeModal } from '../../utils/functions';
import { trpc } from '../../utils/trpc';

interface TagEditFormProps {
	id: string;
	setEditTag: React.Dispatch<React.SetStateAction<boolean>>;
	name: string;
	description: string;
}

const TagEditForm: React.FC<TagEditFormProps> = ({ id, setEditTag, name, description }) => {
	const [character, setCharacter] = useState({ tagId: id, name, description });
	const [error, setError] = useState<{ message?: string; field?: string }>();

	const utils = trpc.useContext();
	const tagUpdateMutation = trpc.useMutation(['tag.update'], {
		onSuccess() {
			utils.invalidateQueries(['tag.single', { tagId: id }]);
			setEditTag(false);
		},
		onError: (error) => {
			const fieldErrors = error.data?.zodError?.fieldErrors;
			// how to fix double state update?
			if (fieldErrors?.description)
				setError({ ...error, message: fieldErrors.description[0], field: 'description' });
			if (fieldErrors?.name) setError({ ...error, message: fieldErrors.name[0], field: 'name' });
		},
	});

	return (
		<form className="form-control">
			<label htmlFor="name" className="label cursor-pointer pb-1">
				<span className="label-text">
					Name
					{error && error.field === 'name' && (
						<span className="text-error text-sm"> {error.message}</span>
					)}
				</span>
			</label>
			<input
				type="text"
				id="name"
				className="input input-bordered"
				value={character.name}
				onChange={(e) => setCharacter({ ...character, name: e.target.value })}
			/>
			<label htmlFor="description" className="label cursor-pointer pb-1 w-full">
				<span className="label-text">
					Description
					{error?.field === 'description' && (
						<span className="text-error text-sm"> {error.message}</span>
					)}
				</span>
			</label>
			<textarea
				id="description"
				className="textarea input-bordered h-44"
				value={character.description}
				onChange={(e) => setCharacter({ ...character, description: e.target.value })}
			/>
			<div className="card-actions justify-end btn-group gap-0 w-full mt-4">
				{tagUpdateMutation.isLoading && (
					<button title="Loading" type="button" className="btn loading w-1/2">
						Processing...
					</button>
				)}
				{!tagUpdateMutation.isLoading && (
					<>
						<input
							type="reset"
							className="btn btn-warning sm:w-1/6"
							value="Reset"
							onClick={() => {
								setCharacter({ ...character, name, description });
								setError({});
							}}
						/>
						<input
							type="submit"
							className="btn btn-primary w-1/3"
							value="Submit"
							onClick={(e) => {
								e.preventDefault();
								tagUpdateMutation.mutate(character);
							}}
						/>
					</>
				)}
			</div>
		</form>
	);
};
export default TagEditForm;
