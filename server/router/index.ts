import { createRouter } from './context';
import { ZodError } from 'zod';
import superjson from 'superjson';

import { authRouter } from './auth';
import { characterRouter } from './character';
import { tagRouter } from './tag';

export const appRouter = createRouter()
	.transformer(superjson)
	.merge('auth.', authRouter)
	.merge('character.', characterRouter)
	.merge('tag.', tagRouter)
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
