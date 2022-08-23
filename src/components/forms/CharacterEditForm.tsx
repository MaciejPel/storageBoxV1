import { useState } from 'react';
import { closeModal } from '../../utils/functions';
import { trpc } from '../../utils/trpc';

interface CharacterEditFormProps {
	id: string;
	name: string;
	description: string;
	tags: string[];
}

const CharacterEditForm: React.FC<CharacterEditFormProps> = ({ id, name, description, tags }) => {
	const [character, setCharacter] = useState({ characterId: id, name, description, tags });
	const [error, setError] = useState<{ message?: string; field?: string }>();

	const utils = trpc.useContext();
	const tagsQuery = trpc.useQuery(['tag.all']);
	const characterEditMutation = trpc.useMutation(['character.edit'], {
		onSuccess() {
			utils.invalidateQueries(['character.single', { characterId: id }]);
			closeModal('characterEdit');
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
			<label htmlFor="tags" className="label cursor-pointer pb-0 w-full">
				<span className="label-text">Tags</span>
			</label>
			<div className="columns-2 xl:columns-3">
				{tagsQuery.isSuccess &&
					tagsQuery.data.map((tag) => (
						<label
							htmlFor={tag.id}
							className="label justify-start gap-2 cursor-pointer"
							key={tag.id}
						>
							<input
								type="checkbox"
								value={tag.id}
								id={tag.id}
								name="tag"
								className="checkbox"
								checked={character.tags.includes(tag.id)}
								onChange={(e) => {
									setCharacter({
										...character,
										tags: e.target.checked
											? [...character.tags, e.target.value]
											: character.tags.filter((tag) => tag != e.target.value),
									});
								}}
							/>
							<span className="label-text">{tag.name}</span>
						</label>
					))}
			</div>
			<div className="card-actions justify-end btn-group gap-0 w-full mt-2">
				{characterEditMutation.isLoading ? (
					<button title="Loading" type="button" className="btn loading w-1/2">
						Processing...
					</button>
				) : (
					<>
						<input
							type="reset"
							className="btn btn-warning sm:w-1/6"
							value="Reset"
							onClick={() => {
								setCharacter({ ...character, name, description, tags });
								setError({});
							}}
						/>
						<input
							type="submit"
							className="btn btn-primary w-1/3"
							value="Submit"
							onClick={(e) => {
								e.preventDefault();
								characterEditMutation.mutate(character);
							}}
						/>
					</>
				)}
			</div>
		</form>
	);
};
export default CharacterEditForm;
