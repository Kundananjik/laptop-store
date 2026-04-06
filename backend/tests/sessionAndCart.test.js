const test = require("node:test");
const assert = require("node:assert/strict");
const { getSessionId } = require("../utils/session");
const { mapCart } = require("../utils/cart");

test("getSessionId returns the request header value", () => {
  const sessionId = getSessionId({
    headers: {
      "x-session-id": "demo-session",
    },
  });

  assert.equal(sessionId, "demo-session");
});

test("getSessionId throws when the header is missing", () => {
  assert.throws(() => getSessionId({ headers: {} }), /x-session-id header is required/);
});

test("mapCart returns totals and flattened items", () => {
  const cart = {
    _id: { toString: () => "cart-1" },
    sessionId: "demo-session",
    items: [
      {
        _id: { toString: () => "item-1" },
        quantity: 2,
        laptop: {
          _id: { toString: () => "laptop-1" },
          title: "Zenbook 14",
          brand: "ASUS",
          image: "/uploads/demo.png",
          price: 1400,
          quantity: 5,
        },
      },
    ],
  };

  const result = mapCart(cart);
  assert.equal(result.total, 2800);
  assert.equal(result.itemCount, 2);
  assert.equal(result.items[0].lineTotal, 2800);
  assert.equal(result.items[0].stock, 5);
});
