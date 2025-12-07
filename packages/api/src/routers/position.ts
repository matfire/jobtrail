import { db } from "@jobtrail/db";
import { position } from "@jobtrail/db/schema/position";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import generateRandomColor from "generate-random-color";
import z from "zod";
import { protectedProcedure } from "..";
import { PositionSchema } from "../schemas/position";

const getAvailablePositionsOutput = z.object({
	data: z.array(PositionSchema),
});

const getAvailablePositions = protectedProcedure
	.output(getAvailablePositionsOutput)
	.handler(async ({ context }) => {
		const data = await db
			.select()
			.from(position)
			.where(eq(position.userId, context.session.user.id));

		return { data };
	});

const updatePositionInput = z.object({
	id: z.string(),
	name: z.string().optional(),
	color: z.string().optional(),
});

const updatePosition = protectedProcedure
	.input(updatePositionInput)
	.output(PositionSchema)
	.handler(async ({ input, context }) => {
		// TODO check user permissions

		const { name, color, id } = input;
		const updated = (
			await db
				.update(position)
				.set({
					name,
					color,
				})
				.where(eq(position.id, id))
				.returning()
		).at(0);
		if (!updated) {
			throw new ORPCError(
				"INTERNAL_SERVER_ERROR",
				"Could not update application",
			);
		}
		return updated;
	});

const createPositionInput = z.object({
	name: z.string(),
});

const createPositionOutput = z.object({
	id: z.string(),
	name: z.string(),
	color: z.string(),
});

const createPosition = protectedProcedure
	.input(createPositionInput)
	.output(createPositionOutput)
	.handler(async ({ input, context }) => {
		const data = (
			await db
				.insert(position)
				.values({
					userId: context.session.user.id,
					...input,
					color: generateRandomColor.hex(),
				})
				.returning()
		).at(0);
		if (!data) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to create position",
			});
		}
		return data;
	});

const deletePositionInput = z.object({
	id: z.string(),
});

const deletePositionOutput = z.object({
	id: z.string(),
});

const deletePosition = protectedProcedure
	.input(deletePositionInput)
	.output(deletePositionOutput)
	.handler(async ({ context, input }) => {
		const { id } = input;
		//TODO check if user is owner of application
		const deletedPosition = (
			await db.delete(position).where(eq(position.id, id)).returning()
		).at(0);
		if (!deletedPosition) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Could not delete record",
			});
		}
		return { id: deletedPosition.id };
	});

export {
	getAvailablePositions,
	createPosition,
	updatePosition,
	deletePosition,
};
