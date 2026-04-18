import { bearer } from "@elysiajs/bearer"
import { cors } from "@elysiajs/cors"
import { serverTiming } from "@elysiajs/server-timing"
import { Elysia } from "elysia"
import { autoload } from "elysia-autoload"
import { openapi } from '@elysiajs/openapi'
import { OpenAPI, auth } from './auth.ts'
import { healthcheckPlugin } from "elysia-healthcheck"
import { Logestic } from "logestic"
import { join } from "node:path"



export const app = new Elysia()
  .use(bearer())
  .use(cors())
  .use(serverTiming())
  .use(Logestic.preset("common"))
  .use(
    await autoload({
      dir: join(import.meta.dir, "routes"),
    }),
  )
  .mount(auth.handler)
  .use(
    healthcheckPlugin({
      prefix: "/health",
    }),
  )
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
        info: {
          title: "Account Manager API",
          version: "v1.0.0",
        },
      }
    })
  )
  .get("/", "Hello World")

export type ElysiaApp = typeof app


