import { faker } from "@faker-js/faker"
import { describe, it } from "bun:test"
import * as pactum from "pactum"
import { capturedToken } from "../../src/auth"
import { updateUserRole } from "../../src/db"

const userAuthPayload = {
  email: faker.internet.email(),
  password: faker.internet.password({ length: 12 }),
  // phoneNumber: faker.phone.number({
  //   "style": "international"
  // }),
  name: faker.internet.username(),
}

export const assetPayload = {
  name: faker.commerce.productName(),
  userId: "$S{userId}",
  type: faker.helpers.arrayElement(["cash", "bank", "investment", "loan", "other"]),
  currency: faker.finance.currencyCode(),
  amount: faker.finance.amount(),
  description: faker.lorem.sentence(),
}
export const transactionPayload = {
  name: faker.commerce.productName(),
  userId: "$S{userId}",
  type: faker.helpers.arrayElement(["cash", "bank", "investment", "loan", "other"]),
  currency: faker.finance.currencyCode(),
  amount: faker.finance.amount(),
  description: faker.lorem.sentence(),
  status: faker.helpers.arrayElement(["processed", "pending", "failed"]),

}

const organizationPayload = {
  name: faker.company.name(),
  slug: faker.lorem.slug(),
  userId: "$S{userId}",

}

const teamPayload = {
  name: `${faker.location.city()} Team`,
  organizationId: "$S{orgId}",
}

const credentialsPayload = {
  nin: faker.string.alphanumeric(11),
  vin: faker.string.alphanumeric(19),
  user_id: "$S{userId}",
}


export async function createCredentials(userId: string = "$S{userId}") {
  return {
    ...credentialsPayload,
    user_id: userId,
  }


}

export async function CreateUserAndVerify(credentials: typeof userAuthPayload = userAuthPayload) {
  await pactum
    .spec()
    .post("/auth/sign-up/email")
    .withJson(credentials)

  await pactum
    .spec()
    .post("/auth/sign-in/email")
    .withJson(credentials)
    .expectJsonLike({
      message: "Email not verified",
    })
    .expectStatus(403)

  await pactum
    .spec()
    .get("/auth/verify-email")
    .withQueryParams({
      token: capturedToken,
    })
    .expectStatus(200)

  const res = await pactum
    .spec()
    .post("/auth/sign-in/email")
    .withJson(credentials)
    .stores("authToken", "token")
    .stores("userId", "user.id")
    // .inspect()
    .expectStatus(200)
    .returns("res.body")
  return res
}


export async function CreateOrganization(payload: typeof organizationPayload = organizationPayload) {
  // const res = await CreateUserAndVerify({ ...userAuthPayload, email: "admin@test.com" })
  // const updatedUser = await updateUserRole(res.user.id)
  return await pactum
    .spec()
    .post("/auth/organization/create")
    .withBearerToken("$S{authToken}")
    .withJson({ ...payload })
    .expectStatus(200)
    .stores("orgId", "id")
    .inspect()
    .returns("res.body")
}
export async function CreateTeam(payload: typeof teamPayload = teamPayload) {
  return await pactum
    .spec()
    .post("/auth/organization/create-team")
    .withBearerToken("$S{authToken}")
    .withJson(payload)
    .expectStatus(200)
    .inspect()
    .stores("teamId", "id")
    .returns("res.body")
}

export async function createAdmin(email: string = "admin@test.com") {
  const res = await CreateUserAndVerify({ ...userAuthPayload, email })
  await updateUserRole(res.user.id)

  return res
}

export {
  organizationPayload,
  teamPayload,
  userAuthPayload,
  credentialsPayload,
}
