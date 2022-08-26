import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Masonry from 'react-masonry-css';
import Container from '../../components/Container';
import MediaCard from '../../components/MediaCard';
import Meta from '../../components/Meta';
import TagCard from '../../components/TagCard';
import { trpc } from '../../utils/trpc';

const breakpointColumnsObj = {
	default: 5,
	1536: 4,
	1280: 3,
	1024: 3,
	768: 2,
	640: 1,
};

const TagPage = () => {
	const router = useRouter();
	const { id } = router.query;
	const { data: session } = useSession();

	const tagQuery = trpc.useQuery(['tag.single', { tagId: id as string }], {
		enabled: session ? true : false,
	});
	const tagMediaQuery = trpc.useQuery(['tag.media', { tagId: id as string }], {
		enabled: session ? true : false,
	});

	const tagsCharacterMedia = tagMediaQuery.data?.characters.map((character) => [
		...character.media,
		character.cover,
	]);
	const mergedMedia = tagsCharacterMedia?.reduce((a, b) => a.concat(b), []);
	const filteredMedia = mergedMedia?.filter(
		(v, i, a) => a.findIndex((v2) => v2?.id === v?.id) === i
	);

	return (
		<>
			<Meta title={`${tagQuery.data?.name} | Tag `} />
			<Container type="start">
				<div className="grid 2xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 w-full gap-4 mb-4">
					{tagQuery.data && (
						<TagCard
							id={tagQuery.data.id}
							name={tagQuery.data.name}
							author={tagQuery.data.author.username}
							description={tagQuery.data.description}
							image={tagQuery.data.cover}
							sumOfLikes={tagQuery.data.characterIds.length}
						/>
					)}
				</div>
				<Masonry
					breakpointCols={breakpointColumnsObj}
					className="flex w-full gap-4"
					columnClassName="masonry-grid-column"
				>
					{filteredMedia?.map((media) => {
						if (media)
							return (
								<MediaCard
									key={media.id}
									cardType="tag-media"
									fileName={media.fileName}
									fileExtension={media.fileExtension}
									mimetype={media.mimetype}
									likeIds={media.likeIds}
									mediaId={media.id}
									tagId={id as string}
									tagCover={tagQuery.data?.cover?.id}
								/>
							);
					})}
				</Masonry>
			</Container>
		</>
	);
};
export default TagPage;
