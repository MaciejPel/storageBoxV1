import { createProtectedRouter } from './protected-router';
import { z } from 'zod';
import { prisma } from '../db/client';
import * as trpc from '@trpc/server';

export const mediaRouter = createProtectedRouter()
	.query('all', {
		async resolve() {
			return await prisma.media.findMany({});
		},
	})
	.mutation('create', {
		input: z.object({
			fileName: z.string(),
			fileType: z.string(),
			characterId: z.string(),
		}),
		async resolve({ input, ctx }) {
			const author = ctx.session.user.id;
			if (!author) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
			const media = await prisma.media.create({
				data: {
					fileName: input.fileName,
					fileType: input.fileType,
					authorId: author,
					characterIds: [input.characterId],
				},
			});

			const character = await prisma.character.update({
				where: { id: input.characterId },
				data: { mediaIds: { push: media.id } },
			});

			return { id: media.id };
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
					media?.likeIds.push(userId);
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
