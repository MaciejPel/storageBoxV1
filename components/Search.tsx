import { SearchIcon } from '@heroicons/react/outline';

const Search: React.FC<{
	setQuery: React.Dispatch<React.SetStateAction<string>>;
	query: string;
}> = ({ setQuery, query }) => {
	return (
		<div className="w-full flex items-center">
			<input
				type="text"
				className="input input-bordered w-full my-2 rounded-r-none focus:outline-0"
				onChange={(e) => setQuery(e.target.value.toLowerCase())}
				value={query}
				placeholder="Search..."
				id="search"
			/>
			<label htmlFor="search" className="btn rounded-l-none w-16 no-animation ">
				<SearchIcon className="w-6 h-full " />
			</label>
		</div>
	);
};
export default Search;
