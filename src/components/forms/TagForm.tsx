import { useState } from 'react';
import { trpc } from '../../utils/trpc';

const TagForm: React.FC = () => {
	const [tag, setTag] = useState<{ name: string }>({ name: '' });
	const [error, setError] = useState<{ message?: string; field?: string }>();
	const utils = trpc.useContext();
	const tagMutation = trpc.useMutation(['tag.create'], {
		onSuccess: () => {
			utils.invalidateQueries(['tag.all']);
			const modal = document.getElementById('tag') as HTMLInputElement;
			modal.checked = false;
			setTag({ name: '' });
		},
		onError: (error) => {
			const fieldErrors = error.data?.zodError?.fieldErrors;
			// how to fix double state update?
			if (fieldErrors?.name) setError({ ...error, message: fieldErrors.name[0], field: 'name' });
		},
	});
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		tagMutation.mutate(tag);
	};

	return (
		<form onSubmit={handleSubmit}>
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
					placeholder="Tag's name"
					className="input w-full input-bordered"
					onChange={(e) => setTag({ ...tag, name: e.target.value })}
					required
					value={tag.name}
				/>
			</div>

			<div className="btn-group w-full pt-3">
				{tagMutation.isLoading ? (
					<button type="button" className="btn w-full loading disabled">
						Processing...
					</button>
				) : (
					<div className="flex justify-end w-full btn-group">
						<input
							className="btn btn-error rounded w-1/6"
							type="reset"
							value="Reset"
							onClick={() => {
								setTag({ name: '' });
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
export default TagForm;
