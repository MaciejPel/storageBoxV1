import fs from 'fs';
import formidable from 'formidable';
import superjson from 'superjson';
import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { getBaseUrl } from '../../utils/functions';
import { bunnyStorage } from '../../utils/bunny';

export const config = {
	api: {
		bodyParser: false,
	},
};

const parseForm = async (
	req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
	return await new Promise(async (resolve, reject) => {
		new formidable.IncomingForm().parse(req, function (err, fields, files) {
			if (err) reject(err);
			else resolve({ fields, files });
		});
	});
};

interface simplifiedFileType {
	fileName: string;
	fileExtension: string;
	mimetype: string;
	path: string;
	uuid: string;
}

const upload = async (req: NextApiRequest, res: NextApiResponse) => {
	var simplifiedFileList: simplifiedFileType[] = [];
	const { fields, files } = await parseForm(req);

	const { characterId } = fields;
	var fileList = Object.keys(files).map((key) => files[key]);

	fileList.forEach((element) => {
		// @ts-ignore
		const { originalFilename, filepath, mimetype } = element;
		if (!(mimetype.includes('image') || mimetype.includes('video'))) return;
		simplifiedFileList.push({
			fileName: originalFilename.split('.').shift(),
			fileExtension: originalFilename.split('.').pop(),
			mimetype: mimetype,
			path: filepath,
			uuid: uuidv4(),
		});
	});

	const endpoint = `${getBaseUrl()}/api/trpc/${
		characterId ? 'character.addMedia' : 'media.create'
	}`;

	const response = await fetch(endpoint, {
		method: 'POST',
		credentials: 'include',
		headers: {
			Cookie: req.headers.cookie!,
		},
		body: superjson.stringify({
			// favorize images
			data: simplifiedFileList.sort((a, b) => {
				if (a.mimetype < b.mimetype) return -1;
				if (a.mimetype > b.mimetype) return 1;
				return 0;
			}),
			characterId: characterId,
		}),
	});
	const data = await response.json();
	const responseData: { id: string; uuid: string }[] = data.result.data.json;
	const responseDataToObject: { [key: string]: string } = responseData.reduce(
		(obj, item) => ({ ...obj, [item.uuid]: item.id }),
		{}
	);

	const uploadAll = async () => {
		const uploadQ = await Promise.all(
			simplifiedFileList.map(async (file) => {
				return await bunnyStorage.upload(
					fs.readFileSync(file.path),
					`/${responseDataToObject[file.uuid]}.${file.fileExtension}`
				);
			})
		);
		return uploadQ.map((response) => ({
			code: response.data.HttpCode,
			message: response.data.Message,
			url: response.config.url,
		}));
	};

	return res.json(await uploadAll());
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
