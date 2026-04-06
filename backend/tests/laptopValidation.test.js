const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildLaptopQuery,
  normalizeLaptopPayload,
} = require("../utils/laptopValidation");

test("normalizeLaptopPayload validates and normalizes required fields", () => {
  const payload = normalizeLaptopPayload({
    title: "  ThinkPad X1 Carbon  ",
    brand: " Lenovo ",
    category: "Business",
    processor: "Intel Core Ultra 7",
    description: " Lightweight workstation ",
    price: "2599",
    quantity: "4",
    ramGb: "32",
    storageGb: "1000",
  });

  assert.deepEqual(payload, {
    title: "ThinkPad X1 Carbon",
    brand: "Lenovo",
    category: "business",
    processor: "Intel Core Ultra 7",
    description: "Lightweight workstation",
    price: 2599,
    quantity: 4,
    ramGb: 32,
    storageGb: 1000,
  });
});

test("normalizeLaptopPayload rejects invalid quantities", () => {
  assert.throws(
    () =>
      normalizeLaptopPayload(
        {
          title: "Laptop",
          brand: "Brand",
          category: "gaming",
          processor: "CPU",
          price: 1000,
          quantity: -1,
          ramGb: 16,
          storageGb: 512,
        },
        { partial: false }
      ),
    /quantity must be a non-negative integer/
  );
});

test("buildLaptopQuery returns filters and safe sorting", () => {
  const result = buildLaptopQuery({
    q: "asus",
    brand: "ASUS",
    category: "gaming",
    minPrice: "1000",
    maxPrice: "2500",
    inStock: "true",
    sort: "price",
    order: "asc",
  });

  assert.equal(result.filters.category, "gaming");
  assert.equal(result.filters.price.$gte, 1000);
  assert.equal(result.filters.price.$lte, 2500);
  assert.equal(result.filters.quantity.$gt, 0);
  assert.equal(result.sort.price, 1);
  assert.equal(Array.isArray(result.filters.$or), true);
});
