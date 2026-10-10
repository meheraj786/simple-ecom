import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { after, before, test } from "node:test";
import app from "./app.js";

let server: Server;
let baseUrl: string;

before(async () => {
  server = app.listen(0);
  await once(server, "listening");

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Test server did not bind to a TCP port");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("health route reports a healthy service", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.status, "ok");
});

test("admin dashboard requires authentication", async () => {
  const response = await fetch(`${baseUrl}/api/admin/dashboard`);

  assert.equal(response.status, 401);
});

test("catalog mutations require authentication", async () => {
  const response = await fetch(`${baseUrl}/api/products`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Unauthenticated product" }),
  });

  assert.equal(response.status, 401);
});

test("order tracking rejects incomplete input before database access", async () => {
  const response = await fetch(`${baseUrl}/api/orders/track`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ orderId: "order-id" }),
  });

  assert.equal(response.status, 400);
});

test("contact form rejects invalid input before database access", async () => {
  const response = await fetch(`${baseUrl}/api/contact-messages`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "", email: "invalid", message: "" }),
  });

  assert.equal(response.status, 400);
});
