import { pgTable, text } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const position = pgTable("position", {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text().notNull(),
	userId: text()
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	color: text().notNull(),
});
