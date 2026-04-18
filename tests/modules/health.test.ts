import { describe, it } from "bun:test"
import * as pactum from "pactum"

describe("General Health Check", () => {
  it("GET /health - should return healthy", async () => {
    await pactum.spec().get("/health").expectStatus(200).expectJsonLike({
      healthy: true,
      uptime: /\d+/,
    })
  })

  it("GET /openapi - should return OpenAPI documentation", async () => {
    await pactum
      .spec()
      .get("/openapi")
      .expectStatus(200)
      .expectBodyContains("Account Manager API")
  })


})
