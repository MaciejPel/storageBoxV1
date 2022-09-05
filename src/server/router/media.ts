import { createProtectedRouter } from './protected-router';
import { z } from 'zod';
import { prisma } from '../db/client';
import * as trpc from '@trpc/server';

interface InitialMediaType {
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
					fileName: true,
					fileExtension: true,
					mimetype: true,
					likeIds: true,
					characterCover: true,
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

			const user = await prisma.user.findFirst({
				select: { likedMediaIds: true },
				where: { id: userId },
			});

			if (media && user) {
				if (media.likeIds.includes(userId)) {
					media.likeIds = media.likeIds.filter((like) => like != userId);
				} else {
					media.likeIds.push(userId);
				}

				if (user.likedMediaIds.includes(input.mediaId)) {
					user.likedMediaIds = user.likedMediaIds.filter((media) => media != input.mediaId);
				} else {
					user.likedMediaIds.push(input.mediaId);
				}

				await prisma.user.update({
					data: { likedMediaIds: user.likedMediaIds },
					where: { id: userId },
				});

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
				select: { id: true, coverId: true, mediaIds: true },
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
										(id) => !character.mediaIds.includes(id) && character.coverId != id
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
				where: { coverId: input.mediaId },
			});
			const charactersStandardMedia = await prisma.character.findMany({
				select: { id: true, mediaIds: true },
				where: { mediaIds: { has: input.mediaId } },
			});
			const likedByUsers = await prisma.user.findMany({
				select: { id: true, likedMediaIds: true },
				where: { likedMediaIds: { has: input.mediaId } },
			});

			if (charactersMainImage) {
				await prisma.character.updateMany({
					data: { coverId: null },
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
			if (likedByUsers) {
				likedByUsers.forEach(async (user) => {
					await prisma.user.update({
						data: {
							likedMediaIds: { set: user.likedMediaIds.filter((id) => id != input.mediaId) },
						},
						where: { id: user.id },
					});
				});
			}

			const deletedMedia = await prisma.media.delete({ where: { id: input.mediaId } });

			return deletedMedia;
		},
	});
