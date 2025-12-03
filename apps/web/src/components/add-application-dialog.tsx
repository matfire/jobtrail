import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDownIcon, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import z from "zod";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";

const formSchema = z.object({
	company: z.string().min(1),
	role: z.string().min(1),
	jobLink: z.string().nullish(),
	submittedAt: z.date().optional(),
});

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

	const [roleOpen, setRoleOpen] = useState(false);
	const [open, setOpen] = useState(false);
    const [dateOpen, setDateOpen] = useState(false);

	const form = useForm({
		validators: {
			onSubmit: formSchema,
			onChange: formSchema
		},
		defaultValues: {
		  role: "",
				company: "",
				jobLink: "",
				submittedAt: new Date()
		},
		onSubmit: async ({value}) => {
			console.log(value);
			const {role, company, jobLink, submittedAt} = value
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
							submittedAt
						},
						{
							onSuccess: async () => {
								await queryClient.invalidateQueries({
									queryKey: orpc.applicationRouter.getApplications.key(),
								});
								setOpen(false);
								form.reset()
							},
						},
					);
		},
	});

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
					<form
						className="space-y-4"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<FieldGroup>
							<form.Field
								name="company"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Company *</FieldLabel>
											<Input
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												placeholder="Company name"
											/>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									);
								}}
							/>
						</FieldGroup>
						<FieldGroup>
							<form.Field
								name="role"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Role *</FieldLabel>
											<Popover open={roleOpen} onOpenChange={setRoleOpen}>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														role="combobox"
														aria-expanded={roleOpen}
														className="w-full justify-between"
													>
														{field.state.value || "Select or create role..."}
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-full p-0">
													<Command>
														<CommandInput
															placeholder="Search or type new role..."
															value={field.state.value}
															onValueChange={field.handleChange}
														/>
														<CommandList>
															<CommandEmpty>
																<div className="p-2 text-sm">
																	Press Enter to create "{field.state.value}"
																</div>
															</CommandEmpty>
															<CommandGroup>
																{availablePositions?.data.map((category) => (
																	<CommandItem
																		key={category.name}
																		value={category.id}
																		onSelect={() => {
																			field.handleChange(category.name);
																			setRoleOpen(false);
																		}}
																	>
																		<Check
																			className={cn(
																				"mr-2 h-4 w-4",
																				field.state.value === category.name
																					? "opacity-100"
																					: "opacity-0",
																			)}
																		/>
																		<div
																			className="mr-2 h-3 w-3 rounded-full"
																			style={{
																				backgroundColor: category.color,
																			}}
																		/>
																		{category.name}
																	</CommandItem>
																))}
															</CommandGroup>
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									);
								}}
							/>
						</FieldGroup>
						<FieldGroup>
						  <form.Field name="jobLink"
								children={(field) => {
								const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
								  return (
										<Field data-invalid={isInvalid}>
										  <FieldLabel htmlFor={field.name}>Job Link</FieldLabel>
												<Input value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur} placeholder="Job link" />
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
										)
								}}
								/>
						</FieldGroup>
						<FieldGroup>
						  <form.Field
							 name="submittedAt"
								children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Submitted At</FieldLabel>
                      <Popover open={dateOpen} onOpenChange={setDateOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline">
                            {field.state.value ? field.state.value.toLocaleDateString() : "Select Date"}
                            <ChevronDownIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0">
                          <Calendar mode="single" selected={field.state.value} captionLayout="dropdown" onSelect={(date) => {
                            field.handleChange(date ?? new Date())
                            setDateOpen(false)
                          }} />
                        </PopoverContent>
                      </Popover>
                    </Field>
                  )
								}}
								/>
						</FieldGroup>
						<div className="flex justify-end gap-2">
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
