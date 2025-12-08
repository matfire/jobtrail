import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
	const [selectedId, setSelectedId] = useState<string | null>(null);
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

	return (
		<div>
			<Dialog open={editOpen} onOpenChange={() => {
	  setEditOpen(false)
			setSelectedId(null)
			}}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Position</DialogTitle>
					</DialogHeader>
					<div></div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="secondary">Close</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
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
								<Button variant="secondary" onClick={() => {
						  setSelectedId(position.id)
								setEditOpen(true)
								}}>
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
