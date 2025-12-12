import { db } from "@jobtrail/db";
import { application } from "@jobtrail/db/schema/applications";
import { note } from "@jobtrail/db/schema/notes";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { protectedProcedure } from "..";
import { NoteSchema } from "../schemas/note";

const checkPermission = async (userId: string, noteId: string) => {
	const data = (await db.select().from(note).where(eq(note.id, noteId))).at(0);
	if (!data || !data.applicationId) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Could not delete position",
		});
	}
	const applicationData = (
		await db
			.select()
			.from(application)
			.where(eq(application.id, data.applicationId))
	).at(0);
	if (!applicationData || applicationData.userId !== userId) {
		throw new ORPCError("UNAUTHORIZED", {
			message: "Could not delete position",
		});
	}
};

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
		const applicationData = (
			await db
				.select()
				.from(application)
				.where(eq(application.id, input.applicationId))
		).at(0);
		if (!applicationData) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Could not retrieve notes",
			});
		}
		if (applicationData.userId !== context.session.user.id) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "Could not retrieve notes",
			});
		}
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
		const applicationData = (
			await db
				.select()
				.from(application)
				.where(eq(application.id, input.applicationId))
		).at(0);
		if (!applicationData) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Could not create note",
			});
		}
		if (applicationData.userId !== context.session.user.id) {
			throw new ORPCError("UNAUTHORIZED", { message: "Could not create note" });
		}
		const data = (await db.insert(note).values(input).returning()).at(0);

		if (!data) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Could not create note",
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
		const { id } = input;
		await checkPermission(context.session.user.id, id);
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
