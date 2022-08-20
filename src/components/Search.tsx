import { SearchIcon, FilterIcon } from '@heroicons/react/outline';
import { trpc } from '../utils/trpc';

interface SearchProps {
	setQuery: React.Dispatch<React.SetStateAction<{ string: string; tags: string[] }>>;
	query: { string: string; tags: string[] };
}

const Search: React.FC<SearchProps> = ({ setQuery, query }) => {
	const tagsQuery = trpc.useQuery(['tag.all']);

	return (
		<div className="w-full flex items-center">
			<input
				type="text"
				className="input input-bordered w-full my-2 rounded-r-none focus:outline-0"
				onChange={(e) => setQuery({ ...query, string: e.target.value.toLowerCase() })}
				value={query.string}
				placeholder="Search..."
				id="search"
			/>
			<label htmlFor="search" className="btn rounded-l-none w-16 no-animation ">
				<SearchIcon className="w-6 h-full " />
			</label>

			<div className="dropdown dropdown-end">
				<label tabIndex={0} className="btn m-1 mr-0">
					<FilterIcon className="w-6 h-full" />
				</label>
				<ul
					tabIndex={0}
					className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-80 grid grid-cols-2"
				>
					{tagsQuery.isSuccess &&
						tagsQuery.data.map((tag) => (
							<li key={tag.id}>
								<label htmlFor={tag.id} className="label flex justify-start">
									<input
										id={tag.id}
										type="checkbox"
										className="checkbox label-text"
										value={tag.id}
										name="tagQuery"
										onChange={(e) => {
											if (e.target.checked === true)
												setQuery({ ...query, tags: [...query.tags, e.target.value] });
											if (e.target.checked === false)
												setQuery({
													...query,
													tags: query.tags.filter((tag) => tag != e.target.value),
												});
										}}
									/>
									{tag.name}
								</label>
							</li>
						))}
				</ul>
			</div>
		</div>
	);
};
export default Search;
