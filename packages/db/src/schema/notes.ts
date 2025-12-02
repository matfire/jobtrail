import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { application } from "./applications";

export const note = pgTable("note", {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	content: text().notNull(),
	applicationId: text().references(() => application.id, {
		onDelete: "cascade",
	}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
