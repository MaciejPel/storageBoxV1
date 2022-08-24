import { createProtectedRouter } from './protected-router';
import { z } from 'zod';
import { prisma } from '../db/client';
import * as trpc from '@trpc/server';

interface InitialMediaType {
	catalogName: string;
	fileName: string;
	fileExtension: string;
	mimetype: string;
	uuid: string;
	authorId: string;
	characterIds: string[];
}

export const mediaRouter = createProtectedRouter()
	.query('all', {
		async resolve() {
			return await prisma.media.findMany({
				select: {
					id: true,
					author: { select: { username: true } },
					catalogName: true,
					fileName: true,
					fileExtension: true,
					mimetype: true,
					likeIds: true,
					mainFor: true,
				},
			});
		},
	})
	.mutation('create', {
		input: z.object({
			data: z.array(
				z.object({
					fileName: z.string(),
					fileExtension: z.string(),
					mimetype: z.string(),
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
				catalogName: input.characterId,
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
	})
	.mutation('assign', {
		input: z.object({
			mediaIds: z.array(z.string()),
			characterIds: z.array(z.string()),
		}),
		async resolve({ input }) {
			const characters = await prisma.character.findMany({
				select: { id: true, mainMediaId: true, mediaIds: true },
				where: { id: { in: input.characterIds } },
			});

			if (characters) {
				characters.forEach(async (character) => {
					await prisma.character.update({
						data: {
							mediaIds: {
								set: [
									...character.mediaIds,
									...input.mediaIds.filter(
										(id) => !character.mediaIds.includes(id) && character.mainMediaId != id
									),
								],
							},
						},
						where: { id: character.id },
					});
				});
			}

			return await prisma.character.findMany({
				select: { id: true },
				where: { id: { in: input.characterIds } },
			});
		},
	})
	.mutation('delete', {
		input: z.object({
			mediaId: z.string(),
		}),
		async resolve({ input }) {
			const charactersMainImage = await prisma.character.findMany({
				select: { id: true },
				where: { mainMediaId: input.mediaId },
			});
			const charactersStandardMedia = await prisma.character.findMany({
				select: { id: true, mediaIds: true },
				where: { mediaIds: { has: input.mediaId } },
			});

			if (charactersMainImage) {
				await prisma.character.updateMany({
					data: { mainMediaId: null },
					where: { id: { in: charactersMainImage.map((character) => character.id) } },
				});
			}
			if (charactersStandardMedia) {
				charactersStandardMedia.forEach(async (character) => {
					await prisma.character.update({
						data: { mediaIds: { set: character.mediaIds.filter((id) => id != input.mediaId) } },
						where: { id: character.id },
					});
				});
			}

			const deletedMedia = await prisma.media.delete({ where: { id: input.mediaId } });

			return deletedMedia;
		},
	});
