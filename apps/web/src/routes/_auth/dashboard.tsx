import { createFileRoute } from "@tanstack/react-router";
import { AddApplicationDialog } from "@/components/add-application-dialog";
import { Board } from "@/components/board";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/dashboard")({
	component: RouteComponent,
	beforeLoad: async () => {
		const { data: customerState } = await authClient.customer.state();
		return { customerState };
	},
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
