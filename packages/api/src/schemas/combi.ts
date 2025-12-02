import z from "zod";
import { ApplicationSchema } from "./application";
import { PositionSchema } from "./position";

export const ApplicationWithPositionSchema = z.object({
	application: ApplicationSchema,
	position: PositionSchema.nullish(),
});

export type ApplicationWithPosition = z.infer<
	typeof ApplicationWithPositionSchema
>;
