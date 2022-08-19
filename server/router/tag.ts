import { createProtectedRouter } from './protected-router';
import { z } from 'zod';
import { prisma } from '../db/client';
import { trimString } from '../../utils/functions';
import * as trpc from '@trpc/server';

export const tagRouter = createProtectedRouter()
	.query('all', {
		async resolve() {
			return await prisma.tag.findMany({
				select: { id: true, name: true },
				orderBy: { name: 'asc' },
			});
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
	});
