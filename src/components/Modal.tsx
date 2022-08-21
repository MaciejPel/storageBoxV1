import React, { useState } from 'react';

interface ModalProps {
	modalTitle: string;
	buttonContent: string | JSX.Element;
	buttonType: 'card' | 'button';
	id: string;
	children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ modalTitle, buttonContent, buttonType, id, children }) => {
	const [open, setOpen] = useState<boolean>(false);
	const styles = { button: 'btn w-full md:w-auto', card: 'btn btn-ghost p-3' };

	return (
		<>
			<label htmlFor={id} className={styles[buttonType]}>
				{buttonContent}
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
