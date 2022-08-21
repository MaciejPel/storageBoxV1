/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { trpc } from '../../utils/trpc';
import Container from '../../components/Container';
import UploadForm from '../../components/forms/UploadForm';
import CharacterCard from '../../components/CharacterCard';
import { useState } from 'react';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';

const CharacterPage = () => {
	const { query } = useRouter();
	const { data: session } = useSession();

	const characterQuery = trpc.useQuery(['character.single', { characterId: query.id as string }], {
		enabled: session ? true : false,
	});

	if (characterQuery.isLoading) return <Container type="start">Loading character ⌚</Container>;

	return (
		<Container type="start">
			<div className="grid 2xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 w-full gap-4">
				{characterQuery.data && (
					<CharacterCard
						id={characterQuery.data.id}
						name={characterQuery.data.name}
						description={characterQuery.data.description}
						image={characterQuery.data.media[0]}
					/>
				)}

				<div className="card card-compact card-bordered static text-base-content bg-base-300 2xl:col-span-3 lg:col-span-2 sm:col-span-1">
					<div className="card-body items-center justify-between">
						<UploadForm />
						<div className="card-actions justify-end btn-group gap-0 w-full">
							<button className="btn btn-error w-1/6">Reset</button>
							<button className="btn btn-primary w-1/3">Submit</button>
						</div>
					</div>
				</div>
			</div>
		</Container>
	);
};

export default CharacterPage;

export const getServerSideProps = async (context: any) => {
	const session = await getServerSession(context.req, context.res, authOptions);

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
