import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ApplicationDialog } from "@/components/application-dialog";
import { Board } from "@/components/board";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_auth/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const [createApplicationOpen, setCreateApplicationOpen] = useState(false);
	return (
		<div className="h-full">
			<ApplicationDialog
				open={createApplicationOpen}
				setOpen={setCreateApplicationOpen}
			/>
			<Button onClick={() => setCreateApplicationOpen(true)}>Add application</Button>
			<div className="w-full">
				<Board />
			</div>
		</div>
	);
}
