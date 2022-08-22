import { useState } from 'react';
import { NextPage } from 'next';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import Meta from '../components/Meta';
import Container from '../components/Container';
import { trpc } from '../utils/trpc';
import { useSession } from 'next-auth/react';
import { TrashIcon } from '@heroicons/react/solid';

const Tags: NextPage = () => {
	const [sum, setSum] = useState<number>(0);
	const { data: session, status } = useSession();
	const utils = trpc.useContext();
	const tagsQuery = trpc.useQuery(['tag.all'], {
		enabled: session ? true : false,
		onSuccess(data) {
			setSum(
				data.reduce((acc, obj) => {
					return acc + obj.characterIds.length;
				}, 0)
			);
		},
	});
	const tagsDeleteMutation = trpc.useMutation(['tag.delete'], {
		onSuccess() {
			utils.invalidateQueries('tag.all');
		},
	});

	return (
		<>
			<Meta title="Tags" />
			<Container type="start">
				{tagsQuery.isSuccess && tagsQuery.data.length === 0 && (
					<Container type="center">It is pretty empty in here 🏖</Container>
				)}
				{tagsQuery.isSuccess && tagsQuery.data.length > 0 && (
					<>
						<h2 className="text-4xl font-extrabold my-4">Tags statistics</h2>
						<table className="table table-zebra w-full md:w-3/4 static">
							<thead>
								<tr className="hover">
									<td className="!static w-1/12">#</td>
									<th>Name</th>
									<th>Usage</th>
									<th className="md:w-1/12">Actions</th>
								</tr>
							</thead>
							<tbody>
								{tagsQuery.data.map((tag, index) => (
									<tr className="hover" key={tag.id}>
										<td>{index + 1}</td>
										<td>{tag.name}</td>
										<td>
											{tag.characterIds.length} (
											{sum && ((tag.characterIds.length / sum) * 100).toFixed(2)}
											%)
										</td>
										<td>
											<button
												type="button"
												title="Delete tag"
												className="btn btn-error btn-sm"
												onClick={() => tagsDeleteMutation.mutate({ tagId: tag.id })}
											>
												<TrashIcon className="w-6" />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</>
				)}
			</Container>
		</>
	);
};
export default Tags;

export const getServerSideProps = async (context: any) => {
	const session = await getServerSession(context.req, context.res, authOptions);

	if (!session) {
		return {
			redirect: {
				destination: '/login',
				pernament: false,
			},
		};
	}
	return { props: { session } };
};
