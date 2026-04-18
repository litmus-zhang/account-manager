import { afterAll, beforeAll, describe } from "bun:test"
import { clearDb } from "../src/db"
import { createTestServer } from "./helpers/setup"




let shutdown: () => Promise<void> = async () => {}

// let restateTestEnvironment: RestateTestEnvironment;
// let restateIngress: clients.Ingress;

beforeAll(async () => {
  console.log("[global] Starting test server…")
  shutdown = (await createTestServer()).shutdown


  // restateTestEnvironment = await RestateTestEnvironment.start({
  //   services: [onboardingSaga],
  //   logger: console.log,
  //   defaultServiceOptions: {

  //   }
  // });
  // restateIngress = clients.connect({ 
  //   url: restateTestEnvironment.baseUrl(),

  // });

});

afterAll(async () => {
  // if (restateTestEnvironment !== undefined) {
  //   await restateTestEnvironment.stop();
  // }
  console.log("[global] Cleaning DB…")
  await clearDb()

  console.log("[global] Stopping test server…")
  await shutdown()

});

