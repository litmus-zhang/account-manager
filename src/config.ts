import env from "env-var"

export const config = {
  NODE_ENV: env
    .get("NODE_ENV")
    .default("development")
    .asEnum(["production", "test", "development"]),

  PORT: env.get("PORT").default(3000).asPortNumber(),
  API_URL: env.get("API_URL").default(`https://${env.get("PUBLIC_DOMAIN").asString()}`).asString(),
  DATABASE_URL: env.get("DATABASE_URL").default("file:./dev.db").asString(),
  LOCK_STORE: env.get("LOCK_STORE").default("memory").asEnum(["memory"]),
  BETTER_AUTH_URL: env.get("BETTER_AUTH_URL").default("http://localhost:3000").asString(),
}


// export const transaction = sqliteTable(
//   "transaction",
//   {
//     id: text("id").primaryKey().$defaultFn(() => createId()),
//     userId: text("user_id")
//       .notNull()
//       .references(() => user.id, { onDelete: "cascade" }),
//     type: text("type").notNull(),
//     amount: text("amount").notNull(),
//     currency: text("currency").notNull(),
//     status: text("status").notNull(),
//     description: text("description").notNull(),
//     createdAt: timestamp("created_at").defaultNow().notNull(),
//     updatedAt: timestamp("updated_at")
//       .$onUpdate(() => /* @__PURE__ */ new Date())
//       .notNull(),
//   },
//   (table) => [index("transaction_userId_idx").on(table.userId)],
// );
// export const assets = sqliteTable(
//   "asset",
//   {
//     id: text("id").primaryKey().$defaultFn(() => createId()),
//     name: text("name").notNull(),
//     type: text("type").notNull(),
//     amount: text("amount").notNull(),
//     currency: text("currency").notNull(),
//     description: text("description"),
//     userId: text("user_id")
//       .notNull()
//       .references(() => user.id, { onDelete: "cascade" }),
//     createdAt: timestamp("created_at").defaultNow().notNull(),
//     updatedAt: timestamp("updated_at")
//       .$onUpdate(() => /* @__PURE__ */ new Date())
//       .notNull(),
//   },
//   (table) => [index("asset_userId_idx").on(table.userId)]
// );