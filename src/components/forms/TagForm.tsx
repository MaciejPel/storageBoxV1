import { useState } from 'react';
import { closeModal } from '../../utils/functions';
import { trpc } from '../../utils/trpc';

const TagForm: React.FC = () => {
	const [tag, setTag] = useState<{ name: string }>({ name: '' });
	const [error, setError] = useState<{ message?: string; field?: string }>();
	const utils = trpc.useContext();
	const tagMutation = trpc.useMutation(['tag.create'], {
		onSuccess: () => {
			utils.invalidateQueries(['tag.all']);
			closeModal('tag');
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

			<div className="btn-group justify-end mt-3">
				{tagMutation.isLoading ? (
					<button title="Loading" type="button" className="btn loading w-1/2">
						Processing...
					</button>
				) : (
					<>
						<input
							className="btn btn-error rounded sm:w-1/6"
							type="reset"
							value="Reset"
							onClick={() => {
								setTag({ name: '' });
								setError({});
							}}
						/>
						<input className="btn btn-primary rounded w-1/3" type="submit" value="Submit" />
					</>
				)}
			</div>
		</form>
	);
};
export default TagForm;
