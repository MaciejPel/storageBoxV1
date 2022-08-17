import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Alert from './Alert';
import { AlertTypes } from './Alert';

const LoginForm = () => {
	const [credentials, setCredentials] = useState({ username: '', password: '' });
	const [alert, setAlert] = useState<boolean>(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const res = await signIn('credentials', {
			redirect: false,
			username: credentials.username,
			password: credentials.password,
		});
		if (!res?.ok) setAlert(true);
	};

	return (
		<>
			<Alert
				message="Invalid credentials"
				type={AlertTypes.ERROR}
				duration={5000}
				open={alert}
				setOpen={setAlert}
			/>
			<form onSubmit={handleSubmit} className="flex flex-col card bg-base-300 w-96">
				<div className="form-control w-full max-w-lg card-body">
					<div className="text-4xl font-extrabold text-center pb-2">Login</div>
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
					<div className="flex flex-col gap-3 pt-2">
						<input className="btn btn-primary w-full rounded" type="submit" value="Submit" />
					</div>
				</div>
			</form>
		</>
	);
};
export default LoginForm;
