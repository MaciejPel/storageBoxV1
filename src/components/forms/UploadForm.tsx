import { CloudUploadIcon } from '@heroicons/react/outline';
import { TrashIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { trpc } from '../../utils/trpc';

const UploadForm: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;
	const [bg, setBg] = useState(false);
	const [loading, setLoading] = useState(false);
	const [images, setImages] = useState<{ files: File[] }>({ files: [] });
	const uploadLimit = { length: 10, size: 25 * 1024 * 1024 };
	const utils = trpc.useContext();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		let fileList = Array.from(e.target.files as FileList);
		setImages({ ...images, files: validateList(fileList) });
	};

	const validateList = (fileList: File[]) => {
		let currentQ = { length: 0, size: 0 };
		return fileList.filter((file) => {
			if (
				!(file.type.includes('video') || file.type.includes('image')) ||
				currentQ.size + file.size > uploadLimit.size ||
				currentQ.length + 1 > uploadLimit.length
			)
				return;
			currentQ.size += file.size;
			currentQ.length += 1;
			return file;
		});
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		setLoading(true);
		e.preventDefault();
		const formData = new FormData();
		if (images?.files && id) {
			images.files.forEach((file: File, index: number) => formData.append(`file-${index}`, file));
			formData.append('characterId', id as string);
		}
		const response = await fetch('/api/upload', {
			method: 'POST',
			body: formData,
			credentials: 'include',
		});
		if (response && id) {
			utils.invalidateQueries(['character.single', { characterId: id as string }]);
			setImages({ files: [] });
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="form-control gap-4 w-full h-full">
			{images?.files?.length > 0 && (
				<div className="h-full overflow-x-auto">
					<table className="table static w-full">
						<thead>
							<tr>
								<th className="!static">Name</th>
								<th>Type</th>
								<th>Size</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{images.files.map((file, index) => (
								<tr key={index} className="hover">
									<td className="p-3 xl:max-w-[15rem] lg:max-w-[10rem] md:max-w-[6rem] sm:max-w-[3rem] max-w-[5rem] truncate">
										{file.name}
									</td>
									<td className="p-3 w-1/12">
										{file.type.replace('video', '').replace('image', '').replace('/', '')}
									</td>
									<td className="p-3 w-1/12">{(file.size / (1024 * 1024)).toFixed(2)}MB</td>
									<td className="p-3 w-1/12">
										<button
											type="button"
											className="btn btn-sm btn-error"
											onClick={() =>
												setImages({ files: images.files.filter((_, i) => i !== index) })
											}
										>
											<TrashIcon className="w-6" />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
			{images?.files.length === 0 && (
				<label
					htmlFor="files"
					className={`h-64 sm:h-full cursor-pointer border-base-content border-2 rounded-xl border-dashed hover:border-success duration-300 group ${
						bg ? '!border-success' : ''
					}`}
					onDragOver={(e) => {
						e.preventDefault();
						setBg(true);
					}}
					onDrop={(e) => {
						e.preventDefault();
						const fileList = Array.from(e.dataTransfer.files);
						setImages({ ...images, files: validateList(fileList) });
						setBg(false);
					}}
				>
					<div
						className={`flex justify-center items-center h-full group-hover:duration-300 group-hover:text-success ${
							bg ? 'text-success' : ''
						}`}
					>
						<div className="flex flex-col items-center">
							<CloudUploadIcon className="w-8" />
							Select or Drag &amp; Drop files
						</div>
					</div>
				</label>
			)}

			<input
				type="file"
				id="files"
				multiple
				accept="image/*,video/*"
				onChange={handleChange}
				className="hidden"
			/>
			<div className="btn-group justify-end">
				{loading ? (
					<button title="Loading" type="button" className="btn loading w-1/2">
						Processing...
					</button>
				) : (
					<>
						<input
							type="reset"
							value="Reset"
							className="btn btn-warning sm:w-1/6"
							onClick={() => setImages({ files: [] })}
						/>
						<input
							type="submit"
							value="Submit"
							className="btn btn-primary w-1/3"
							disabled={images.files.length === 0}
						/>
					</>
				)}
			</div>
		</form>
	);
};
export default UploadForm;
