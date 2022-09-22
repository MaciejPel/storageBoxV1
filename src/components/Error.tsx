import Link from 'next/link';
import { ExclamationIcon } from '@heroicons/react/solid';

interface ErrorProps {
	message: string;
}

const Error: React.FC<ErrorProps> = ({ message }) => {
	return (
		<div className="flex flex-col items-center mb-16 gap-4">
			<div className="flex flex-col items-center gap-2">
				<ExclamationIcon className="md:w-36 w-28 fill-warning" />
				<div className="text-3xl font-bold text-base-content -mt-8">{message}</div>
			</div>
			<Link href="/">
				<a className="btn btn-outline">Take me home</a>
			</Link>
		</div>
	);
};

export default Error;
