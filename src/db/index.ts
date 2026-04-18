import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { config } from "../config.ts"
import * as schema from "./schema.ts"
import { and, desc, eq, SQLWrapper } from "drizzle-orm"
import { reset, seed } from "drizzle-seed"
import { NotFoundError } from "elysia"

type TableName = keyof typeof schema

export const PAGE_SIZE = 10



const client = postgres(config.DATABASE_URL)
export const db = drizzle({
  client,
  casing: "snake_case",
  schema,
})

export async function updateUserRole(userId: string, role: string = "admin") {
  return db.update(schema.user)
    .set({ role })
    .where(eq(schema.user.id, userId))
    .returning()
}



export async function clearDb() {
  await reset(db, schema)
}
export async function seedDb() {
  await seed(db, schema, {
    count: 100,
  })
}

function getPaginatedMeta(page: number, pageSize: number, total: number) {
  return {
    page,
    total,
    prev: page > 1 ? page - 1 : 1,
    next: total === pageSize ? page + 1 : page,
    pageSize,
  }
}
export async function insertOne<T extends TableName>(
  table: T,
  body: any,
) {
  try {
    const tableRef = schema[table] as unknown as SQLWrapper
    const res = await db.insert(tableRef as any).values(body).returning()
    // console.log({ body })
    return {
      success: true,
      message: `Successfully created a ${table}`,
      data: res[0],
    }
  }
  catch (error) {
    console.log({ error })
    throw new Error(`Failed to insert ${table}`, { cause: error })
  }
}
export async function updateOne<T extends TableName>(
  table: T,
  id: string,
  body: any,
) {
  try {
    const tableRef = schema[table] as unknown as SQLWrapper
    const res = await db
      .update(tableRef as any)
      .set(body)
      .where(eq((tableRef as any).id, id))
      .returning()
    return {
      message: `Successfully updated a ${table}`,
      data: res[0],
    }
  }
  catch (error) {
    console.log({ error })
    throw new Error(`Failed to update ${table}`, { cause: error })
  }
}

export async function getOneByID<T extends TableName>(
  table: T,
  id: string,
  // opts?: { includeRelations?: boolean },
) {
  try {
    const tableRef = schema[table] as any

    let row: any = null
    const res = await db
      .select()
      .from(tableRef)
      .where(eq(tableRef.id, id))
      .limit(1)

    row = res[0]

    if (!row)
      throw new NotFoundError(`Failed to find ${table} with id ${id}`)

    return {
      message: `Successfully retrieved ${table}`,
      data: row,
    }
  }
  catch (error) {
    if (error instanceof NotFoundError)
      throw error
    throw new Error(`Failed to find ${table}`, { cause: error })
  }
}

export async function deleteOne<T extends TableName>(
  table: T,
  id: string,
) {
  try {
    const tableRef = schema[table] as unknown as SQLWrapper
    const res = await db
      .delete(tableRef as any)
      .where(eq((tableRef as any).id, id))
      .returning()
    return {
      message: `Successfully deleted a ${table}`,
      data: res[0],
    }
  }
  catch (error) {
    console.log({ error })
    throw new Error(`Failed to delete ${table}`, { cause: error })
  }
}

export async function getAssets(userId: string, page = 1, pageSize = PAGE_SIZE) {
  const data = await db.query.assets.findMany({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    with: {
      // post_media: true,
      // user: true,
    },
    orderBy: [desc(schema.assets.createdAt)],
    where: and(eq(schema.assets.userId, userId)),
  })
  const total = await db.$count(
    schema.assets,
    and(eq(schema.assets.userId, userId)),
  )

  return {
    message: `Successfully retrieved all posts`,
    data,
    meta: getPaginatedMeta(page, pageSize, total),
  }
}

export async function getTransactions(userId: string, page = 1, pageSize = PAGE_SIZE) {
  const data = await db.query.transaction.findMany({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: [desc(schema.transaction.createdAt)],
    where: and(eq(schema.transaction.userId, userId)),
  })
  const total = await db.$count(
    schema.transaction,
    and(eq(schema.transaction.userId, userId)),
  )

  return {
    message: `Successfully retrieved all transactions`,
    data,
    meta: getPaginatedMeta(page, pageSize, total),
  }
}
