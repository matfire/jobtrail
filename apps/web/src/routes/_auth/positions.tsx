import type { Position } from "@jobtrail/api/schemas/position";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { PositionDialog } from "@/components/position-dialog";
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
	const [editOpen, setEditOpen] = useState(false);
	const [selectedPosition, setSelectedPosition] = useState<Position | null>(
		null,
	);
	const queryClient = useQueryClient();
	const { data } = useQuery(
		orpc.positionRouter.getAvailablePositions.queryOptions(),
	);
	const deletePositionMutation = useMutation(
		orpc.positionRouter.deletePosition.mutationOptions(),
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

	const handlePositionUpdate = (id: string) => {
		const position = data?.data.find((position) => position.id === id);
		if (!position) {
			return;
		}
		setSelectedPosition(position);
		setEditOpen(true);
	};

	return (
		<div>
			<PositionDialog
				open={editOpen}
				setOpen={setEditOpen}
				position={selectedPosition ?? undefined}
			/>
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
								<Button
									variant="secondary"
									onClick={() => {
										handlePositionUpdate(position.id);
									}}
								>
									<Pencil />
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
