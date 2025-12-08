import type { Application } from "@jobtrail/api/schemas/application";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDownIcon, Plus } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { orpc } from "@/utils/orpc";
import { AddPositionDialog } from "./add-position-dialog";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

const formSchema = z.object({
	company: z.string().nonempty(),
	role: z.string().nonempty(),
	jobLink: z.string().optional(),
	submittedAt: z.date().default(new Date()),
});

interface ApplicationDialogProps {
	application?: Application;
	open: boolean;
	setOpen: (v: boolean) => void;
}

export const ApplicationDialog = ({
	application,
	open,
	setOpen,
}: ApplicationDialogProps) => {
	const createApplicationMutation = useMutation(
		orpc.applicationRouter.createApplication.mutationOptions(),
	);

	const updateApplicationMutation = useMutation(
		orpc.applicationRouter.updateApplication.mutationOptions(),
	);

	const { data: availablePositions } = useQuery(
		orpc.positionRouter.getAvailablePositions.queryOptions(),
	);

	const queryClient = useQueryClient();

	const [dateOpen, setDateOpen] = useState(false);
	const [createRoleOpen, setCreateRoleOpen] = useState(false);

	const form = useForm({
		validators: {
			onSubmit: formSchema,
			onChange: formSchema,
		},
		defaultValues: {
			role: application?.positionId ?? null,
			company: application?.companyName ?? "",
			jobLink: application?.postUrl,
			submittedAt: application?.submittedAt ?? new Date(),
		},
		onSubmit: async ({ value }) => {
			const { role, company, jobLink, submittedAt } = value;

			if (!application) {
				createApplicationMutation.mutate(
					{
						companyName: company,
						positionId: role,
						postUrl: jobLink,
						submittedAt,
					},
					{
						onSuccess: async () => {
							await queryClient.invalidateQueries({
								queryKey: orpc.applicationRouter.getApplications.key(),
							});
							setOpen(false);
							form.reset();
						},
					},
				);
			} else {
				updateApplicationMutation.mutate(
					{
						id: application.id,
						companyName: company,
						positionId: role,
						postUrl: jobLink ?? undefined,
						submittedAt,
					},
					{
						onSuccess: async () => {
							await queryClient.invalidateQueries({
								queryKey: orpc.applicationRouter.getApplications.key(),
							});
							setOpen(false);
							form.reset();
						},
					},
				);
			}
		},
	});

	const setPosition = (positionId: string) => {
		form.setFieldValue("role", positionId);
	};

	return (
		<>
			<Dialog open={open} onOpenChange={setOpen}>
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
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
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
												<div className="flex gap-1">
													<Select
														value={field.state.value}
														onValueChange={(value) => field.handleChange(value)}
													>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Select a role" />
														</SelectTrigger>
														<SelectContent>
															{availablePositions?.data.map((position) => (
																<SelectItem
																	value={position.id}
																	key={position.id}
																>
																	{position.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<Button
														type="button"
														onClick={() => setCreateRoleOpen(true)}
													>
														<Plus />
													</Button>
												</div>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>
							</FieldGroup>
							<FieldGroup>
								<form.Field
									name="jobLink"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Job Link</FieldLabel>
												<Input
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={field.handleBlur}
													placeholder="Job link"
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>
							</FieldGroup>
							<FieldGroup>
								<form.Field
									name="submittedAt"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Submitted At
												</FieldLabel>
												<Popover open={dateOpen} onOpenChange={setDateOpen}>
													<PopoverTrigger asChild>
														<Button variant="outline">
															{field.state.value
																? field.state.value.toLocaleDateString()
																: "Select Date"}
															<ChevronDownIcon />
														</Button>
													</PopoverTrigger>
													<PopoverContent className="w-auto overflow-hidden p-0">
														<Calendar
															mode="single"
															selected={field.state.value}
															captionLayout="dropdown"
															onSelect={(date) => {
																field.handleChange(date ?? new Date());
																setDateOpen(false);
															}}
														/>
													</PopoverContent>
												</Popover>
											</Field>
										);
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
			<AddPositionDialog
				open={createRoleOpen}
				setOpen={setCreateRoleOpen}
				setPositionValue={setPosition}
			/>
		</>
	);
};
