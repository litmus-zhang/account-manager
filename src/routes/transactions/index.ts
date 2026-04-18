import { Elysia, t } from "elysia";
import { models } from "../../db/models.ts"
import { authGuard } from "../../auth.ts";
import { deleteOne, getOneByID, getTransactions, insertOne, PAGE_SIZE, updateOne } from "../../db/index.ts";


const { transaction: transactionInsert } = models.insert

const transactions = new Elysia({
    tags: ["Transactions"]
})
    .model({
        Post: t.Object(transactionInsert as any),
    })
    .guard({
        detail: {
            description: "Require user to be logged in",
        },
    })
    .use(authGuard)
    .get("", ({ query: { page, pageSize }, user: { id: userId } }: { query: { page?: number, pageSize?: number }, user: { id: string } }) =>
        getTransactions(userId, page, pageSize), {
        auth: true,
        query: t.Object({
            page: t.Optional(t.Number()),
            pageSize: t.Optional(t.Number({ default: PAGE_SIZE })),
        }),
    })
    .post("/new", ({ body, set, user }: { body: any, set: any, user: any }) => {
        set.status = 201
        return insertOne("transaction", { ...body, userId: user.id })
    }, {
        auth: true,
        body: t.Object(transactionInsert as any),
    })
    .get("/:id", ({ params: { id } }: { params: { id: string } }) => {
        getOneByID("transaction", id)
    }, {
        auth: true,
    })
    .put("/:id", ({ params: { id }, body }: { params: { id: string }, body: any }) => updateOne("transaction", id, body)
        , {
            auth: true,
            body: t.Object(transactionInsert as any),
        })
    .delete("/:id", ({ params: { id } }: { params: { id: string } }) => {
        deleteOne("transaction", id)
    }, {
        auth: true,
    })


export default transactions