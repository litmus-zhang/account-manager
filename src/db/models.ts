import { createInsertSchema } from 'drizzle-typebox'
import { table, verification } from './schema.ts'
import { spreads } from './utils.ts'

export const models = {
	insert: spreads({
		user: table.user,
		session: table.session,
		account: table.account,
		verification: table.verification,
		assets: createInsertSchema(table.assets),
		transaction: createInsertSchema(table.transaction),
	}, 'insert'),
	select: spreads({
		user: table.user,
		session: table.session,
		account: table.account,
		verification: table.verification,
		assets: table.assets,
		transaction: table.transaction,
	}, 'select')
} as const