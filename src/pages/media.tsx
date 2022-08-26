import { GetServerSidePropsContext, NextPage } from 'next';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import Container from '../components/Container';
import Meta from '../components/Meta';
import { trpc } from '../utils/trpc';
import { authOptions } from './api/auth/[...nextauth]';
import Masonry from 'react-masonry-css';
import MediaCard from '../components/MediaCard';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import Search from '../components/Search';

interface DataProps {
	characterIds: string[];
	mediaIds: string[];
}

interface QueryParams {
	string: string;
	sort: boolean;
}

const Media: NextPage = () => {
	const { data: session } = useSession();
	const [data, setData] = useState<DataProps>({ characterIds: [], mediaIds: [] });
	const [assign, setAssign] = useState<boolean>(false);
	const [query, setQuery] = useState<QueryParams>({ string: '', sort: true });
	const breakpointColumnsObj = {
		default: assign ? 4 : 5,
		1536: assign ? 3 : 4,
		1280: assign ? 2 : 3,
		1024: assign ? 2 : 3,
		768: 2,
		640: 1,
	};

	const utils = trpc.useContext();
	const mediaQuery = trpc.useQuery(['media.all'], { enabled: session ? true : false });
	const charactersQuery = trpc.useQuery(['character.all'], { enabled: session ? true : false });
	const mediaAssignMutation = trpc.useMutation(['media.assign'], {
		onSuccess() {
			utils.invalidateQueries(['character.all']);
			utils.invalidateQueries(['character.single']);
			setData({ characterIds: [], mediaIds: [] });
			toast.success('Media assigned', {
				className: '!bg-base-300 !text-base-content !rounded-xl',
			});
		},
	});

	return (
		<>
			<Meta title="Media" />
			<Container type="start">
				<div className="w-full flex justify-between items-center">
					<h2 className="text-4xl font-extrabold my-4 text-start w-full mt-0 mb-2">Media</h2>
					{mediaQuery.isSuccess &&
						mediaQuery.data.length > 0 &&
						charactersQuery.isSuccess &&
						charactersQuery.data.length > 0 && (
							<div className="flex gap-2 w-3/4 justify-end items-center">
								<label htmlFor="assign" className="label cursor-pointer">
									Assign mode
								</label>
								<input
									type="checkbox"
									className="toggle"
									id="assign"
									onChange={() => setAssign(!assign)}
								/>
							</div>
						)}
				</div>
				<Search setQuery={setQuery} query={query} />
				{mediaQuery.data?.length === 0 && <Container type="center">No media yet 🤐</Container>}
				{mediaQuery.isSuccess && mediaQuery.data?.length > 0 && (
					<div className={`w-full my-4 gap-4 ${assign ? 'md:flex flex-row-reverse' : ''} block`}>
						<div className={`w-full ${assign ? 'md:w-3/4' : ''}`}>
							<Masonry
								breakpointCols={breakpointColumnsObj}
								className="flex w-full gap-4"
								columnClassName="masonry-grid-column"
							>
								{mediaQuery.data
									?.filter((media) => media.fileName.toLowerCase().includes(query.string))
									.sort((f, s) => {
										if (f.likeIds.length < s.likeIds.length) return query.sort ? 1 : -1;
										if (f.likeIds.length > s.likeIds.length) return query.sort ? -1 : 1;
										return 0;
									})
									.map((media) => (
										<MediaCard
											key={media.id}
											cardType="media"
											assign={assign}
											data={data}
											setData={setData}
											name={`${media.fileName}.${media.fileExtension}`}
											mediaId={media.id}
											fileName={media.fileName}
											fileExtension={media.fileExtension}
											mimetype={media.mimetype}
											likeIds={media.likeIds}
										/>
									))}
							</Masonry>
						</div>
						<div className={`flex flex-col mb-2 ${assign ? 'md:w-1/4' : 'hidden'}`}>
							<h2 className="text-2xl font-bold">Characters</h2>
							<div className="grid grid-cols-2 md:grid-cols-1">
								{assign &&
									charactersQuery.data?.map((character) => (
										<label
											key={character.id}
											className="w-full cursor-pointer flex gap-2 p-2 hover:bg-base-300 rounded-lg"
											htmlFor={'assignCharacter-' + character.id}
										>
											<input
												type="checkbox"
												className="checkbox"
												id={'assignCharacter-' + character.id}
												checked={data.characterIds.includes(character.id)}
												onChange={(e) =>
													setData({
														...data,
														characterIds: e.target.checked
															? [...data.characterIds, character.id]
															: data.characterIds.filter(
																	(characterId) => characterId !== character.id
															  ),
													})
												}
											/>
											{character.name}
										</label>
									))}
							</div>
							<div className="md:btn-group-vertical w-full mt-2">
								<button
									title="Reset form"
									type="button"
									className="btn btn-warning w-1/3 md:w-full md:rounded rounded-r-none"
									onClick={() => setData({ characterIds: [], mediaIds: [] })}
								>
									Reset
								</button>
								<button
									title="Submit form"
									type="submit"
									className="btn btn-primary w-2/3 md:w-full md:rounded rounded-l-none"
									onClick={() => mediaAssignMutation.mutate(data)}
								>
									Submit
								</button>
							</div>
						</div>
					</div>
				)}
			</Container>
		</>
	);
};
export default Media;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
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
