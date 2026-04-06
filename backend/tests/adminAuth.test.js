const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../app");
const {
  createAdminToken,
  safeCompare,
  verifyAdminToken,
} = require("../utils/adminAuth");

test("safeCompare returns false for different lengths", () => {
  assert.equal(safeCompare("short", "longer"), false);
});

test("admin token can be created and verified", () => {
  const token = createAdminToken();
  const payload = verifyAdminToken(token);

  assert.equal(payload.role, "admin");
  assert.equal(typeof payload.exp, "number");
});

test("admin login returns a token and session validates it", async () => {
  const loginResponse = await request(app)
    .post("/api/admin/login")
    .send({ password: process.env.ADMIN_PASSWORD || "change-me" });
  assert.equal(loginResponse.status, 200);
  assert.equal(typeof loginResponse.body.token, "string");

  const sessionResponse = await request(app)
    .get("/api/admin/session")
    .set("Authorization", `Bearer ${loginResponse.body.token}`);
  assert.equal(sessionResponse.status, 200);
  assert.equal(sessionResponse.body.authenticated, true);
});

test("inventory mutations require admin auth", async () => {
  const response = await request(app).post("/api/laptops");
  assert.equal(response.status, 401);
  assert.equal(response.body.error, "Admin authentication required");
});
