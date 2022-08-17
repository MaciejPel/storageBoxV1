/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Container from '../components/Container';
import LoginForm from '../components/LoginForm';
import Modal from '../components/Modal';
import { trpc } from '../utils/trpc';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Home: NextPage = () => {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [character, setCharacter] = useState<{
		name: string;
		description: string;
	}>({
		name: '',
		description: '',
	});
	const utils = trpc.useContext();
	const mutation = trpc.useMutation(['character.create'], {
		onSuccess: (data) => {
			router.push(`/character/${data}`);
			utils.invalidateQueries(['character.all']);
		},
	});
	const {
		data: characters,
		isSuccess,
		isLoading,
		isError,
	} = trpc.useQuery(['character.all'], {
		enabled: session ? true : false,
	});

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		mutation.mutate(character);
	};

	return (
		<>
			{status === 'authenticated' ? (
				<Container type="start">
					<Modal modalTitle="New character" buttonTitle="Add character">
						<form onSubmit={handleSubmit}>
							<div>
								<label className="label pb-1 cursor-pointer" htmlFor="name">
									<span className="label-text">Name</span>
								</label>
								<input
									id="name"
									type="text"
									placeholder="Character's name"
									className="input w-full input-bordered"
									onChange={(e) => setCharacter({ ...character, name: e.target.value })}
								/>
							</div>
							<div>
								<label className="label pb-1 cursor-pointer" htmlFor="description">
									<span className="label-text">Description</span>
								</label>
								<textarea
									className="textarea textarea-bordered w-full textarea-ghost pb-1 h-24	"
									id="description"
									onChange={(e) => setCharacter({ ...character, description: e.target.value })}
									placeholder="Character's descritpion"
								/>
							</div>
							<div className="btn-group w-full pt-3">
								<input
									className="btn btn-error rounded w-2/4"
									type="reset"
									value="Reset"
									onChange={(e) => setCharacter({ ...character, name: e.target.value })}
								/>
								<input className="btn btn-primary rounded w-2/4" type="submit" value="Submit" />
							</div>
						</form>
					</Modal>
					{isError && <Container type="center">Something went wrong</Container>}
					{isLoading && <Container type="center">Loading data ⌚</Container>}
					{isSuccess && (
						<div className="columns-3 pt-4">
							{characters.map((character, index) => (
								<Link href={`/character/${character.id}`} key={character.id}>
									<div className="card bg-base-100 card-bordered cursor-pointer">
										<figure className="w-full">
											<img
												src={`https://source.unsplash.com/random/200x200?sig=${index}`}
												alt="test"
												className="w-full"
											/>
										</figure>
										<div className="card-body py-2 px-4 w-64">
											<h2 className="card-title">{character.name}</h2>
											<p className="truncate">{character.description}</p>
										</div>
									</div>
								</Link>
							))}
						</div>
					)}
				</Container>
			) : (
				<Container type="center">
					<LoginForm />
				</Container>
			)}
		</>
	);
};

export default Home;
