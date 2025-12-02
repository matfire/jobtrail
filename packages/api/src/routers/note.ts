import { db } from "@jobtrail/db";
import { note } from "@jobtrail/db/schema/notes";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { protectedProcedure } from "..";
import { NoteSchema } from "../schemas/note";

const getNotesInputSchema = z.object({
	applicationId: z.string(),
});

const getNotesOutputSchema = z.object({
	data: z.array(NoteSchema),
});

const getNotes = protectedProcedure
	.input(getNotesInputSchema)
	.output(getNotesOutputSchema)
	.handler(async ({ context, input }) => {
		//TODO check user has right to access application
		const data = await db
			.select()
			.from(note)
			.where(eq(note.applicationId, input.applicationId));
		return {
			data,
		};
	});

const createNoteInputSchema = z.object({
	applicationId: z.string(),
	content: z.string(),
});

const createNote = protectedProcedure
	.input(createNoteInputSchema)
	.output(NoteSchema)
	.handler(async ({ context, input }) => {
		//TODO check user can create note
		const data = (await db.insert(note).values(input).returning()).at(0);

		if (!data) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "could not create note",
			});
		}
		return data;
	});

const deleteNoteInputSchema = z.object({
	id: z.string(),
});

const deleteNoteOutputSchema = z.object({
	id: z.string(),
});

const deleteNote = protectedProcedure
	.input(deleteNoteInputSchema)
	.output(deleteNoteOutputSchema)
	.handler(async ({ context, input }) => {
		//TODO check user can delete note
		const { id } = input;
		const deletedNote = (
			await db.delete(note).where(eq(note.id, id)).returning()
		).at(0);
		if (!deletedNote) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Could not delete record",
			});
		}
		return { id: deletedNote.id };
	});

export { getNotes, createNote, deleteNote };
