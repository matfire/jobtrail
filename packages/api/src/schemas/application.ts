import { VALID_KAMBAN_TABLES } from "@jobtrail/common";
import z from "zod";

export const ApplicationSchema = z.object({
	id: z.string(),
	companyName: z.string(),
	postUrl: z.string().nullable(),
	status: z.enum(VALID_KAMBAN_TABLES),
	positionId: z.string().nullable(),
	submittedAt: z.date(),
	updatedAt: z.date(),
});

export type Application = z.infer<typeof ApplicationSchema>;
