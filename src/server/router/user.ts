import { createProtectedRouter } from './protected-router';
import { prisma } from '../db/client';
import { z } from 'zod';

export const userRouter = createProtectedRouter().query('single', {
	input: z.object({ userId: z.string() }),
	async resolve({ input }) {
		return await prisma.user.findFirst({
			select: {
				id: true,
				username: true,
				createdCharacters: {
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
						media: { select: { likeIds: true } },
						tags: { select: { id: true, name: true }, orderBy: { name: 'asc' } },
					},
				},
				uploadedMedia: {
					select: { id: true, fileName: true, fileExtension: true, mimetype: true, likeIds: true },
				},
				likedMedia: {
					select: { id: true, fileName: true, fileExtension: true, mimetype: true, likeIds: true },
				},
				createdTags: {
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
				},
			},
			where: { id: input.userId },
		});
	},
});
