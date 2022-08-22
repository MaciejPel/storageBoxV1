import { createProtectedRouter } from './protected-router';
import { z } from 'zod';
import { prisma } from '../db/client';
import * as trpc from '@trpc/server';

interface InitialMediaType {
	fileName: string;
	fileType: string;
	uuid: string;
	authorId: string;
	characterIds: string[];
}

export const mediaRouter = createProtectedRouter()
	.query('all', {
		async resolve() {
			return await prisma.media.findMany({});
		},
	})
	.mutation('create', {
		input: z.object({
			data: z.array(
				z.object({
					fileName: z.string(),
					fileType: z.string(),
					uuid: z.string(),
				})
			),
			characterId: z.string(),
		}),
		async resolve({ input, ctx }) {
			const author = ctx.session.user.id;
			if (!author) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });

			const character = await prisma.character.findFirst({
				select: { id: true, mediaIds: true },
				where: { id: input.characterId },
			});

			const mediaToCreate: InitialMediaType[] = input.data.map((row) => ({
				...row,
				authorId: author,
				characterIds: [input.characterId],
			}));
			const uuids: string[] = input.data.map((row) => row.uuid);

			await prisma.media.createMany({
				data: mediaToCreate,
			});

			const updatedMedia = await prisma.media.findMany({
				select: { id: true, uuid: true },
				where: {
					uuid: { in: uuids },
					authorId: author,
					characterIds: { has: input.characterId },
				},
			});

			if (updatedMedia && character) {
				const mediaToPush = updatedMedia.map((record) => record.id);

				await prisma.character.update({
					data: { mediaIds: { set: [...character.mediaIds, ...mediaToPush] } },
					where: { id: input.characterId },
				});
			}

			return updatedMedia;
		},
	})
	.mutation('update', {
		input: z.object({
			mediaId: z.string(),
		}),
		async resolve({ input, ctx }) {
			const userId = ctx.session.user.id;
			if (!userId) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });

			const media = await prisma.media.findFirst({
				select: { likeIds: true },
				where: { id: input.mediaId },
			});

			if (media) {
				if (media.likeIds.includes(userId)) {
					media.likeIds = media.likeIds.filter((like) => like != userId);
				} else {
					media.likeIds.push(userId);
				}

				const mediaUpdate = await prisma.media.update({
					data: {
						likeIds: media.likeIds,
					},
					where: { id: input.mediaId },
				});
				return mediaUpdate;
			}
		},
	});
