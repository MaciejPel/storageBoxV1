import formidable from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export const config = {
	api: {
		bodyParser: false,
	},
};

const post = async (req: NextApiRequest, res: NextApiResponse) => {
	const form = new formidable.IncomingForm();
	form.parse(req, async function (err, fields, files) {});
	return res.status(201).send('123');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const session = await unstable_getServerSession(req, res, authOptions);
	if (session) {
		if (req.method === 'POST') {
			post(req, res);
		} else {
			res.status(404).send({ message: 'Not Found' });
		}
	} else {
		res.status(401).send({ message: 'UNAUTHORIZED' });
	}
}
