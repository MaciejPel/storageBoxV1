export const trimString = (u: unknown) => (typeof u === 'string' ? u.trim() : u);

export const getBaseUrl = () => {
	if (typeof window !== 'undefined') return '';
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
	return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const closeModal = (elementId: string): void => {
	const element = document.getElementById(elementId) as HTMLInputElement;
	element.checked = false;
	return;
};
