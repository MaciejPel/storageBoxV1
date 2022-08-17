import Header from './Header';
import Meta from './Meta';

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<Meta />
			<Header />
			<div className="main flex flex-col justify-start items-center   py-2 font-medium selection:bg-base-content">
				{/* <main className="px-8 flex flex-1 flex-col justify-start items-center">{children}</main> */}
				{children}
			</div>
		</>
	);
};

export default Layout;
