const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const Laptop = require("../models/Laptop");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

const runDbTests = process.env.RUN_DB_TESTS === "true" && !!process.env.MONGO_URI;

test("db-backed checkout flow", { skip: !runDbTests }, async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([Laptop.deleteMany({}), Cart.deleteMany({}), Order.deleteMany({})]);

  const laptop = await Laptop.create({
    title: "MacBook Air 15",
    brand: "Apple",
    category: "ultrabook",
    processor: "M3",
    description: "Thin and light",
    price: 1899,
    quantity: 5,
    ramGb: 16,
    storageGb: 512,
    image: "",
  });

  const addCartResponse = await request(app)
    .post("/api/cart/items")
    .set("x-session-id", "db-test-session")
    .send({ laptopId: laptop._id.toString(), quantity: 2 });
  assert.equal(addCartResponse.status, 201);

  const checkoutResponse = await request(app)
    .post("/api/orders/checkout")
    .set("x-session-id", "db-test-session")
    .send({
      customer: {
        fullName: "Test User",
        email: "test@example.com",
        phone: "+260000000000",
        address: "Lusaka",
      },
    });

  assert.equal(checkoutResponse.status, 201);
  assert.equal(checkoutResponse.body.itemCount, 2);

  await Promise.all([Laptop.deleteMany({}), Cart.deleteMany({}), Order.deleteMany({})]);
  await mongoose.disconnect();
});
