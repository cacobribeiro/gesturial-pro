import request from "supertest";
import app from "../src/app.js";

describe("GET /health", () => {
  it("returns ok", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
