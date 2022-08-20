import React, { useState } from 'react';

interface ModalProps {
	modalTitle: string;
	buttonTitle: string;
	id: string;
	children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ modalTitle, buttonTitle, id, children }) => {
	const [open, setOpen] = useState<boolean>(false);

	return (
		<>
			<label htmlFor={id} className="btn modal-button w-full md:w-auto">
				{buttonTitle}
			</label>
			<input
				type="checkbox"
				id={id}
				className="modal-toggle"
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					const value = e.target.value === 'on' ? true : false;
					setOpen(!value);
				}}
			/>
			<label htmlFor={id} className={`modal ${open ? 'modal-open' : ''} cursor-pointer`}>
				<label htmlFor="" className="modal-box cursor-auto relative">
					<h3 className="text-lg font-bold">{modalTitle}</h3>
					{children}
				</label>
			</label>
		</>
	);
};
export default Modal;
