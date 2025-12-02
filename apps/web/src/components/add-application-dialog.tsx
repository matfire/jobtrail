import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { type FormEvent, useState } from "react";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { Button } from "./ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "./ui/command";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export const AddApplicationDialog = () => {
	const createApplicationMutation = useMutation(
		orpc.applicationRouter.createApplication.mutationOptions(),
	);
	const createPositionMutation = useMutation(
		orpc.positionRouter.createPosition.mutationOptions(),
	);
	const { data: availablePositions } = useQuery(
		orpc.positionRouter.getAvailablePositions.queryOptions(),
	);

	const queryClient = useQueryClient();

	const [company, setCompany] = useState("");
	const [role, setRole] = useState("");
	const [roleOpen, setRoleOpen] = useState(false);
	const [open, setOpen] = useState(false);
	const [jobLink, setJobLink] = useState("");

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		let selectedRole = role;
		const foundPosition = availablePositions?.data.find(
			(position) => position.name === role,
		);
		if (!foundPosition) {
			const position = await createPositionMutation.mutateAsync({ name: role });
			selectedRole = position.id;
		} else {
			selectedRole = foundPosition.id;
		}

		createApplicationMutation.mutate(
			{
				companyName: company,
				positionId: selectedRole,
				postUrl: jobLink,
			},
			{
				onSuccess: async () => {
					await queryClient.invalidateQueries({
						queryKey: orpc.applicationRouter.getApplications.key(),
					});
					setOpen(false);
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Add Application</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add a new Application</DialogTitle>
					<DialogDescription />
				</DialogHeader>
				<div className="flex flex-col">
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<Label htmlFor="company">Company *</Label>
							<Input
								id="company"
								value={company}
								onChange={(e) => setCompany(e.target.value)}
								placeholder="Company name"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="role">Role *</Label>
							<Popover open={roleOpen} onOpenChange={setRoleOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={roleOpen}
										className="w-full justify-between"
									>
										{role || "Select or create role..."}
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-full p-0">
									<Command>
										<CommandInput
											placeholder="Search or type new role..."
											value={role}
											onValueChange={setRole}
										/>
										<CommandList>
											<CommandEmpty>
												<div className="p-2 text-sm">
													Press Enter to create "{role}"
												</div>
											</CommandEmpty>
											<CommandGroup>
												{availablePositions?.data.map((category) => (
													<CommandItem
														key={category.name}
														value={category.id}
														onSelect={() => {
															setRole(category.name);
															setRoleOpen(false);
														}}
													>
														<Check
															className={cn(
																"mr-2 h-4 w-4",
																role === category.name
																	? "opacity-100"
																	: "opacity-0",
															)}
														/>
														<div
															className="mr-2 h-3 w-3 rounded-full"
															style={{ backgroundColor: category.color }}
														/>
														{category.name}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</div>
						<div className="space-y-2">
							<Label htmlFor="jobLink">Job Link</Label>
							<Input
								id="jobLink"
								type="url"
								value={jobLink}
								onChange={(e) => setJobLink(e.target.value)}
								placeholder="https://..."
							/>
						</div>
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit">Add Application</Button>
						</div>
					</form>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
