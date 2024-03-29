import { createProtectedRouter } from './protected-router';
import { z } from 'zod';
import { prisma } from '../db/client';
import * as trpc from '@trpc/server';

export const tagRouter = createProtectedRouter()
	.query('all', {
		async resolve() {
			const tags = await prisma.tag.findMany({
				select: {
					id: true,
					name: true,
					description: true,
					cover: {
						select: {
							id: true,
							fileName: true,
							fileExtension: true,
							mimetype: true,
							likeIds: true,
						},
					},
				},
				orderBy: { name: 'asc' },
			});

			const tagsWithLikes = await Promise.all(
				tags.map(async (tag) => {
					const media = await prisma.media.findMany({
						select: {
							id: true,
							likeIds: true,
						},
						where: { characters: { every: { tagIds: { has: tag.id } } } },
					});

					const result = media.reduce((acc, media) => {
						return acc + (media?.likeIds.length || 0);
					}, 0);
					return { ...tag, likeIds: result };
				})
			);

			return tagsWithLikes;
		},
	})
	.query('single', {
		input: z.object({
			tagId: z.string(),
		}),
		async resolve({ input }) {
			const tag = await prisma.tag.findFirst({
				select: {
					id: true,
					name: true,
					description: true,
					author: { select: { id: true, username: true } },
					cover: {
						select: {
							id: true,
							fileName: true,
							fileExtension: true,
							mimetype: true,
							likeIds: true,
						},
					},
					characterIds: true,
				},
				where: { id: input.tagId },
			});
			return tag;
		},
	})
	.query('media', {
		input: z.object({
			tagId: z.string(),
		}),
		async resolve({ input }) {
			const media = await prisma.media.findMany({
				select: {
					id: true,
					fileName: true,
					fileExtension: true,
					mimetype: true,
					likeIds: true,
				},
				where: { characters: { every: { tagIds: { has: input.tagId } } } },
			});
			return media;
		},
	})
	.mutation('create', {
		input: z.object({
			name: z
				.string()
				.trim()
				.min(2, { message: 'must contain at least 2 character(s)' })
				.max(18, { message: 'must contain at most 18 character(s)' }),
			description: z.string().trim().max(140, { message: 'must contain at most 140 character(s)' }),
		}),
		async resolve({ input, ctx }) {
			const authorId = ctx.session.user.id;
			if (!authorId) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });

			const tag = await prisma.tag.create({
				data: { name: input.name, description: input.description, authorId: authorId },
			});

			return { id: tag.id };
		},
	})
	.mutation('update', {
		input: z.object({
			name: z
				.string()
				.trim()
				.min(2, { message: 'must contain at least 2 character(s)' })
				.max(18, { message: 'must contain at most 18 character(s)' }),
			description: z.string().trim().max(140, { message: 'must contain at most 140 character(s)' }),
			tagId: z.string(),
		}),
		async resolve({ input, ctx }) {
			const tag = await prisma.tag.update({
				data: { name: input.name, description: input.description },
				where: { id: input.tagId },
			});

			return tag;
		},
	})
	.mutation('setMain', {
		input: z.object({
			mediaId: z.string(),
			tagId: z.string(),
		}),
		async resolve({ input }) {
			const tag = await prisma.tag.update({
				data: { coverId: input.mediaId },
				where: { id: input.tagId },
			});
			return tag;
		},
	})
	.mutation('delete', {
		input: z.object({
			tagId: z.string(),
		}),
		async resolve({ input }) {
			const characters = await prisma.character.findMany({
				select: { id: true, tagIds: true },
				where: { tagIds: { has: input.tagId } },
			});

			const charactersToUpdate: { [key: string]: string[] } = characters.reduce(
				(obj, item) => ({ ...obj, [item.id]: item.tagIds.filter((tag) => tag != input.tagId) }),
				{}
			);

			for (const [key, value] of Object.entries(charactersToUpdate)) {
				await prisma.character.update({
					data: { tagIds: { set: value } },
					where: { id: key },
				});
			}

			const tag = await prisma.tag.delete({ where: { id: input.tagId } });

			return { id: tag.id };
		},
	});
