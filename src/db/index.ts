// import { drizzle } from "drizzle-orm/postgres-js"
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
// import postgres from "postgres"
import { config } from "../config.ts"
import * as schema from "./schema.ts"
import { and, desc, eq, SQLWrapper, sql } from "drizzle-orm"
import { reset, seed } from "drizzle-seed"
import { NotFoundError } from "elysia"

type TableName = keyof typeof schema

export const PAGE_SIZE = 10



const client = createClient({ url: config.DATABASE_URL });
export const db = drizzle(client, {
  casing: "snake_case",
  schema,
})

export async function updateUserRole(userId: string, role: string = "admin") {
  return db.update(schema.user)
    .set({ role: role ?? "admin" })
    .where(eq(schema.user.id, userId))
    .returning()
}



export async function clearDb() {
  await reset(db as any, schema)
}
export async function seedDb() {
  await seed(db as any, schema, {
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
      data: (res as any)[0],
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
      data: (res as any)[0],
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
      data: (res as any)[0],
    }
  }
  catch (error) {
    console.log({ error })
    throw new Error(`Failed to delete ${table}`, { cause: error })
  }
}

export async function getAssets(userId: string, page = 1, pageSize = PAGE_SIZE) {
  try {
    const data = await db
      .select()
      .from(schema.assets)
      .where(eq(schema.assets.userId, userId))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(desc(schema.assets.createdAt))

    const countRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.assets)
      .where(eq(schema.assets.userId, userId))

    const total = countRes[0]?.count ?? 0

    return {
      message: `Successfully retrieved all assets`,
      data,
      meta: getPaginatedMeta(page, pageSize, total),
    }
  } catch (error) {
    throw new Error("Failed to retrieve assets", { cause: error })
  }
}

export async function getTransactions(userId: string, page = 1, pageSize = PAGE_SIZE) {
  try {
    const data = await db
      .select()
      .from(schema.transaction)
      .where(eq(schema.transaction.userId, userId))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(desc(schema.transaction.createdAt))

    const countRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.transaction)
      .where(eq(schema.transaction.userId, userId))

    const total = countRes[0]?.count ?? 0

    return {
      message: `Successfully retrieved all transactions`,
      data,
      meta: getPaginatedMeta(page, pageSize, total),
    }
  } catch (error) {
    throw new Error("Failed to retrieve transactions", { cause: error })
  }
}
