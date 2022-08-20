import { useRouter } from 'next/router';
import { useState } from 'react';

const UploadForm: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;
	const [images, setImages] = useState<{ files: File[] }>();

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const target = e.target.files as FileList;
		const arr = Array.from(target);
		if (target) setImages({ ...images, files: arr });
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formadata = new FormData();
		if (images?.files && id) {
			images.files.forEach((file: File, index: number) => formadata.append(`file-${index}`, file));
			formadata.append('characterId', id as string);
		}
		const response = await fetch('/api/upload', {
			method: 'POST',
			body: formadata,
			credentials: 'include',
		});
	};

	return (
		<form onSubmit={handleSubmit} className="form-control gap-2 py-2 w-full">
			<input type="file" multiple onChange={handleChange} />
			<input type="submit" value="Submit" className="btn" />
		</form>
	);
};
export default UploadForm;
