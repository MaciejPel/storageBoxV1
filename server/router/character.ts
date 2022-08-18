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
				},
			});
		},
	})
	.query('single', {
		input: z.object({
			characterId: z.string(),
		}),
		async resolve({ input }) {
			return await prisma.character.findFirst({ where: { id: input.characterId } });
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
			tags: z.array(z.string()).nullish(),
		}),
		async resolve({ input, ctx }) {
			console.log(input);
			const author = ctx.session.user.id;
			if (!author) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
			const character = await prisma.character.create({
				data: {
					name: input.name,
					description: input.description,
					authorId: author,
					tagIds: input.tags || [],
				},
			});

			return character.id;
		},
	});
