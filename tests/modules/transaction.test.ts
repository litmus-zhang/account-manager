import { describe, expect, it } from "bun:test"
import * as pactum from "pactum"
import { CreateUserAndVerify, transactionPayload, userAuthPayload } from "../helpers/payload"

describe("Transaction", () => {
  it("Create a new transaction", async () => {
    await pactum.spec()
      .post("/transactions/new")
      .withBearerToken("$S{authToken}")
      .withBody(transactionPayload)
      .stores("transactionId", "data.id")
      .expectStatus(201)
      .expectJsonMatch({
        success: true,
        data: {
          type: transactionPayload.type,
          currency: transactionPayload.currency,
          amount: transactionPayload.amount,
          description: transactionPayload.description,
          status: transactionPayload.status,
        },
      })
      .inspect()
  })
  it("Get all transactions", async () => {
    await pactum.spec()
      .get("/transactions")
      .withBearerToken("$S{authToken}")
      .expectStatus(200)
      .inspect()
  })
  it("Update an transaction", async () => {
    await pactum.spec()
      .put("/transactions/$S{transactionId}")
      .withBearerToken("$S{authToken}")
      .withBody(transactionPayload)
      .expectStatus(200)
      .inspect()
  })
  it("Delete an transaction", async () => {
    await pactum.spec()
      .delete("/transactions/$S{transactionId}")
      .withBearerToken("$S{authToken}")
      .expectStatus(200)
      .inspect()
  })
})
