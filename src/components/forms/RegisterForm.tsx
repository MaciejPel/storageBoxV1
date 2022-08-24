import { useState } from 'react';
import { trpc } from '../../utils/trpc';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

const RegisterForm: React.FC = () => {
	const router = useRouter();
	const [credentials, setCredentials] = useState({
		username: '',
		password: '',
		confirmPassword: '',
	});
	const [error, setError] = useState<{ message?: string; field?: string }>();
	const userMutation = trpc.useMutation(['auth.register'], {
		onSuccess() {
			setError({});
			toast.success('Contact admin for verification', {
				className: '!bg-base-300 !text-base-content !rounded-xl',
			});
			setCredentials({ username: '', password: '', confirmPassword: '' });
			router.push('/login');
		},
		onError: (error) => {
			if (error?.data?.code === 'CONFLICT') {
				toast.error(error.message, {
					className: '!bg-base-300 !text-base-content !rounded-xl',
				});
			}
			const fieldErrors = error.data?.zodError?.fieldErrors;
			if (fieldErrors?.username)
				setError({ ...error, message: fieldErrors.username[0], field: 'username' });
			if (fieldErrors?.password)
				setError({ ...error, message: fieldErrors.password[0], field: 'password' });
		},
	});

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (credentials.password === credentials.confirmPassword) {
			userMutation.mutate(credentials);
		} else {
			setError({ ...error, message: "doesn't match password", field: 'confirmPassword' });
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col card static bg-base-300 sm:w-96 w-full form-control"
		>
			<div className="w-full  card-body">
				<div className="text-4xl font-extrabold text-center pb-2">Register</div>
				<div>
					<label className="label pb-1 cursor-pointer" htmlFor="username">
						<span className="label-text">
							Username
							{error && error.field === 'username' && (
								<span className="text-error text-sm"> {error.message}</span>
							)}
						</span>
					</label>
					<input
						id="username"
						type="text"
						placeholder="Your username"
						className="input w-full input-bordered"
						onChange={(e) => {
							setCredentials({ ...credentials, username: e.target.value });
						}}
						value={credentials.username}
						required
					/>
				</div>
				<div>
					<label className="label pb-1 cursor-pointer" htmlFor="password">
						<span className="label-text">
							Password
							{error && error.field === 'password' && (
								<span className="text-error text-sm"> {error.message}</span>
							)}
						</span>
					</label>
					<input
						id="password"
						type="password"
						placeholder="Your password"
						className="input w-full input-bordered"
						onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
						value={credentials.password}
						required
					/>
				</div>
				<div>
					<label className="label pb-1 cursor-pointer" htmlFor="confirm-password">
						<span className="label-text">
							Confirm password
							{error && error.field === 'confirmPassword' && (
								<span className="text-error text-sm"> {error.message}</span>
							)}
						</span>
					</label>
					<input
						id="confirm-password"
						type="password"
						placeholder="Repeat your password"
						className="input w-full input-bordered"
						onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
						value={credentials.confirmPassword}
						required
					/>
				</div>
				<div className="flex flex-col gap-3 pt-4">
					{userMutation.isLoading && (
						<button type="button" title="Processing..." className="btn w-full loading disabled">
							Processing...
						</button>
					)}
					{!userMutation.isLoading && (
						<input className="btn btn-primary w-full rounded" type="submit" value="Submit" />
					)}
				</div>
			</div>
		</form>
	);
};
export default RegisterForm;
