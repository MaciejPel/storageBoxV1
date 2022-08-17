import { createRouter } from './context';
import { z } from 'zod';
import { prisma } from '../db/client';
import bcrypt from 'bcrypt';
import * as trpc from '@trpc/server';
import { trimString } from '../../utils/functions';

export const authRouter = createRouter().mutation('register', {
	input: z.object({
		username: z.preprocess(
			trimString,
			z
				.string()
				.min(3, { message: 'Must be at least 3 characters long' })
				.max(16, { message: 'Must be no more than 16 characters long' })
		),
		password: z.preprocess(trimString, z.string()),
	}),
	async resolve({ input }) {
		const { username, password } = input;
		const userExists = await prisma.user.findFirst({ where: { username } });
		if (userExists)
			throw new trpc.TRPCError({
				code: 'CONFLICT',
				message: 'User alredy exists',
			});

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const user = await prisma.user.create({ data: { username, password: hashedPassword } });
		return user;
	},
});
