import { NextPage } from 'next';
import Link from 'next/link';
import Container from '../components/Container';

const NotFound: NextPage = () => {
	return (
		<Container type="center">
			<div className="flex flex-col items-center gap-4 mb-10">
				<h2 className="font-light text-4xl">Ooops...</h2>
				<h3>That page cannot be found 😢</h3>
				<Link href="/">
					<a className="btn btn-sm btn-outline">Take me home</a>
				</Link>
			</div>
		</Container>
	);
};

export default NotFound;
