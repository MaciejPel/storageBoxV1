import { useEffect, useState } from 'react';

const Upload: React.FC = () => {
	const [images, setImages] = useState<{ files: File[] }>();

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const target = e.target.files as FileList;
		const arr = Array.from(target);
		if (target) setImages({ ...images, files: arr });
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formadata = new FormData();
		if (images?.files) {
			images.files.forEach((file: File, index: number) => formadata.append('file', file));
		}
		const response = await fetch('/api/upload', {
			method: 'POST',
			body: formadata,
		});
	};

	useEffect(() => {
		console.log(images);
	}, [images]);

	return (
		<form onSubmit={handleSubmit} className="form-control gap-2 py-2">
			<input type="file" multiple onChange={handleChange} />
			<input type="submit" value="Submit" className="btn" />
		</form>
	);
};
export default Upload;
