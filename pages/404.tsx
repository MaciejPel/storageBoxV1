import Link from 'next/link';
import Container from '../components/Container';

const NotFound = () => {
	return (
		<Container type="center">
			<h2 className="font-light text-4xl">Ooops...</h2>
			<h3>That page cannot be found 😢</h3>
			<Link href="/">
				<a className="btn btn-ghost">Homepage</a>
			</Link>
		</Container>
	);
};

export default NotFound;
