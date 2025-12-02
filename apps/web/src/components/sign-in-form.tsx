import { useForm } from "@tanstack/react-form";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import Loader from "./loader";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const navigate = useNavigate({
		from: "/",
	});
	const { isPending } = authClient.useSession();
	const search = useSearch({ from: "/login" });
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						navigate({
							to: search.redirect,
						});
						toast.success("Sign in successful");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="flex min-h-full items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader className="text-center">
					<CardTitle className="font-bold text-2xl">Welcome Back</CardTitle>
					<CardDescription>
						Sign in to your account to track your job applications
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<div>
							<form.Field name="email">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Email</Label>
										<Input
											id={field.name}
											name={field.name}
											type="email"
											placeholder="Enter your email"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.errors.map((error) => (
											<p
												key={error?.message}
												className="text-destructive text-sm"
											>
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<div>
							<form.Field name="password">
								{(field) => (
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor={field.name}>Password</Label>
											<Button
												variant="link"
												size="sm"
												className="h-auto p-0 text-xs"
												type="button"
											>
												Forgot password?
											</Button>
										</div>
										<Input
											id={field.name}
											name={field.name}
											type="password"
											placeholder="Enter your password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.errors.map((error) => (
											<p
												key={error?.message}
												className="text-destructive text-sm"
											>
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<form.Subscribe>
							{(state) => (
								<Button
									type="submit"
									className="w-full"
									disabled={!state.canSubmit || state.isSubmitting}
								>
									{state.isSubmitting ? "Signing in..." : "Sign In"}
								</Button>
							)}
						</form.Subscribe>
					</form>
				</CardContent>

				<CardFooter className="flex-col gap-4">
					<div className="relative w-full">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<span className="relative bg-background px-2 text-muted-foreground text-xs">
							Or continue with
						</span>
					</div>

					<Button variant="outline" className="w-full">
						Sign in with Google
					</Button>

					<p className="text-center text-muted-foreground text-sm">
						Don't have an account?{" "}
						<Button
							variant="link"
							onClick={onSwitchToSignUp}
							className="h-auto p-0 text-sm"
						>
							Sign up
						</Button>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
