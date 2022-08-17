import Head from 'next/head';

const Meta: React.FC<{ title?: string }> = ({ title = 'Home' }) => {
	const titleTag = `${title} | Bestiary`;
	return (
		<Head>
			<title>{titleTag}</title>
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<meta name="description" content="Trying things out in NextJS" />
			<meta name="keywords" content="react nextjs tailwind auth programming" />
		</Head>
	);
};
export default Meta;
