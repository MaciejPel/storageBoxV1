import { useState } from 'react';
import { trpc } from '../../utils/trpc';
import Compressor from 'compressorjs';
import { CubeIcon, TrashIcon } from '@heroicons/react/solid';
import { CloudUploadIcon } from '@heroicons/react/outline';

interface UploadFormProps {
	characterId?: string;
	closeModal?: () => void;
}

const allowedFormats = {
	types: ['image', 'video'],
	extensions: ['gif', 'apng', 'webp', 'avif', 'mng', 'flif'],
};
const uploadLimits = { length: 10, size: 25 * 1024 * 1024 };

const UploadForm: React.FC<UploadFormProps> = ({ characterId, closeModal }) => {
	const [bg, setBg] = useState(false);
	const [loading, setLoading] = useState(false);
	const [compressing, setCompressing] = useState(false);
	const [images, setImages] = useState<{ files: File[] }>({ files: [] });
	const utils = trpc.useContext();

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		if (compressing) return;
		let fileList = Array.from(e.target.files as FileList);
		setCompressing(true);
		queueFiles(filterFiles(fileList));
	};

	// set all files to queue for compression, then filter out limits
	const queueFiles = (files: File[]) =>
		Promise.all(
			files.map(async (file) => {
				return convertToFile(await compressFile(file), file.name, file.type);
			})
		).then((compressedFiles) => {
			const limits = { size: 0, length: 0 };
			const restrictFiles = compressedFiles.filter((file) => {
				if (
					limits.length + 1 <= uploadLimits.length &&
					limits.size + file.size <= uploadLimits.size
				) {
					limits.length += 1;
					limits.size += file.size;
					return file;
				}
			});
			setImages({ ...images, files: restrictFiles });
			setCompressing(false);
		});

	// image compression
	const compressFile = (file: File) => {
		if (
			!file.type.includes('video') &&
			!allowedFormats.extensions.includes(file.type.replace('image/', ''))
		)
			return new Promise<Blob>((resolve, reject) => {
				new Compressor(file, {
					success: resolve,
					error: reject,
				});
			});
		return file;
	};

	// converts compressed result [blob] to file with same properties as before compression
	const convertToFile = (blob: Blob, name: string, type: string): File => {
		return new File([blob], name, { type });
	};

	// allows only video or image files
	const filterFiles = (files: File[]) => {
		return files.filter((file) => allowedFormats.types.includes(file.type.split('/')[0]));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		setLoading(true);
		e.preventDefault();
		const formData = new FormData();
		if (images?.files)
			images.files.forEach((file: File, index: number) => formData.append(`file-${index}`, file));
		if (characterId) formData.append('characterId', characterId);

		const response = await fetch('/api/upload', {
			method: 'POST',
			body: formData,
			credentials: 'include',
		});
		if (response) {
			if (characterId) utils.invalidateQueries(['character.single', { characterId }]);
			utils.invalidateQueries(['media.all']);
			setImages({ files: [] });
			setLoading(false);
			closeModal && closeModal();
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="form-control gap-4 w-full h-full"
		>
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
								<tr
									key={index}
									className="hover"
								>
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
					className={`h-64 sm:h-full cursor-pointer border-base-content border-2 rounded-xl border-dashed hover:border-success duration-300 group py-4 ${
						bg ? '!border-success' : ''
					}`}
					onDragOver={(e) => {
						e.preventDefault();
						setBg(true);
					}}
					onDrop={(e) => {
						e.preventDefault();
						if (compressing) return;
						const fileList = Array.from(e.dataTransfer.files);
						queueFiles(filterFiles(fileList));
						setCompressing(true);
						setBg(false);
					}}
				>
					<div
						className={`flex justify-center items-center h-full group-hover:duration-300 group-hover:text-success ${
							bg ? 'text-success' : ''
						}`}
					>
						<div className="flex flex-col items-center">
							{compressing && (
								<>
									<CubeIcon className="w-8 animate-pulse" />
									<div className="text-lg animate-pulse">Compressing...</div>
								</>
							)}
							{!compressing && (
								<>
									<CloudUploadIcon className="w-8" />
									<div className="text-lg">Select or Drag &amp; Drop files</div>
									<div className="font-normal">Maximum amount: {uploadLimits.length}</div>
									<div className="font-normal">
										Maximum size: {uploadLimits.size / 1024 / 1024}MB
									</div>
								</>
							)}
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
				disabled={compressing}
			/>
			<div className="btn-group justify-end">
				{loading && (
					<button
						title="Loading"
						type="button"
						className="btn loading w-1/2"
					>
						Processing...
					</button>
				)}
				{!loading && (
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
