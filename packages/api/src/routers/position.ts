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

const createPositionInput = z.object({
	name: z.string(),
	color: z.hex()
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

export { getAvailablePositions, createPosition };
