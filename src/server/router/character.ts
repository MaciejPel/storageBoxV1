import { createProtectedRouter } from './protected-router';
import { z } from 'zod';
import { prisma } from '../db/client';
import { trimString } from '../../utils/functions';
import * as trpc from '@trpc/server';

export const characterRouter = createProtectedRouter()
	.query('all', {
		async resolve() {
			return await prisma.character.findMany({
				select: {
					id: true,
					name: true,
					description: true,
					authorId: true,
					author: { select: { id: true, username: true } },
					tags: { select: { id: true, name: true } },
					mainMedia: {
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
					authorId: true,
					author: { select: { id: true, username: true } },
					tags: { select: { id: true, name: true }, orderBy: { name: 'asc' } },
					mainMedia: {
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
				z
					.string()
					.min(3, { message: 'must contain at least 3 character(s)' })
					.max(140, { message: 'must contain at most 140 character(s)' })
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
	.mutation('edit', {
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
				z
					.string()
					.min(3, { message: 'must contain at least 3 character(s)' })
					.max(140, { message: 'must contain at most 140 character(s)' })
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
				select: { mainMediaId: true, mediaIds: true },
				where: { id: input.characterId },
			});

			if (!character) return null;
			const temp = character.mediaIds.filter((media) => media !== input.mediaId);
			return await prisma.character.update({
				data: {
					mainMediaId: input.mediaId,
					mediaIds: character.mainMediaId ? [...temp, character.mainMediaId] : temp,
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
				select: { mainMediaId: true, mediaIds: true },
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
	});
