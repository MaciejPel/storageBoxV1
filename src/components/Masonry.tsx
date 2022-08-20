interface MasonryProps {
	variant?: 'wide' | 'wider';
	children: React.ReactNode;
}

const Masonry: React.FC<MasonryProps> = ({ variant = 'wider', children }) => {
	const styles = {
		wider: 'xl:columns-5 lg:columns-4 md:columns-3 sm:columns-2 columns-1 py-2 w-full',
		wide: 'lg:columns-3 sm:columns-2 columns-1 py-2',
	};

	return <div className={styles[variant]}>{children}</div>;
};
export default Masonry;
