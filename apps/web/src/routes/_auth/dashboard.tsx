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
	const { customerState, user } = Route.useRouteContext();

	const hasProSubscription = customerState?.activeSubscriptions?.length! > 0;
	console.log("Active subscriptions:", customerState?.activeSubscriptions);

	return (
		<div>
			<h1>Dashboard</h1>
			<AddApplicationDialog />
			<p>Welcome {user?.name}</p>
			<p>Plan: {hasProSubscription ? "Pro" : "Free"}</p>
			{hasProSubscription ? (
				<Button onClick={async () => await authClient.customer.portal()}>
					Manage Subscription
				</Button>
			) : (
				<Button
					onClick={async () => await authClient.checkout({ slug: "pro" })}
				>
					Upgrade to Pro
				</Button>
			)}
			<div className="h-full max-h-[80%] w-full">
				<Board />
			</div>
		</div>
	);
}
