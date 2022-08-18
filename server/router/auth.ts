import { createRouter } from './context';
import { z } from 'zod';
import { prisma } from '../db/client';
import bcrypt from 'bcrypt';
import * as trpc from '@trpc/server';
import { trimString } from '../../utils/functions';

export const authRouter = createRouter()
	.query('all', {
		async resolve() {
			return await prisma.user.findMany({ include: { characters: true } });
		},
	})
	.mutation('register', {
		input: z.object({
			username: z.preprocess(
				trimString,
				z
					.string()
					.min(3, { message: 'must contain at least 3 character(s)' })
					.max(18, { message: 'must contain at most 18 character(s)' })
			),
			password: z.preprocess(
				trimString,
				z
					.string()
					.min(8, { message: 'must contain at least 8 character(s)' })
					.max(18, { message: 'must contain at most 18 character(s)' })
			),
		}),
		async resolve({ input }) {
			const { username, password } = input;
			const userExists = await prisma.user.findFirst({ where: { username } });
			if (userExists)
				throw new trpc.TRPCError({
					code: 'CONFLICT',
					message: 'User already exists',
				});

			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);
			const user = await prisma.user.create({
				data: { username: username, password: hashedPassword },
			});
			return user;
		},
	});
