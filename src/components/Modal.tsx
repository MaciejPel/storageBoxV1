import React, { useState } from 'react';

interface ModalProps {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	modalTitle: string;
	children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, setOpen, modalTitle, children }) => {
	return (
		<div
			className={`modal ${open ? 'modal-open' : ''} cursor-pointer !z-0`}
			onClick={() => setOpen(false)}
		>
			<label className="modal-box cursor-auto relative !z-10" onClick={(e) => e.stopPropagation()}>
				<h3 className="text-lg font-bold">{modalTitle}</h3>
				{children}
			</label>
		</div>
	);
};
export default Modal;
