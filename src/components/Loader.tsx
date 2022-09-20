const Loader = () => {
	return (
		<div className="flex gap-2 text-6xl">
			<div className="animate-pulsate">.</div>
			<div
				className="animate-pulsate"
				style={{ animationDelay: '100ms' }}
			>
				.
			</div>
			<div
				className="animate-pulsate"
				style={{ animationDelay: '200ms' }}
			>
				.
			</div>
		</div>
	);
};

export default Loader;
