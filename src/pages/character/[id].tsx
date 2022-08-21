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

	const [character, setCharacter] = useState({
		name: characterQuery.data?.name,
		description: characterQuery.data?.description,
	});

	const tagsQuery = trpc.useQuery(['tag.all'], { enabled: session ? true : false });

	if (characterQuery.isLoading) return <Container type="start">Loading character ⌚</Container>;

	return (
		<Container type="start">
			<div
				// to be changed
				className="grid 2xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 w-full gap-4"
			>
				{characterQuery.data && (
					<CharacterCard
						id={characterQuery.data.id}
						name={characterQuery.data.name}
						description={characterQuery.data.description}
						image={characterQuery.data.media[0]}
					/>
				)}
				<div className="card card-compact card-bordered bg-base-300 static text-base-content">
					<div className="card-body">
						<form className="form-control">
							<h2 className="card-title">Edit character</h2>
							<label htmlFor="name" className="label cursor-pointer pb-1">
								<span className="label-text">Name</span>
							</label>
							<input
								type="text"
								id="name"
								className="input"
								value={character.name}
								onChange={(e) => setCharacter({ ...character, name: e.target.value })}
							/>
							<label htmlFor="description" className="label cursor-pointer pb-1 w-full">
								<span className="label-text">Description</span>
							</label>
							<textarea
								id="description"
								className="textarea h-52"
								value={character.description || ''}
								onChange={(e) => setCharacter({ ...character, description: e.target.value })}
							/>
							<label htmlFor="tags" className="label cursor-pointer pb-0 w-full">
								<span className="label-text">Tags</span>
							</label>
							<div className="columns-2 xl:columns-3">
								{tagsQuery.isSuccess &&
									tagsQuery.data.map((tag) => (
										<label
											htmlFor={tag.id}
											className="label justify-start gap-2 cursor-pointer"
											key={tag.id}
										>
											<input
												type="checkbox"
												value={tag.id}
												id={tag.id}
												name="tag"
												className="checkbox"
											/>
											<span className="label-text">{tag.name}</span>
										</label>
									))}
							</div>
							<div className="card-actions justify-end btn-group gap-0 w-full">
								<button className="btn btn-error w-1/4">Reset</button>
								<button className="btn btn-primary w-3/4">Submit</button>
							</div>
						</form>
					</div>
				</div>

				<div className="card card-compact card-bordered static text-base-content sm:col-span-2 bg-base-300">
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
