import { describe, expect, it } from "bun:test"
import * as pactum from "pactum"
import { faker } from "@faker-js/faker"
import { assetPayload } from "../helpers/payload"

describe("Asset Management", () => {

  it("Create a new asset", async () => {

    await pactum.spec()
      .post("/assets/new")
      .withBearerToken("$S{authToken}")
      .withBody(assetPayload)
      .stores("assetId", "data.id")
      .expectStatus(201)
      .expectJsonMatch({
        success: true,
        data: {
          name: assetPayload.name,
          type: assetPayload.type,
          currency: assetPayload.currency,
          amount: assetPayload.amount,
          description: assetPayload.description,
        },
      })
      .inspect()
  })
  it("Update an asset", async () => {
    await pactum.spec()
      .put("/assets/$S{assetId}")
      .withBearerToken("$S{authToken}")
      .withBody(assetPayload)
      .expectStatus(200)
      .expectJsonMatch({
        data: {
          name: assetPayload.name,
          type: assetPayload.type,
          currency: assetPayload.currency,
          amount: assetPayload.amount,
          description: assetPayload.description,
        },
      })
      .inspect()
  })
  it("Get all assets", async () => {
    await pactum.spec()
      .get("/assets")
      .withBearerToken("$S{authToken}")
      .expectStatus(200)
      .inspect()
  })
  it("Delete an asset", async () => {
    await pactum.spec()
      .delete("/assets/$S{assetId}")
      .withBearerToken("$S{authToken}")
      .expectStatus(200)
      .inspect()
  })


})  
