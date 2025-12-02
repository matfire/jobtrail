import type { Application } from "@jobtrail/api/schemas/application";
import type { Position } from "@jobtrail/api/schemas/position";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { Trash2 } from "lucide-react";
import { orpc } from "@/utils/orpc";
import { NotesDialog } from "./notes-dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle } from "./ui/card";

dayjs.extend(localizedFormat);

interface ApplicationCardProps {
	application: Application;
	position?: Position | null;
}

export const ApplicationCard = ({
	application,
	position,
}: ApplicationCardProps) => {
	const deleteApplicationMutation = useMutation(
		orpc.applicationRouter.deleteApplication.mutationOptions(),
	);
	const queryClient = useQueryClient();
	const deleteApplication = (id: string) => {
		deleteApplicationMutation.mutate(
			{ id },
			{
				onSuccess: async () => {
					await queryClient.invalidateQueries({
						queryKey: orpc.applicationRouter.getApplications.key(),
					});
				},
			},
		);
	};

	return (
		<Card className="mb-3 bg-card transition-shadow hover:shadow-md">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<CardTitle className="font-semibold text-base text-foreground">
							{application.companyName}
						</CardTitle>
						<Badge
							className="mt-2 font-medium text-xs"
							style={{
								backgroundColor: position?.color
									? position.color + "20"
									: "gray20",
								color: position?.color,
								borderColor: position?.color,
							}}
						>
							{position?.name}
						</Badge>
						<div className="mt-2 w-full space-y-1 text-muted-foreground text-xs">
							<div>
								Submitted:{" "}
								{dayjs(application.submittedAt)
									.locale(navigator.language)
									.format("LL")}
							</div>
							<div>
								Updated:{" "}
								{dayjs(application.updatedAt)
									.locale(navigator.language)
									.format("LL")}
							</div>
						</div>
					</div>
					<NotesDialog applicationId={application.id} />
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-destructive hover:text-destructive"
						onClick={() => deleteApplication(application.id)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</CardHeader>
		</Card>
	);
};
