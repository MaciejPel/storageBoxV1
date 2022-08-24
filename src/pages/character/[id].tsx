/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { trpc } from '../../utils/trpc';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import { toast } from 'react-toastify';
import Masonry from 'react-masonry-css';
import Container from '../../components/Container';
import UploadForm from '../../components/forms/UploadForm';
import CharacterCard from '../../components/CharacterCard';
import Meta from '../../components/Meta';
import MediaCard from '../../components/MediaCard';
import { GetServerSidePropsContext } from 'next';

const breakpointColumnsObj = {
	default: 4,
	1536: 4,
	1280: 3,
	1024: 3,
	768: 2,
	640: 1,
};

const CharacterPage = () => {
	const router = useRouter();
	const { id } = router.query;

	const { data: session } = useSession();

	const characterQuery = trpc.useQuery(['character.single', { characterId: id as string }], {
		enabled: session ? true : false,
		onError(err) {
			if (err.data?.code === 'NOT_FOUND') {
				toast.error('Character not found', {
					className: '!bg-base-300 !text-base-content !rounded-xl',
				});
			} else {
				toast.error('Something went wrong', {
					className: '!bg-base-300 !text-base-content !rounded-xl',
				});
			}
			router.push('/');
		},
	});

	if (characterQuery.isLoading) return <Container type="center">Loading character ⌚</Container>;

	if (characterQuery.isError) return <Container type="center">Error occurred ⚠</Container>;

	return (
		<>
			<Meta title={characterQuery.data?.name + ' | Character' || '...'} />
			<Container type="start">
				<div className="grid 2xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 w-full gap-4 mb-4">
					{characterQuery.data && (
						<CharacterCard
							id={characterQuery.data.id}
							name={characterQuery.data.name}
							catalog={characterQuery.data.mainMedia?.catalogName}
							author={characterQuery.data.author.username}
							description={characterQuery.data.description}
							image={characterQuery.data.mainMedia}
							tags={characterQuery.data.tags}
							sumOfLikes={
								characterQuery.data.media.reduce((acc, media) => acc + media.likeIds.length, 0) +
								(characterQuery.data.mainMedia?.likeIds.length || 0)
							}
						/>
					)}
					<div className="card card-compact card-bordered static text-base-content bg-base-300 2xl:col-span-3 lg:col-span-2 sm:col-span-1">
						<div className="card-body items-center justify-between">
							<UploadForm />
						</div>
					</div>
				</div>
				<Masonry
					breakpointCols={breakpointColumnsObj}
					className="flex w-full gap-4"
					columnClassName="masonry-grid-column"
				>
					{characterQuery?.data?.media
						.sort((f, s) => s.likeIds.length - f.likeIds.length)
						.map((media) => (
							<MediaCard
								cardType="character-media"
								key={media.id}
								characterId={id as string}
								mediaId={media.id}
								catalog={media.catalogName}
								fileName={media.fileName}
								fileExtension={media.fileExtension}
								mimetype={media.mimetype}
								likeIds={media.likeIds}
							/>
						))}
				</Masonry>
			</Container>
		</>
	);
};

export default CharacterPage;

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
