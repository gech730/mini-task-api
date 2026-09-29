import test, { before } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import prisma from "../src/db.js";
import app from "../src/app.js";

before(async () => {
  await prisma.task.deleteMany();
});

test("GET /health returns database connected", async () => {
  const response = await request(app)
    .get("/health")
    .expect(200);

  assert.equal(response.body.status, "ok");
  assert.equal(response.body.database, "connected");
});

test("POST /tasks creates a task", async () => {
  const response = await request(app)
    .post("/tasks")
    .send({
      title: "Test task",
    })
    .expect(201);

  assert.equal(response.body.title, "Test task");
  assert.equal(response.body.completed, false);
});

test("GET /tasks returns tasks", async () => {
  const response = await request(app)
    .get("/tasks")
    .expect(200);

  assert.ok(Array.isArray(response.body));
  assert.ok(response.body.length > 0);
});