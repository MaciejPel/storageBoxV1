import { useState } from 'react';
import { trpc } from '../../utils/trpc';

interface CharacterEditFormProps {
	id: string;
	name: string;
	description: string;
	tags: string[];
}

const CharacterEditForm: React.FC<CharacterEditFormProps> = ({ id, name, description, tags }) => {
	const [character, setCharacter] = useState({ characterId: id, name, description, tags });
	const utils = trpc.useContext();
	const tagsQuery = trpc.useQuery(['tag.all']);
	const characterMutation = trpc.useMutation(['character.edit'], {
		onSuccess() {
			utils.invalidateQueries('character.single');
		},
	});

	return (
		<form className="form-control">
			<label htmlFor="name" className="label cursor-pointer pb-1">
				<span className="label-text">Name</span>
			</label>
			<input
				type="text"
				id="name"
				className="input input-bordered"
				value={character.name}
				onChange={(e) => setCharacter({ ...character, name: e.target.value })}
			/>
			<label htmlFor="description" className="label cursor-pointer pb-1 w-full">
				<span className="label-text">Description</span>
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
										tags:
											e.target.checked === true
												? [...character.tags, e.target.value]
												: character.tags.filter((tag) => tag != e.target.value),
									});
								}}
							/>
							<span className="label-text">{tag.name}</span>
						</label>
					))}
			</div>
			<div className="card-actions justify-end btn-group gap-0 w-full">
				<input
					type="reset"
					className="btn btn-error"
					value="Reset"
					onClick={() => setCharacter({ ...character, name, description, tags })}
				/>
				<input
					type="submit"
					className="btn btn-primary"
					value="Submit"
					onClick={(e) => {
						e.preventDefault();
						characterMutation.mutate(character);
						const modal = document.getElementById('characterEdit') as HTMLInputElement;
						modal.checked = false;
					}}
				/>
			</div>
		</form>
	);
};
export default CharacterEditForm;
