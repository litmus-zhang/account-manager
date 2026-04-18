import { describe, expect, it } from "bun:test"
import * as pactum from "pactum"
import { CreateUserAndVerify, userAuthPayload } from "./helpers/payload"

describe("Auth Suite", () => {
  const credentials = userAuthPayload
  describe("Auth Validation", () => {
    describe("Sign-Up Validation", () => {
      it.each([
        ["missing email", { ...credentials, email: "" }, 400],
        ["invalid email format", { ...credentials, email: "invalid" }, 400],
        ["missing password", { ...credentials, password: "" }, 400],
        ["weak password", { ...credentials, password: "weak" }, 400],
      ])("POST /sign-up/email - %s", async (_, payload, expected) => {
        await pactum
          .spec()
          .post("/auth/sign-up/email")
          .withJson(payload)
          .expectStatus(expected)
      })
    })
    describe("auth - Sign-In Validation", () => {
      it.each([
        ["missing email", { email: "", password: credentials.password }, 400],
        [
          "invalid email format",
          { email: "invalid", password: credentials.password },
          400,
        ],
        ["missing password", { email: credentials.email, password: "" }, 401],
        [
          "wrong password",
          { email: credentials.email, password: "incorrectPass123" },
          401,
        ],
      ])("POST /sign-in/email - %s", async (_, body, expected) => {
        await pactum
          .spec()
          .post("/auth/sign-in/email")
          .withJson(body)
          .expectStatus(expected)
      })
    })
  })
  it("create user and verify", async () => {
    await CreateUserAndVerify(credentials)
  })
})
