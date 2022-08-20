import formidable from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { bunnyStorage } from '../../utils/bunny';
import fs from 'fs';
import { getBaseUrl } from '../../utils/functions';
import superjson from 'superjson';

export const config = {
	api: {
		bodyParser: false,
	},
};

const upload = async (req: NextApiRequest, res: NextApiResponse) => {
	const form = new formidable.IncomingForm();
	form.parse(req, async function (err, fields, files) {
		var result = Object.keys(files).map((key) => files[key]);

		result.forEach(async (element) => {
			// @ts-ignore
			const { originalFilename, filepath } = element;
			const { characterId } = fields;

			const response = await fetch(`${getBaseUrl()}/api/trpc/media.create`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					Cookie: req.headers.cookie!,
				},
				body: superjson.stringify({
					fileName: originalFilename.split('.').shift(),
					fileType: originalFilename.split('.').pop(),
					characterId: characterId,
				}),
			});
			const data = await response.json();

			await bunnyStorage.upload(
				fs.readFileSync(filepath),
				`/${characterId}/${data.result.data.json.id}.${originalFilename.split('.').pop()}`
			);
		});
	});
	return res.status(201).send('123');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const session = await unstable_getServerSession(req, res, authOptions);
	if (session) {
		if (req.method === 'POST') {
			upload(req, res);
		} else {
			res.status(404).send({ message: 'Not Found' });
		}
	} else {
		res.status(401).send({ message: 'UNAUTHORIZED' });
	}
}
