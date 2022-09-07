import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';

const LoginForm = () => {
	const router = useRouter();
	const [credentials, setCredentials] = useState({
		username: '',
		password: '',
		loading: false,
		success: false,
	});

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setCredentials({ ...credentials, loading: true });
		const res = await signIn('credentials', {
			redirect: false,
			username: credentials.username,
			password: credentials.password,
		});
		if (!res?.ok) {
			setCredentials({ ...credentials, loading: false, success: false });
			toast.error('Invalid credentials or not verified', {
				className: '!bg-base-300 !text-base-content !rounded-xl',
			});
		}
		if (res?.ok) {
			setCredentials({ ...credentials, loading: false, success: true });
			router.push('/');
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col card static bg-base-300 sm:w-96 w-full form-control"
		>
			<div className="w-full card-body">
				<div className="text-4xl font-extrabold text-center pb-2 ">Login</div>
				<div>
					<label
						className="label pb-1 cursor-pointer"
						htmlFor="username"
					>
						<span className="label-text">Username</span>
					</label>
					<input
						id="username"
						type="text"
						placeholder="Your username"
						className="input w-full input-bordered"
						onChange={(e) => {
							setCredentials({ ...credentials, username: e.target.value });
						}}
					/>
				</div>
				<div>
					<label
						className="label pb-1 cursor-pointer"
						htmlFor="password"
					>
						<span className="label-text">Password</span>
					</label>
					<input
						id="password"
						type="password"
						placeholder="Your password"
						className="input w-full input-bordered"
						onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
					/>
				</div>
				<div className="flex flex-col gap-3 pt-4">
					{credentials.loading && (
						<button
							type="button"
							title="Processing..."
							className="btn w-full loading disabled"
						>
							Processing...
						</button>
					)}
					{credentials.success && (
						<button
							type="button"
							title="Success"
							className="btn btn-success w-full disabled"
						>
							Success
						</button>
					)}
					{!credentials.success && !credentials.loading && (
						<input
							className="btn btn-primary w-full rounded"
							type="submit"
							value="Submit"
						/>
					)}
				</div>
			</div>
		</form>
	);
};
export default LoginForm;
