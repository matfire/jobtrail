import { VALID_KAMBAN_TABLES } from "@jobtrail/common";
import { db } from "@jobtrail/db";
import { application } from "@jobtrail/db/schema/applications";
import { position } from "@jobtrail/db/schema/position";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { protectedProcedure } from "..";
import { ApplicationSchema } from "../schemas/application";
import { ApplicationWithPositionSchema } from "../schemas/combi";

const getApplicationsOutputSchema = z.object({
	data: z.array(ApplicationWithPositionSchema),
});

const getApplications = protectedProcedure
	.output(getApplicationsOutputSchema)
	.handler(async ({ context }) => {
		const data = await db
			.select()
			.from(application)
			.where(eq(application.userId, context.session.user.id))
			.leftJoin(position, eq(position.id, application.positionId));
		return { data };
	});

const createApplicationInputSchema = z.object({
	companyName: z.string(),
	postUrl: z.string().optional(),
	positionId: z.string().optional(),
	submittedAt: z.date().optional(),
});

const createApplication = protectedProcedure
	.input(createApplicationInputSchema)
	.output(ApplicationSchema)
	.handler(async ({ context, input }) => {
		const { companyName, postUrl, positionId, submittedAt } = input;
		const newApplication = (
			await db
				.insert(application)
				.values({
					userId: context.session.user.id,
					companyName,
					postUrl,
					positionId,
					submittedAt,
				})
				.returning()
		).at(0);
		if (!newApplication) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Could not create record",
			});
		}
		return newApplication;
	});

const updateApplicationInputSchema = z.object({
	id: z.string(),
	companyName: z.string().optional(),
	postUrl: z.string().optional(),
	status: z.enum(VALID_KAMBAN_TABLES).optional(),
	positionId: z.string().optional(),
	submittedAt: z.date().optional(),
});

const updateApplication = protectedProcedure
	.input(updateApplicationInputSchema)
	.output(ApplicationSchema)
	.handler(async ({ context, input }) => {
		const { id, companyName, postUrl, status, submittedAt, positionId } = input;
		//TODO check if user is owner of application
		const updatedApplication = (
			await db
				.update(application)
				.set({
					companyName,
					postUrl,
					status,
					submittedAt,
					positionId,
				})
				.where(eq(application.id, id))
				.returning()
		).at(0);
		if (!updatedApplication) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Could not update record",
			});
		}
		return updatedApplication;
	});

const deleteApplicationInputSchema = z.object({
	id: z.string(),
});

const deleteApplicationOutputSchema = z.object({
	id: z.string(),
});

const deleteApplication = protectedProcedure
	.input(deleteApplicationInputSchema)
	.output(deleteApplicationOutputSchema)
	.handler(async ({ context, input }) => {
		const { id } = input;
		//TODO check if user is owner of application
		const deletedApplication = (
			await db.delete(application).where(eq(application.id, id)).returning()
		).at(0);
		if (!deletedApplication) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Could not delete record",
			});
		}
		return { id: deletedApplication.id };
	});

export {
	createApplication,
	getApplications,
	updateApplication,
	deleteApplication,
};
