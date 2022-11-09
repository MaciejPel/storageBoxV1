import { useState } from 'react';
import { trpc } from '../../utils/trpc';

const TagForm: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
	const [tag, setTag] = useState<{ name: string; description: string }>({
		name: '',
		description: '',
	});
	const [error, setError] = useState<{ message?: string; field?: string }>();
	const utils = trpc.useContext();
	const tagMutation = trpc.useMutation(['tag.create'], {
		onSuccess: () => {
			utils.invalidateQueries(['tag.all']);
			closeModal();
			setTag({ name: '', description: '' });
			tagMutation.reset();
		},
		onError: (error) => {
			const fieldErrors = error.data?.zodError?.fieldErrors;
			// how to fix double state update?
			if (fieldErrors?.name) setError({ ...error, message: fieldErrors.name[0], field: 'name' });
			if (fieldErrors?.description)
				setError({ ...error, message: fieldErrors.description[0], field: 'description' });
		},
	});
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		tagMutation.mutate(tag);
	};

	return (
		<form onSubmit={handleSubmit}>
			<div>
				<label
					className="label pb-1 cursor-pointer"
					htmlFor="name"
				>
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
					placeholder="Tag's name"
					className="input w-full input-bordered"
					onChange={(e) => setTag({ ...tag, name: e.target.value })}
					required
					value={tag.name}
				/>
			</div>
			<div>
				<label
					className="label pb-1 cursor-pointer"
					htmlFor="description"
				>
					<span className="label-text">
						Description
						{error?.field === 'description' && (
							<span className="text-error text-sm"> {error.message}</span>
						)}
					</span>
				</label>
				<textarea
					className="textarea textarea-bordered w-full textarea-ghost pb-1 h-24"
					id="description"
					onChange={(e) => setTag({ ...tag, description: e.target.value })}
					placeholder="Tag's descritpion"
					value={tag.description}
					maxLength={140}
				/>
			</div>

			<div className="btn-group justify-end mt-3">
				{tagMutation.isLoading && (
					<button
						title="Loading"
						type="button"
						className="btn loading w-1/2"
					>
						Processing...
					</button>
				)}
				{tagMutation.isSuccess && (
					<button
						title="Success"
						type="button"
						className="btn btn-success w-1/2"
					>
						Success
					</button>
				)}
				{!tagMutation.isLoading && !tagMutation.isSuccess && (
					<>
						<input
							className="btn btn-error rounded sm:w-1/6"
							type="reset"
							value="Reset"
							onClick={() => {
								setTag({ name: '', description: '' });
								setError({});
							}}
						/>
						<input
							className="btn btn-primary rounded w-1/3"
							type="submit"
							value="Submit"
						/>
					</>
				)}
			</div>
		</form>
	);
};
export default TagForm;
