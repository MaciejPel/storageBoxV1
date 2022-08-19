import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const LoginForm = () => {
	const router = useRouter();
	const [credentials, setCredentials] = useState({ username: '', password: '' });

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const res = await signIn('credentials', {
			redirect: false,
			username: credentials.username,
			password: credentials.password,
		});
		if (!res?.ok)
			toast.error('Invalid credentials or not verified', {
				className: '!bg-base-300 !text-base-content !rounded-xl',
			});
		if (res?.ok) router.push('/');
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col card static bg-base-300 sm:w-96 w-full form-control"
		>
			<div className="w-full card-body">
				<div className="text-4xl font-extrabold text-center pb-2 ">Login</div>
				<div>
					<label className="label pb-1 cursor-pointer" htmlFor="username">
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
					<label className="label pb-1 cursor-pointer" htmlFor="password">
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
					<input className="btn btn-primary w-full rounded" type="submit" value="Submit" />
				</div>
			</div>
		</form>
	);
};
export default LoginForm;
