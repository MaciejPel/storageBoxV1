import { createProtectedRouter } from './protected-router';
import { z } from 'zod';
import { prisma } from '../db/client';
import { trimString } from '../../utils/functions';
import * as trpc from '@trpc/server';

interface InitialMediaType {
	fileName: string;
	fileExtension: string;
	mimetype: string;
	uuid: string;
	authorId: string;
	characterIds: string[];
}

export const characterRouter = createProtectedRouter()
	.query('all', {
		async resolve() {
			return await prisma.character.findMany({
				select: {
					id: true,
					name: true,
					description: true,
					author: { select: { id: true, username: true } },
					tags: { select: { id: true, name: true } },
					cover: {
						select: {
							id: true,
							fileName: true,
							fileExtension: true,
							mimetype: true,
							likeIds: true,
						},
					},
					media: {
						select: {
							id: true,
							fileName: true,
							fileExtension: true,
							mimetype: true,
							likeIds: true,
						},
					},
				},
			});
		},
	})
	.query('single', {
		input: z.object({
			characterId: z.string(),
		}),
		async resolve({ input }) {
			const character = await prisma.character.findFirst({
				select: {
					id: true,
					name: true,
					description: true,
					author: { select: { id: true, username: true } },
					tags: { select: { id: true, name: true }, orderBy: { name: 'asc' } },
					cover: {
						select: {
							id: true,
							fileName: true,
							fileExtension: true,
							mimetype: true,
							likeIds: true,
						},
					},
					media: {
						select: {
							id: true,
							fileName: true,
							fileExtension: true,
							mimetype: true,
							likeIds: true,
						},
					},
				},
				where: { id: input.characterId },
			});
			if (!character) throw new trpc.TRPCError({ code: 'NOT_FOUND' });
			return character;
		},
	})
	.mutation('create', {
		input: z.object({
			name: z.preprocess(
				trimString,
				z
					.string()
					.min(3, { message: 'must contain at least 3 character(s)' })
					.max(18, { message: 'must contain at most 18 character(s)' })
			),
			description: z.preprocess(
				trimString,
				z.string().max(140, { message: 'must contain at most 140 character(s)' })
			),
			tags: z.array(z.string()),
		}),
		async resolve({ input, ctx }) {
			const author = ctx.session.user.id;
			if (!author) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
			const character = await prisma.character.create({
				data: {
					name: input.name,
					description: input.description,
					authorId: author,
					tagIds: input.tags,
				},
			});
			await prisma.tag.updateMany({
				data: { characterIds: { push: character.id } },
				where: { id: { in: input.tags } },
			});

			return character;
		},
	})
	.mutation('update', {
		input: z.object({
			characterId: z.string(),
			name: z.preprocess(
				trimString,
				z
					.string()
					.min(3, { message: 'must contain at least 3 character(s)' })
					.max(18, { message: 'must contain at most 18 character(s)' })
			),
			description: z.preprocess(
				trimString,
				z.string().max(140, { message: 'must contain at most 140 character(s)' })
			),
			tags: z.array(z.string()),
		}),
		async resolve({ input }) {
			const character = await prisma.character.findFirst({
				select: { tagIds: true, tags: true },
				where: { id: input.characterId },
			});
			if (character) {
				character.tags.forEach(async (tag) => {
					if (!input.tags.includes(tag.id)) {
						await prisma.tag.update({
							data: { characterIds: tag.characterIds.filter((t) => t !== input.characterId) },
							where: { id: tag.id },
						});
					}
				});
				input.tags.forEach(async (tagId) => {
					if (!character.tagIds.includes(tagId)) {
						await prisma.tag.update({
							data: { characterIds: { push: input.characterId } },
							where: { id: tagId },
						});
					}
				});
			}

			const characterUpdate = await prisma.character.update({
				data: {
					name: input.name,
					description: input.description,
					tagIds: input.tags,
				},
				where: { id: input.characterId },
			});

			return characterUpdate;
		},
	})
	.mutation('setMain', {
		input: z.object({
			mediaId: z.string(),
			characterId: z.string(),
		}),
		async resolve({ input }) {
			const character = await prisma.character.findFirst({
				select: { coverId: true, mediaIds: true },
				where: { id: input.characterId },
			});

			if (!character) return null;
			const temp = character.mediaIds.filter((media) => media !== input.mediaId);
			return await prisma.character.update({
				data: {
					coverId: input.mediaId,
					mediaIds: character.coverId ? [...temp, character.coverId] : temp,
				},
				where: { id: input.characterId },
			});
		},
	})
	.mutation('removeMedia', {
		input: z.object({
			mediaId: z.string(),
			characterId: z.string(),
		}),
		async resolve({ input }) {
			const character = await prisma.character.findFirst({
				select: { coverId: true, mediaIds: true },
				where: { id: input.characterId },
			});

			if (!character) return null;
			return await prisma.character.update({
				data: {
					mediaIds: character.mediaIds.filter((media) => media !== input.mediaId),
				},
				where: { id: input.characterId },
			});
		},
	})
	.mutation('delete', {
		input: z.object({
			characterId: z.string(),
		}),
		async resolve({ input }) {
			const tags = await prisma.tag.findMany({
				select: { id: true, characterIds: true },
				where: { characterIds: { has: input.characterId } },
			});
			const media = await prisma.media.findMany({
				select: { id: true, characterIds: true },
				where: { characterIds: { has: input.characterId } },
			});

			const tagsToUpdate: { [key: string]: string } = tags.reduce(
				(obj, item) => ({
					...obj,
					[item.id]: item.characterIds.filter((tag) => tag != input.characterId),
				}),
				{}
			);
			const mediaToUpdate: { [key: string]: string } = media.reduce(
				(obj, item) => ({
					...obj,
					[item.id]: item.characterIds.filter((tag) => tag != input.characterId),
				}),
				{}
			);

			for (const [key, value] of Object.entries(tagsToUpdate)) {
				await prisma.tag.update({
					data: { characterIds: { set: value } },
					where: { id: key },
				});
			}
			for (const [key, value] of Object.entries(mediaToUpdate)) {
				await prisma.media.update({
					data: { characterIds: { set: value } },
					where: { id: key },
				});
			}

			const character = await prisma.character.delete({ where: { id: input.characterId } });

			return { id: character.id };
		},
	})
	.mutation('upload', {
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
			const authorId = ctx.session.user.id;
			if (!authorId) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });

			const character = await prisma.character.findFirst({
				select: { id: true, mediaIds: true },
				where: { id: input.characterId },
			});

			const mediaToCreate: InitialMediaType[] = input.data.map((row) => ({
				...row,
				authorId: authorId,
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
					authorId: authorId,
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
	});
