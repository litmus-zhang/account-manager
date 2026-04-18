import { join } from "node:path"
import { mock } from "bun:test"
import { drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"
import { createClient } from "@libsql/client"
import redis from "ioredis"

console.time("LibSQL init")

const client = createClient({ url: ":memory:" })
const db = drizzle(client)

mock.module("@libsql/client", () => ({
  createClient: () => client,
}))

mock.module("drizzle-orm/libsql", () => ({ 
  drizzle: () => db 
}))

mock.module("resend", () => ({
  Resend: class {
    emails = {
      send: () => Promise.resolve({ success: true, data: { id: "mocked resend" } }),
    }
  },
}))

mock.module("ioredis", () => ({ Redis: redis, default: redis }))

await migrate(db, {
  migrationsFolder: join(import.meta.dirname, "..", "drizzle"),
})

console.timeEnd("LibSQL init")
