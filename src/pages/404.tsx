import { NextPage } from 'next';
import Container from '../components/Container';
import Error from '../components/Error';

const NotFound: NextPage = () => {
	return (
		<Container type="center">
			<Error message="Page not found" />
		</Container>
	);
};

export default NotFound;
