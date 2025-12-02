import z from "zod";

export const PositionSchema = z.object({
	id: z.string(),
	name: z.string(),
	color: z.string(),
});

export type Position = z.infer<typeof PositionSchema>;
