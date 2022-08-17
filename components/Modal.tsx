const Modal = ({
	modalTitle,
	buttonTitle,
	children,
}: {
	modalTitle: string;
	buttonTitle: string;
	children: React.ReactNode;
}) => {
	return (
		<>
			<label htmlFor="my-modal-4" className="btn btn-sm modal-button">
				{buttonTitle}
			</label>
			<input type="checkbox" id="my-modal-4" className="modal-toggle" />
			<label htmlFor="my-modal-4" className="modal cursor-pointer">
				<label className="modal-box relative">
					<h3 className="text-lg font-bold">{modalTitle}</h3>
					{children}
				</label>
			</label>
		</>
	);
};
export default Modal;
