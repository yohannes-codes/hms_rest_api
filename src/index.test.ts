import request from "supertest";
import { app, destroyServer } from ".";

const baseRoute = "";

describe("CORE functions inside core & miscellaneous tests", () => {
  it("should send successful response", async () => {
    const response = await request(app).post(baseRoute);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
  });

  it("should send 500 internal server error response for an error", async () => {
    const response = await request(app).get(
      `${baseRoute}/api/v1/onlyForTheSakeOfTesting`
    );

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("success", false);
  });
});

afterAll(async () => destroyServer());
