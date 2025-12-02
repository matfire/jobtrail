import z from "zod";

export const NoteSchema = z.object({
	id: z.string(),
	content: z.string(),
});

export type Note = z.Infer<typeof NoteSchema>;
