import { createRouter } from './context';
import { ZodError } from 'zod';
import superjson from 'superjson';

import { authRouter } from './auth';
import { characterRouter } from './character';
import { tagRouter } from './tag';
import { mediaRouter } from './media';

export const appRouter = createRouter()
	.transformer(superjson)
	.merge('auth.', authRouter)
	.merge('character.', characterRouter)
	.merge('tag.', tagRouter)
	.merge('media.', mediaRouter)
	.formatError(({ shape, error }) => {
		return {
			...shape,
			data: {
				...shape.data,
				zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
			},
		};
	});
export type AppRouter = typeof appRouter;