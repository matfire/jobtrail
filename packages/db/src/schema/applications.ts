import { VALID_KAMBAN_TABLES } from "@jobtrail/common";
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { position } from "./position";

export const applicationStatusEnum = pgEnum(
	"applicationStatus",
	VALID_KAMBAN_TABLES,
);

export const application = pgTable("application", {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	companyName: text().notNull(),
	postUrl: text(),
	userId: text().references(() => user.id, { onDelete: "cascade" }),
	status: applicationStatusEnum()
		.notNull()
		.default(VALID_KAMBAN_TABLES.APPLIED),
	positionId: text().references(() => position.id),
	submittedAt: timestamp("submitted_at").defaultNow().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
