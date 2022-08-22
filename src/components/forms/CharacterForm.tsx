import { useState } from 'react';
import { closeModal } from '../../utils/functions';
import { trpc } from '../../utils/trpc';

const CharacterForm: React.FC = () => {
	const [character, setCharacter] = useState<{ name: string; description: string; tags: string[] }>(
		{ name: '', description: '', tags: [] }
	);
	const [error, setError] = useState<{ message?: string; field?: string }>();

	const utils = trpc.useContext();
	const tagsQuery = trpc.useQuery(['tag.all']);
	const characterMutation = trpc.useMutation(['character.create'], {
		onSuccess: () => {
			utils.invalidateQueries(['character.all']);
			closeModal('character');
			setCharacter({ name: '', description: '', tags: [] });
		},
		onError: (error) => {
			const fieldErrors = error.data?.zodError?.fieldErrors;
			// how to fix double state update?
			if (fieldErrors?.description)
				setError({ ...error, message: fieldErrors.description[0], field: 'description' });
			if (fieldErrors?.name) setError({ ...error, message: fieldErrors.name[0], field: 'name' });
		},
	});

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		characterMutation.mutate(character);
	};

	return (
		<form onSubmit={handleSubmit} className="form-control">
			<div>
				<label className="label pb-1 cursor-pointer" htmlFor="name">
					<span className="label-text">
						Name
						{error && error.field === 'name' && (
							<span className="text-error text-sm"> {error.message}</span>
						)}
					</span>
				</label>
				<input
					id="name"
					type="text"
					placeholder="Character's name"
					className="input w-full input-bordered"
					onChange={(e) => setCharacter({ ...character, name: e.target.value })}
					required
					value={character.name}
				/>
			</div>
			<div>
				<label className="label pb-1 cursor-pointer" htmlFor="description">
					<span className="label-text">
						Description
						{characterMutation.isError && error?.field === 'description' && (
							<span className="text-error text-sm"> {error.message}</span>
						)}
					</span>
				</label>
				<textarea
					className="textarea textarea-bordered w-full textarea-ghost pb-1 h-24"
					id="description"
					onChange={(e) => setCharacter({ ...character, description: e.target.value })}
					placeholder="Character's descritpion"
					value={character.description}
					maxLength={140}
				/>
			</div>
			<div>
				{tagsQuery.isSuccess && tagsQuery.data.length > 0 && (
					<>
						<label className="label pb-1" htmlFor="tags">
							<span className="label-text">Tags</span>
						</label>
						<div className="columns-2 md:columns-3">
							{tagsQuery.data.map((tag) => (
								<label
									htmlFor={tag.id}
									className="label justify-start	gap-2 cursor-pointer"
									key={tag.id}
								>
									<input
										type="checkbox"
										value={tag.id}
										id={tag.id}
										name="tag"
										checked={character.tags.includes(tag.id)}
										className="checkbox"
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
					</>
				)}
			</div>
			<div className="btn-group w-full pt-3">
				{characterMutation.isLoading ? (
					<button title="Loading" type="button" className="btn loading w-1/2">
						Processing...
					</button>
				) : (
					<div className="flex justify-end w-full btn-group">
						<input
							className="btn btn-error rounded sm:w-1/6"
							type="reset"
							value="Reset"
							onClick={() => {
								setCharacter({ name: '', description: '', tags: [] });
								setError({});
							}}
						/>
						<input className="btn btn-primary rounded w-1/3" type="submit" value="Submit" />
					</div>
				)}
			</div>
		</form>
	);
};

export default CharacterForm;
