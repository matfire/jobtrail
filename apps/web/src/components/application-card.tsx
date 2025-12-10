import type { Application } from "@jobtrail/api/schemas/application";
import type { Position } from "@jobtrail/api/schemas/position";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { EllipsisVertical, Globe, Pen, Trash2 } from "lucide-react";
import { useState } from "react";
import { orpc } from "@/utils/orpc";
import { ApplicationDialog } from "./application-dialog";
import { NotesDialog } from "./notes-dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle } from "./ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

dayjs.extend(localizedFormat);

interface ApplicationCardProps {
	application: Application;
	position?: Position | null;
}

export const ApplicationCard = ({
	application,
	position,
}: ApplicationCardProps) => {
	const [editOpen, setEditOpen] = useState(false);
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

	const handlePostOpen = () => {
		if (!application.postUrl) {
			return;
		}
		window.open(application.postUrl);
	};

	return (
		<>
			<ApplicationDialog
				open={editOpen}
				setOpen={setEditOpen}
				application={application}
			/>
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
										? `${position.color}20`
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
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<Button variant="secondary">
									<EllipsisVertical />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-40" align="end">
								<DropdownMenuItem asChild>
									<Button
										variant="ghost"
										className="h-8 w-full"
										onClick={() => setEditOpen(true)}
									>
										<Pen className="h-4 w-4" />
										Edit application
									</Button>
								</DropdownMenuItem>
								{application.postUrl && (
									<DropdownMenuItem asChild>
										<Button
											variant="ghost"
											className="h-8 w-full"
											onClick={handlePostOpen}
										>
											<Globe className="h-4 w-4" />
											Open Job Link
										</Button>
									</DropdownMenuItem>
								)}
								<DropdownMenuItem asChild>
									<NotesDialog applicationId={application.id} />
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-full text-destructive hover:text-destructive"
										onClick={() => deleteApplication(application.id)}
									>
										<Trash2 className="h-4 w-4" />
										Delete application
									</Button>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>
			</Card>
		</>
	);
};
