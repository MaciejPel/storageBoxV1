import { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
	interface Session {
		user: {
			id?: string | null;
			username?: string | null;
		};
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		user: {
			id?: string | null;
			username?: string | null;
		};
	}
}
