import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { ColorSwatchIcon, UserIcon, LogoutIcon } from '@heroicons/react/solid';
import { CubeIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';

const themes = ['light', 'retro', 'dark', 'black', 'night', 'dracula', 'coffee', 'luxury'];

const Header = () => {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const { theme: currentTheme, setTheme } = useTheme();
	const { data: session, status } = useSession();

	useEffect(() => setMounted(true), []);

	const navItems: { title: string; href: string; icon: JSX.Element }[] = [
		{ title: 'Profile', href: '/profile', icon: <UserIcon className="h-5 w-5" /> },
	];

	if (!mounted) return null;

	return (
		<header className="navbar sticky top-0 backdrop-blur bg-opacity-50 bg-base-300 flex justify-center h-16 shadow-sm">
			<div className="flex justify-between lg:w-4/5 w-full">
				<div className="px-2">
					<Link href="/">
						<a className="text-lg font-bold flex items-center rounded px-2 gap-2 btn btn-ghost normal-case">
							<CubeIcon className="w-10 h-full" />
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
								{navItems.map((item, index) => (
									<Link href={item.href} key={index}>
										<a className="btn btn-sm btn-ghost text-base-content normal-case gap-1">
											{item.icon}
											{item.title}
										</a>
									</Link>
								))}
							</>
						)}
						<div className="dropdown dropdown-end">
							<label tabIndex={0} className="btn btn-sm gap-1 normal-case btn-ghost">
								<ColorSwatchIcon className="w-5 h-5" />
								<span className="hidden md:inline">Themes</span>
							</label>
							<ul
								tabIndex={0}
								className="menu dropdown-content px-1 shadow bg-base-200 rounded w-40 mt-4 pt-1 z-50"
							>
								{themes.map((theme, index) => (
									<li
										data-theme={theme}
										key={index}
										onClick={() => setTheme(theme)}
										className={`bg-base-100 text-base-content hover:bg-base-200 rounded mb-1 border-2 ${
											currentTheme === theme
												? 'border-accent'
												: 'border-base-100 hover:border-base-200'
										}`}
									>
										<a className="font-semibold">
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
									router.push('/');
								}}
							>
								<LogoutIcon className="h-5 w-5" />
								Logout
							</a>
						)}
					</div>
				</nav>
			</div>
		</header>
	);
};
export default Header;
