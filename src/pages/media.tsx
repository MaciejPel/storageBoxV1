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
		1536: 4,
		1280: 3,
		1024: 3,
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
					<h2 className="text-4xl font-extrabold my-4 text-start w-1/4 mt-2">Media</h2>
					<div className="flex gap-2 w-3/4 justify-end items-center">
						<label htmlFor="assign" className="label cursor-pointer">
							Assign mode
						</label>
						<input
							type="checkbox"
							className="toggle toggle-lg"
							id="assign"
							onChange={() => setAssign(!assign)}
						/>
					</div>
				</div>
				<Search setQuery={setQuery} query={query} />
				{mediaQuery.data?.length === 0 && <Container type="center">No media yet 🤐</Container>}
				{mediaQuery.isSuccess && mediaQuery.data?.length > 0 && (
					<div className={`w-full mt-4 gap-4 ${assign ? 'flex' : 'block'}`}>
						<div className={`w-full ${assign ? 'md:w-10/12' : ''}`}>
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
											characterId={media.catalogName}
											catalog={media.catalogName}
											fileName={media.fileName}
											fileExtension={media.fileExtension}
											mimetype={media.mimetype}
											likeIds={media.likeIds}
										/>
									))}
							</Masonry>
						</div>
						<div className={`flex flex-col ${assign ? 'md:w-2/12 w-full' : 'hidden'}`}>
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
							<div className="btn-group-vertical w-full flex mt-2">
								<button
									title="Reset form"
									type="button"
									className="btn btn-warning"
									onClick={() => setData({ characterIds: [], mediaIds: [] })}
								>
									Reset
								</button>
								<button
									title="Submit form"
									type="submit"
									className="btn btn-primary"
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
