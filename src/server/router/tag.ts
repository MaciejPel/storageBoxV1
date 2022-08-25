import { createProtectedRouter } from './protected-router';
import { z } from 'zod';
import { prisma } from '../db/client';
import { trimString } from '../../utils/functions';
import * as trpc from '@trpc/server';

export const tagRouter = createProtectedRouter()
	.query('all', {
		async resolve() {
			const tags = await prisma.tag.findMany({
				select: {
					id: true,
					name: true,
					cover: { select: { id: true, fileName: true, fileExtension: true } },
					characterIds: true,
				},
				orderBy: { name: 'asc' },
			});
			return tags;
		},
	})
	.mutation('create', {
		input: z.object({
			name: z.preprocess(
				trimString,
				z
					.string()
					.min(2, { message: 'must contain at least 2 character(s)' })
					.max(18, { message: 'must contain at most 18 character(s)' })
			),
		}),
		async resolve({ input, ctx }) {
			const author = ctx.session.user.id;
			if (!author) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });

			const tag = await prisma.tag.create({
				data: { name: input.name, authorId: author },
			});

			return { id: tag.id };
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

			const charactersToUpdate: { [key: string]: string } = characters.reduce(
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
