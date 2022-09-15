import { GetServerSidePropsContext } from 'next';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { prisma } from '../server/db/client';
import { defaultRedirect } from './functions';

export const validateUser = async (context: GetServerSidePropsContext, cb: Function) => {
	const session = await getServerSession(context.req, context.res, authOptions);

	if (!session) return defaultRedirect('/login');

	if (session?.user.id) {
		const user = await prisma.user.findFirst({
			select: { id: true },
			where: { id: session?.user.id, banned: false, verified: true },
		});
		if (!user) return defaultRedirect();
	}

	return cb({ session });
};
