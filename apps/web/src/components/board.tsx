import { VALID_KAMBAN_TABLES } from "@jobtrail/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { orpc } from "@/utils/orpc";
import { BoardColumn } from "./board-column";

const statusToColumn: Record<VALID_KAMBAN_TABLES, string> = {
	[VALID_KAMBAN_TABLES.APPLIED]: "applied",
	[VALID_KAMBAN_TABLES.INTERVIEWING]: "interviewing",
	[VALID_KAMBAN_TABLES.ACCEPTED]: "accepted",
	[VALID_KAMBAN_TABLES.ARCHIVED]: "archived",
	[VALID_KAMBAN_TABLES.REFUSED]: "refused",
	[VALID_KAMBAN_TABLES.REJECTED]: "rejected",
};

export const Board = () => {
	const { data: applications } = useQuery(
		orpc.applicationRouter.getApplications.queryOptions(),
	);
	const queryClient = useQueryClient();

	const getApplicationsForStatus = useCallback(
		(status: VALID_KAMBAN_TABLES) => {
			return (
				applications?.data.filter((app) => app.application.status === status) ||
				[]
			);
		},
		[applications],
	);

	const updateApplicationMutation = useMutation(
		orpc.applicationRouter.updateApplication.mutationOptions(),
	);

	const handleDrop = (appId: string, status: VALID_KAMBAN_TABLES) => {
		updateApplicationMutation.mutate(
			{ id: appId, status },
			{
				onSuccess: async () => {
					console.log("Application updated successfully");
					await queryClient.invalidateQueries({
						queryKey: orpc.applicationRouter.getApplications.key(),
					});
				},
				onError: (error) => {
					console.error("Error updating application:", error);
				},
			},
		);
	};

	return (
		<div className="flex h-full w-full max-w-screen gap-4 overflow-x-auto pb-4">
			<BoardColumn
				items={getApplicationsForStatus(VALID_KAMBAN_TABLES.APPLIED)}
				onDrop={handleDrop}
				title={statusToColumn[VALID_KAMBAN_TABLES.APPLIED]}
				type={VALID_KAMBAN_TABLES.APPLIED}
			/>
			<BoardColumn
				items={getApplicationsForStatus(VALID_KAMBAN_TABLES.INTERVIEWING)}
				onDrop={handleDrop}
				title={statusToColumn[VALID_KAMBAN_TABLES.INTERVIEWING]}
				type={VALID_KAMBAN_TABLES.INTERVIEWING}
			/>
			<BoardColumn
				items={getApplicationsForStatus(VALID_KAMBAN_TABLES.ACCEPTED)}
				onDrop={handleDrop}
				title={statusToColumn[VALID_KAMBAN_TABLES.ACCEPTED]}
				type={VALID_KAMBAN_TABLES.ACCEPTED}
			/>
			<BoardColumn
				items={getApplicationsForStatus(VALID_KAMBAN_TABLES.REJECTED)}
				onDrop={handleDrop}
				title={statusToColumn[VALID_KAMBAN_TABLES.REJECTED]}
				type={VALID_KAMBAN_TABLES.REJECTED}
			/>
			<BoardColumn
				items={getApplicationsForStatus(VALID_KAMBAN_TABLES.REFUSED)}
				onDrop={handleDrop}
				title={statusToColumn[VALID_KAMBAN_TABLES.REFUSED]}
				type={VALID_KAMBAN_TABLES.REFUSED}
			/>
			<BoardColumn
				items={getApplicationsForStatus(VALID_KAMBAN_TABLES.ARCHIVED)}
				onDrop={handleDrop}
				title={statusToColumn[VALID_KAMBAN_TABLES.ARCHIVED]}
				type={VALID_KAMBAN_TABLES.ARCHIVED}
			/>
		</div>
	);
};
