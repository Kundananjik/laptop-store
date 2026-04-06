const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../app");
const Laptop = require("../models/Laptop");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

function createId(value) {
  return {
    toString: () => value,
  };
}

function createLaptopDocument(data) {
  return {
    ...data,
    _id: createId(data._id),
    async save() {
      return this;
    },
  };
}

function createCartDocument(state) {
  const document = {
    _id: createId(state._id),
    sessionId: state.sessionId,
    isModified() {
      return false;
    },
    async save() {
      return this;
    },
  };

  const wrapItem = (entry) => ({
    _id: createId(entry._id),
    get laptop() {
      return entry.laptop;
    },
    set laptop(value) {
      entry.laptop = value;
    },
    get quantity() {
      return entry.quantity;
    },
    set quantity(value) {
      entry.quantity = value;
    },
    deleteOne() {
      state.items = state.items.filter((item) => item._id !== entry._id);
    },
  });

  const buildItemsArray = () => {
    const items = state.items.map((item) => wrapItem(item));
    items.id = (itemId) => items.find((item) => item._id.toString() === itemId);
    items.push = (value) => {
      const laptopId =
        value.laptop?._id?.toString?.() || value.laptop?.toString?.() || String(value.laptop);
      const laptop = state.catalog.find((entry) => entry._id.toString() === laptopId);
      const entry = {
        _id: `item-${state.items.length + 1}`,
        laptop,
        quantity: value.quantity,
      };
      state.items.push(entry);
      return Array.prototype.push.call(items, wrapItem(entry));
    };
    return items;
  };

  Object.defineProperty(document, "items", {
    get() {
      return buildItemsArray();
    },
    set(value) {
      state.items = value.map((item, index) => ({
        _id: item._id?.toString?.() || `item-${index + 1}`,
        laptop: item.laptop,
        quantity: item.quantity,
      }));
    },
    configurable: true,
    enumerable: true,
  });

  return document;
}

function setupData() {
  const catalog = [
    createLaptopDocument({
      _id: "laptop-1",
      title: "Zenbook 14",
      brand: "ASUS",
      category: "creator",
      processor: "Ryzen 7",
      description: "Portable creator laptop",
      price: 1400,
      quantity: 3,
      ramGb: 16,
      storageGb: 512,
      image: "/uploads/zenbook.png",
    }),
  ];
  const carts = [];
  const orders = [];

  Laptop.find = () => ({
    sort: async () => catalog,
  });
  Laptop.findById = async (id) => catalog.find((item) => item._id.toString() === id) || null;
  Laptop.findByIdAndUpdate = async (id, payload) => {
    const laptop = catalog.find((item) => item._id.toString() === id);
    if (!laptop) {
      return null;
    }
    Object.assign(laptop, payload);
    return laptop;
  };
  Laptop.findByIdAndDelete = async (id) => {
    const index = catalog.findIndex((item) => item._id.toString() === id);
    if (index === -1) {
      return null;
    }
    const [deleted] = catalog.splice(index, 1);
    return deleted;
  };

  Cart.findOne = ({ sessionId }) => ({
    async populate() {
      const cart = carts.find((entry) => entry.sessionId === sessionId);
      return cart ? createCartDocument(cart) : null;
    },
  });
  Cart.create = async ({ sessionId }) => {
    const cart = {
      _id: `cart-${carts.length + 1}`,
      sessionId,
      items: [],
      catalog,
    };
    carts.push(cart);
    return { _id: cart._id };
  };
  Cart.findById = (id) => ({
    async populate() {
      const targetId = id?.toString?.() || id;
      const cart = carts.find((entry) => entry._id === targetId);
      return cart ? createCartDocument(cart) : null;
    },
  });

  Order.create = async (payload) => {
    const order = {
      _id: createId(`order-${orders.length + 1}`),
      ...payload,
      createdAt: new Date("2026-04-06T00:00:00Z"),
    };
    orders.push(order);
    return order;
  };

  return { catalog, carts, orders };
}

test("GET /api/health returns ok", async () => {
  const response = await request(app).get("/api/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
});

test("API cart and checkout flow works through the app routes", async () => {
  const data = setupData();
  const sessionId = "integration-session";

  const listResponse = await request(app).get("/api/laptops");
  assert.equal(listResponse.status, 200);
  assert.equal(listResponse.body.length, 1);

  const addResponse = await request(app)
    .post("/api/cart/items")
    .set("x-session-id", sessionId)
    .send({ laptopId: "laptop-1", quantity: 2 });
  assert.equal(addResponse.status, 201);
  assert.equal(addResponse.body.itemCount, 2);
  assert.equal(addResponse.body.total, 2800);

  const cartItemId = addResponse.body.items[0].itemId;
  const updateResponse = await request(app)
    .put(`/api/cart/items/${cartItemId}`)
    .set("x-session-id", sessionId)
    .send({ quantity: 3 });
  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.body.total, 4200);

  const checkoutResponse = await request(app)
    .post("/api/orders/checkout")
    .set("x-session-id", sessionId);
  assert.equal(checkoutResponse.status, 400);
});

test("API cart and checkout flow works through the app routes with customer data", async () => {
  const data = setupData();
  const sessionId = "integration-session-customer";

  await request(app)
    .post("/api/cart/items")
    .set("x-session-id", sessionId)
    .send({ laptopId: "laptop-1", quantity: 2 });

  const checkoutResponse = await request(app)
    .post("/api/orders/checkout")
    .set("x-session-id", sessionId)
    .send({
      customer: {
        fullName: "Integration Tester",
        email: "integration@example.com",
        phone: "+260111111111",
        address: "Test Address",
      },
    });
  assert.equal(checkoutResponse.status, 201);
  assert.equal(checkoutResponse.body.total, 2800);
  assert.equal(data.catalog[0].quantity, 1);
  assert.equal(data.orders.length, 1);

  const cartResponse = await request(app).get("/api/cart").set("x-session-id", sessionId);
  assert.equal(cartResponse.status, 200);
  assert.equal(cartResponse.body.items.length, 0);
});
