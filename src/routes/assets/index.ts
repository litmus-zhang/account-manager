import { Elysia, t } from "elysia";
import { models } from "../../db/models.ts"
import { authGuard } from "../../auth.ts";
import { deleteOne, insertOne, getOneByID, updateOne, PAGE_SIZE, getAssets } from "../../db/index.ts";


const { assets: assetInsert } = models.insert


const assets = new Elysia({
    tags: ["Assets"]
})
    .model({
        Post: t.Object(assetInsert as any),
    })
    .guard({
        detail: {
            description: "Require user to be logged in",
        },
    })
    .use(authGuard)

    .get("", ({ query: { page, pageSize }, user: { id: userId } }: { query: { page?: number, pageSize?: number }, user: { id: string } }) =>
        getAssets(userId, page, pageSize), {
        auth: true,
        query: t.Object({
            page: t.Optional(t.Number()),
            pageSize: t.Optional(t.Number({ default: PAGE_SIZE })),
        }),
    })
    .post("/new", ({ body, set, user }: { body: any, set: any, user: any }) => {
        set.status = 201
        return insertOne("assets", { ...body, userId: user.id })
    }, {
        auth: true,
        body: t.Object(assetInsert as any),
    })
    .get("/:id", ({ params: { id } }: { params: { id: string } }) => {
        getOneByID("assets", id)
    }, {
        auth: true,
    })
    .put("/:id", ({ params: { id }, body }: { params: { id: string }, body: any }) => updateOne("assets", id, body)
        , {
            auth: true,
            body: t.Object(assetInsert as any),
        })
    .delete("/:id", ({ params: { id } }: { params: { id: string } }) => {
        deleteOne("assets", id)
    }, {
        auth: true,
    })

export default assets