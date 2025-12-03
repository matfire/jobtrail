import { createFileRoute } from "@tanstack/react-router";
import { AddApplicationDialog } from "@/components/add-application-dialog";
import { Board } from "@/components/board";

export const Route = createFileRoute("/_auth/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<AddApplicationDialog />

			<div className="h-full max-h-[80%] w-full">
				<Board />
			</div>
		</div>
	);
}
