import { useEffect } from 'react';

interface ModalProps {
	open: boolean;
	onClose: Function;
	modalTitle: string;
	children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, modalTitle, children }) => {
	const keydownHandler = (e: KeyboardEvent) => {
		switch (e.key) {
			case 'Escape':
				onClose();
				break;
		}
	};

	useEffect(() => {
		document.addEventListener('keydown', keydownHandler);
		return () => document.removeEventListener('keydown', keydownHandler);
	});

	return (
		<div
			className={`modal !z-0 cursor-pointer ${open ? 'modal-open' : ''}`}
			onClick={() => onClose()}
		>
			<label
				className="modal-box cursor-auto relative !z-10"
				onClick={(e) => e.stopPropagation()}
			>
				<h3 className="text-lg font-bold">{modalTitle}</h3>
				{children}
			</label>
		</div>
	);
};
export default Modal;
