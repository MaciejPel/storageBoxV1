/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import type { NextPage } from 'next';
import { useSession, getSession } from 'next-auth/react';
import Container from '../components/Container';
import Search from '../components/Search';
import Modal from '../components/Modal';
import CharacterForm from '../components/forms/CharacterForm';
import Masonry from '../components/Masonry';
import TagForm from '../components/forms/TagForm';

const Home: NextPage = () => {
	const { data: session, status } = useSession();
	const [query, setQuery] = useState<string>('');

	return (
		<>
			{status === 'authenticated' && (
				<Container type="start">
					<div className="w-full flex items-center gap-1 md:flex-row flex-col">
						<Search setQuery={setQuery} query={query} />
						<Modal modalTitle="New tag" buttonTitle="Add tag" id="tag">
							<TagForm />
						</Modal>
						<Modal modalTitle="New character" buttonTitle="Add character" id="character">
							<CharacterForm />
						</Modal>
					</div>
					<Masonry query={query} />
				</Container>
			)}
		</>
	);
};

export default Home;

export const getServerSideProps = async (context: any) => {
	const session = await getSession(context);
	if (!session) {
		return {
			redirect: {
				destination: '/login',
				pernament: false,
			},
		};
	}
	return { props: { session } };
};
