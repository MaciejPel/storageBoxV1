const BunnyStorage = require('bunnycdn-storage').default;

console.log(process.env.BUNNY_CDN_KEY);
export const bunnyStorage = new BunnyStorage(
	process.env.BUNNY_CDN_KEY,
	`${process.env.STORAGE_NAME}/test`
);
