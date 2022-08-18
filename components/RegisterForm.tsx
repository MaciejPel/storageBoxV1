import { useState } from 'react';
import { trpc } from '../utils/trpc';
import Alert, { AlertTypes } from './Alert';

const RegisterForm: React.FC = () => {
	const [credentials, setCredentials] = useState({
		username: '',
		password: '',
		confirmPassword: '',
	});
	const [alert, setAlert] = useState<boolean>(false);
	const [error, setError] = useState<{ message?: string; field?: string }>();
	const userMutation = trpc.useMutation(['auth.register'], {
		onSuccess() {
			setError({});
			setAlert(true);
			setCredentials({ username: '', password: '', confirmPassword: '' });
		},
		onError: (error) => {
			if (error?.data?.code === 'CONFLICT') {
				setAlert(true);
				setError({ ...error, message: error.message, field: 'alert' });
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
		<>
			<Alert
				message={error?.message || 'Contact admin for verification'}
				type={error?.message ? AlertTypes.ERROR : AlertTypes.SUCCESS}
				open={alert}
				setOpen={setAlert}
			/>
			<form onSubmit={handleSubmit} className="flex flex-col card bg-base-300 w-96 form-control">
				<div className="w-full max-w-lg card-body">
					<div className="text-4xl font-extrabold text-center pb-2">Register</div>
					<div>
						<label className="label pb-1 cursor-pointer" htmlFor="username">
							<span className="label-text">
								Username{' '}
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
								Password{' '}
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
								Confirm password{' '}
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
						<input className="btn btn-primary w-full rounded" type="submit" value="Submit" />
					</div>
				</div>
			</form>
		</>
	);
};
export default RegisterForm;
