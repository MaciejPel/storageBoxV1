import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { ColorSwatchIcon, UserIcon, LogoutIcon, LoginIcon } from '@heroicons/react/solid';
import { CubeIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';

const themes = ['light', 'retro', 'dark', 'black', 'night', 'dracula', 'coffee', 'luxury'];

const Header = () => {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const { theme: currentTheme, setTheme } = useTheme();
	const { data: session, status } = useSession();

	useEffect(() => setMounted(true), []);

	if (!mounted) return null;

	return (
		<header className="navbar sticky top-0 backdrop-blur bg-opacity-50 bg-base-300 flex justify-center h-16 shadow-sm">
			<div className="flex justify-between lg:w-4/5 w-full">
				<div className="md:px-2">
					<Link href="/">
						<a className="md:text-lg text-base font-bold flex items-center rounded px-2 md:gap-2 btn btn-ghost normal-case">
							<CubeIcon className="md:w-10 w-7 h-full" />
							<div>
								Storage
								<span className="text-accent">Box</span>
							</div>
						</a>
					</Link>
				</div>
				<nav className="flex justify-end">
					<div className="flex">
						{status === 'authenticated' && (
							<>
								<Link href="/profile">
									<a className="btn btn-sm btn-ghost text-base-content normal-case gap-1 ">
										<UserIcon className="h-5 w-5" />
										<span className="hidden md:inline">Profile</span>
									</a>
								</Link>
							</>
						)}
						<div className="dropdown">
							<label tabIndex={0} className="btn btn-sm gap-1 normal-case btn-ghost">
								<ColorSwatchIcon className="w-5 h-5" />
								<span className="hidden md:inline">Themes</span>
							</label>
							<ul
								tabIndex={0}
								className="menu dropdown-content px-1 shadow bg-base-200 rounded mt-4 pt-1 whitespace-nowrap -ml-4 md:ml-auto md:w-36"
							>
								{themes.map((theme, index) => (
									<li
										data-theme={theme}
										key={index}
										onClick={() => setTheme(theme)}
										className={`bg-base-100 text-base-content hover:bg-base-200 rounded mb-1 ${
											currentTheme === theme ? 'border-2 border-accent' : ''
										}`}
									>
										<a className="font-semibold capitalize">
											{theme} {currentTheme === theme && '✔'}
										</a>
									</li>
								))}
							</ul>
						</div>
						{status === 'authenticated' && (
							<a
								className="btn btn-sm btn-ghost text-base-content normal-case gap-1"
								onClick={() => {
									signOut({ redirect: false });
									router.push('/login');
								}}
							>
								<LogoutIcon className="h-5 w-5 -scale-100" />
								<span className="hidden md:inline">Logout</span>
							</a>
						)}
						{status === 'unauthenticated' && (
							<>
								<Link href="/register">
									<a className="btn btn-sm btn-ghost text-base-content normal-case gap-1 ">
										<LoginIcon className="h-5 w-5 -scale-100" />
										<span className="hidden md:inline">Register</span>
									</a>
								</Link>
							</>
						)}
					</div>
				</nav>
			</div>
		</header>
	);
};
export default Header;
