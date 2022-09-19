import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
	ColorSwatchIcon,
	UserIcon,
	LogoutIcon,
	LoginIcon,
	FolderIcon,
	PencilAltIcon,
	HashtagIcon,
	LightningBoltIcon,
} from '@heroicons/react/solid';
import { CubeIcon } from '@heroicons/react/solid';
import { trpc } from '../utils/trpc';
import { toast } from 'react-toastify';

const themes: string[] = [
	'light',
	'retro',
	'dark',
	'black',
	'night',
	'dracula',
	'coffee',
	'luxury',
];

const Header: React.FC = () => {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const { theme: currentTheme, setTheme } = useTheme();
	const { data: session, status } = useSession();

	const userInfo = trpc.useQuery(['user.isAdmin', { userId: session?.user.id || '' }], {
		enabled: session ? true : false,
	});
	const mediaPurgeMutation = trpc.useMutation(['media.purge'], {
		onSuccess(data) {
			toast.success(`${data} ${data === 1 ? 'file' : 'files'} have been purged.`, {
				className: '!bg-base-300 !text-base-content !rounded-xl',
			});
		},
	});

	useEffect(() => setMounted(true), []);
	if (!mounted) return null;

	return (
		<header className="navbar sticky top-0 backdrop-blur bg-opacity-50 bg-base-300 flex justify-center h-16 shadow-sm z-10">
			<div className="flex justify-between lg:w-4/5 w-full">
				<div className="md:px-2">
					<Link href="/">
						<a className="md:text-lg text-base font-bold flex items-center rounded px-2 md:gap-1 btn btn-ghost normal-case">
							<CubeIcon className="md:w-10 w-7" />
							<div className="sm:block hidden">
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
								{userInfo.data?.admin && (
									<button
										type="button"
										title="Purge media"
										className="btn btn-sm btn-error btn-outline normal-case gap-1 mr-1"
										onClick={() => mediaPurgeMutation.mutate()}
									>
										<LightningBoltIcon className="w-5" />
										<span className="hidden md:inline">Purge</span>
									</button>
								)}
								<Link href="/media">
									<a className="btn btn-sm btn-ghost text-base-content normal-case gap-1">
										<FolderIcon className="w-5" />
										<span className="hidden md:inline">Media</span>
									</a>
								</Link>
								<Link href="/tag">
									<a className="btn btn-sm btn-ghost text-base-content normal-case gap-1">
										<HashtagIcon className="w-5" />
										<span className="hidden md:inline">Tags</span>
									</a>
								</Link>
								<Link href={`/user/${session.user.id}`}>
									<a className="btn btn-sm btn-ghost text-base-content normal-case gap-1">
										<UserIcon className="w-5" />
										<span className="hidden md:inline">Profile</span>
									</a>
								</Link>
							</>
						)}
						<div className="dropdown">
							<label
								tabIndex={0}
								className="btn btn-sm gap-1 normal-case btn-ghost"
							>
								<ColorSwatchIcon className="w-5" />
								<span className="hidden md:inline">Themes</span>
							</label>
							<ul
								tabIndex={0}
								className="menu dropdown-content px-1 shadow bg-base-200 rounded mt-4 pt-1 whitespace-nowrap md:ml-auto md:w-36"
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
										<div
											className={`font-medium capitalize active:bg-base-300 cursor-pointer ${
												currentTheme === theme ? 'link' : ''
											}`}
										>
											{theme}
										</div>
									</li>
								))}
							</ul>
						</div>
						{status === 'authenticated' && (
							<a
								className="btn btn-sm btn-ghost text-base-content normal-case gap-1"
								onClick={() => router.push('/logout')}
							>
								<LogoutIcon className="w-5 -scale-100" />
								<span className="hidden md:inline">Logout</span>
							</a>
						)}
						{status === 'unauthenticated' && (
							<>
								<Link href="/login">
									<a className="btn btn-sm btn-ghost text-base-content normal-case gap-1 ">
										<LoginIcon className="w-5 -scale-100" />
										<span className="hidden md:inline">Login</span>
									</a>
								</Link>
								<Link href="/register">
									<a className="btn btn-sm btn-ghost text-base-content normal-case gap-1 ">
										<PencilAltIcon className="w-5" />
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
