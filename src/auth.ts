import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/index.ts"; // your drizzle instance
import { bearer, openAPI } from "better-auth/plugins";
import { Elysia } from "elysia";
import * as schema from "./db/schema.ts"


let capturedToken = ""


export const auth = betterAuth({
    //...x
    database: drizzleAdapter(db, {
        provider: "sqlite", // or "mysql", "sqlite","pg"
        schema,
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    basePath: "/auth",
    baseURL: "http://localhost:3000",
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url, token }) => {
            console.log(user, url)
            capturedToken = token
            console.log("Verification token:", token)
        }
    },
    // baseURL: {
    //     allowedHosts: [
    //         "localhost:*",
    //         "127.0.0.1:*",
    //         "engagelagos.com",
    //         "api.engagelagos.com",
    //         "www.api.engagelagos.com",
    //         "*.engagelagos.com",
    //     ],
    //     protocol: process.env.NODE_ENV === "production" ? "https" : "http",
    // },

    trustedOrigins: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    plugins: [openAPI(), bearer(),
    ]
});


export { capturedToken }



const getSchema = async () => auth.api.generateOpenAPISchema()

export const OpenAPI = {
    getPaths: (prefix = "/auth") =>
        getSchema().then(({ paths }) => {
            const reference: typeof paths = Object.create(null)

            for (const path of Object.keys(paths)) {
                const key = prefix + path
                const original = paths[path]!
                reference[key] = original

                for (const method of Object.keys(original)) {
                    const operation = (reference[key] as any)[method]

                    operation.tags = ["Better Auth"]
                }
            }

            return reference
        }) as Promise<any>,
    components: getSchema().then(({ components }) => components) as Promise<any>,
} as const

export const authGuard = new Elysia({ name: "authGuard" })
    .macro({
        auth: {
            // You can use this in route definitions for strong typing
            async resolve({ request, set }) {
                // Verify the session from cookies or Authorization header
                const session = await auth.api.getSession({
                    headers: request.headers,
                })

                if (!session) {
                    set.status = 401
                    throw new Error("Unauthorized")
                }

                // Expose user and session to the route context
                return {
                    user: session.user,
                    session: session.session,
                }
            },
        },
    })
    .derive(async ({ request }) => {
        // Auto-inject user/session in the request lifecycle
        const session = await auth.api.getSession({ headers: request.headers })
        if (session)
            return { user: session.user, session: session.session, role: (session.user as any)?.role || "user" }

        // Optionally, leave undefined if not logged in
        return { user: null, session: null, role: null }
    })