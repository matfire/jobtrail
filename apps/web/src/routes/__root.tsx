import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackDevtools } from '@tanstack/react-devtools'
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools'
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { orpc } from "@/utils/orpc";
import "../index.css";
import type { User } from "better-auth";
import { authClient } from "@/lib/auth-client";

export interface RouterAppContext {
	orpc: typeof orpc;
	queryClient: QueryClient;
	user: User | null;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	beforeLoad: async () => {
		try {
			const session = await authClient.getSession();
			return { user: session.data?.user ?? null };
		} catch (error) {
			console.error("Failed to fetch user session:", error);
			return { user: null };
		}
	},
	head: () => ({
		meta: [
			{
				title: "jobtrail",
			},
			{
				name: "description",
				content: "jobtrail is a web application",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				defaultTheme="dark"
				storageKey="vite-ui-theme"
			>
				<div className="grid h-svh grid-rows-[auto_1fr]">
					<Header />
					<Outlet />
				</div>
				<Toaster richColors />
			</ThemeProvider>
			<TanStackDevtools plugins={[formDevtoolsPlugin(), {
			name: "Tanstack Query",
			render: <ReactQueryDevtoolsPanel />
			}, {
			name: "Tanstack Router",
			render: <TanStackRouterDevtoolsPanel />
			}]} />
		</>
	);
}
