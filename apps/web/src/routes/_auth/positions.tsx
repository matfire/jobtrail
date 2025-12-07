import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_auth/positions")({
	component: RouteComponent,
});

function RouteComponent() {
	const queryClient = useQueryClient();
	const { data } = useQuery(
		orpc.positionRouter.getAvailablePositions.queryOptions(),
	);
	const deletePositionMutation = useMutation(
		orpc.positionRouter.deletePosition.mutationOptions(Route),
	);

	const handlePositionDelete = (id: string) => {
		deletePositionMutation.mutate(
			{ id },
			{
				onSuccess: async () => {
					await queryClient.invalidateQueries({
						queryKey: orpc.positionRouter.getAvailablePositions.key(),
					});
				},
			},
		);
	};

	return (
		<div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Color</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data?.data.map((position) => (
						<TableRow key={position.id}>
							<TableCell>{position.name}</TableCell>
							<TableCell>{position.color}</TableCell>
							<TableCell>
								<Button
									variant="destructive"
									onClick={() => {
										handlePositionDelete(position.id);
									}}
								>
									<Trash2 />
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
