import type { Position } from "@jobtrail/api/schemas/position";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import z from "zod";
import { orpc } from "@/utils/orpc";
import { Button } from "./ui/button";
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

interface PositionDialogProps {
	open: boolean;
	setOpen: (v: boolean) => void;
	setPositionValue?: (v: string) => void;
	position?: Position;
}

const formSchema = z.object({
	name: z.string().nonempty(),
	color: z.string().nonempty(),
});

export const PositionDialog = ({
	open,
	setOpen,
	setPositionValue,
	position,
}: PositionDialogProps) => {
	const [loading, setLoading] = useState(false);
	const createPositionMutation = useMutation(
		orpc.positionRouter.createPosition.mutationOptions(),
	);
	const updatePositionMutation = useMutation(
		orpc.positionRouter.updatePosition.mutationOptions(),
	);

	const queryClient = useQueryClient();
	const form = useForm({
		validators: {
			onChange: formSchema,
			onSubmit: formSchema,
		},
		defaultValues: {
			name: position?.name ?? "",
			color: position?.color ?? "",
		},
		onSubmit: ({ value }) => {
			setLoading(true);
			if (position) {
				updatePositionMutation.mutate(
					{
						...value,
						id: position.id,
					},
					{
						onSuccess: async () => {
							await queryClient.refetchQueries({
								queryKey: orpc.positionRouter.getAvailablePositions.key(),
							});
							setLoading(false);
							form.reset();
							setOpen(false);
						},
					},
				);
			} else {
				createPositionMutation.mutate(
					{
						...value,
					},
					{
						onSuccess: async (value) => {
							await queryClient.refetchQueries({
								queryKey: orpc.positionRouter.getAvailablePositions.key(),
							});
							setLoading(false);
							setPositionValue?.(value.id);
							form.reset();
							setOpen(false);
						},
					},
				);
			}
		},
	});
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{position ? "Update" : "Create"} Role</DialogTitle>
					<DialogDescription />
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="flex flex-col space-y-4"
				>
					<div className="flex flex-col space-y-4">
						<FieldGroup>
							<form.Field
								name="name"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>
												Position Name *
											</FieldLabel>
											<Input
												required
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
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
								name="color"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Color</FieldLabel>
											<Input
												required
												type="color"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</Field>
									);
								}}
							/>
						</FieldGroup>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button disabled={loading} variant="secondary">
								Close
							</Button>
						</DialogClose>
						<Button disabled={loading} type="submit">
							{position ? "Update" : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
