const Loader = () => {
	return (
		<div className="flex gap-3 text-6xl">
			<div className="animate-pulsate h-3 w-3 bg-warning rounded-full inline-block" />
			<div
				className="animate-pulsate h-3 w-3 bg-error rounded-full inline-block"
				style={{ animationDelay: '150ms' }}
			/>
			<div
				className="animate-pulsate h-3 w-3 bg-success rounded-full inline-block"
				style={{ animationDelay: '300ms' }}
			/>
		</div>
	);
};

export default Loader;
