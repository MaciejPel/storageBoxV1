import { createProtectedRouter } from './protected-router';
import { z } from 'zod';
import { prisma } from '../db/client';
import { trimString } from '../../utils/functions';
import * as trpc from '@trpc/server';

export const characterRouter = createProtectedRouter()
	.query('all', {
		async resolve() {
			return await prisma.character.findMany();
		},
	})
	.query('single', {
		input: z.object({
			characterId: z.string(),
		}),
		async resolve({ input }) {
			console.log(input);
			return await prisma.character.findFirst({ where: { id: input.characterId } });
		},
	})
	.mutation('create', {
		input: z.object({
			name: z.preprocess(trimString, z.string()),
			description: z.string(),
		}),
		async resolve({ input, ctx }) {
			const author = ctx.session.user.id;
			if (!author) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
			const character = await prisma.character.create({
				data: { name: input.name, description: input.description, authorId: author },
			});

			return character.id;
		},
	});
