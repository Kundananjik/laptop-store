const ALLOWED_SORT_FIELDS = new Set(["price", "title", "createdAt", "quantity"]);
const ALLOWED_CATEGORIES = new Set(["gaming", "business", "ultrabook", "student", "creator", "general"]);

function toNumber(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  return parsed;
}

function normalizeText(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  return String(value).trim();
}

function normalizeLaptopPayload(payload, { partial = false } = {}) {
  const normalized = {};
  const title = normalizeText(payload.title);
  const brand = normalizeText(payload.brand);
  const category = normalizeText(payload.category)?.toLowerCase();
  const processor = normalizeText(payload.processor);
  const description = normalizeText(payload.description);

  if (!partial || title !== undefined) {
    if (!title) {
      throw new Error("title is required");
    }
    normalized.title = title;
  }

  if (!partial || brand !== undefined) {
    if (!brand) {
      throw new Error("brand is required");
    }
    normalized.brand = brand;
  }

  if (!partial || category !== undefined) {
    if (!category || !ALLOWED_CATEGORIES.has(category)) {
      throw new Error("category must be one of gaming, business, ultrabook, student, creator, general");
    }
    normalized.category = category;
  }

  if (!partial || processor !== undefined) {
    if (!processor) {
      throw new Error("processor is required");
    }
    normalized.processor = processor;
  }

  if (!partial || description !== undefined) {
    normalized.description = description || "";
  }

  const price = toNumber(payload.price, "price");
  if (!partial || price !== undefined) {
    if (price === undefined || price < 0) {
      throw new Error("price must be a non-negative number");
    }
    normalized.price = price;
  }

  const quantity = toNumber(payload.quantity, "quantity");
  if (!partial || quantity !== undefined) {
    if (quantity === undefined || quantity < 0 || !Number.isInteger(quantity)) {
      throw new Error("quantity must be a non-negative integer");
    }
    normalized.quantity = quantity;
  }

  const ramGb = toNumber(payload.ramGb, "ramGb");
  if (!partial || ramGb !== undefined) {
    if (ramGb === undefined || ramGb <= 0) {
      throw new Error("ramGb must be a positive number");
    }
    normalized.ramGb = ramGb;
  }

  const storageGb = toNumber(payload.storageGb, "storageGb");
  if (!partial || storageGb !== undefined) {
    if (storageGb === undefined || storageGb <= 0) {
      throw new Error("storageGb must be a positive number");
    }
    normalized.storageGb = storageGb;
  }

  return normalized;
}

function buildLaptopQuery(query) {
  const filters = {};
  const search = normalizeText(query.q);
  const brand = normalizeText(query.brand);
  const category = normalizeText(query.category)?.toLowerCase();
  const minPrice = toNumber(query.minPrice, "minPrice");
  const maxPrice = toNumber(query.maxPrice, "maxPrice");
  const inStock = query.inStock;
  const sortField = normalizeText(query.sort) || "createdAt";
  const sortOrder = normalizeText(query.order) === "asc" ? 1 : -1;

  if (search) {
    filters.$or = [
      { title: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { processor: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (brand) {
    filters.brand = { $regex: `^${brand}$`, $options: "i" };
  }

  if (category) {
    filters.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filters.price = {};
    if (minPrice !== undefined) {
      filters.price.$gte = minPrice;
    }
    if (maxPrice !== undefined) {
      filters.price.$lte = maxPrice;
    }
  }

  if (String(inStock).toLowerCase() === "true") {
    filters.quantity = { ...(filters.quantity || {}), $gt: 0 };
  }

  return {
    filters,
    sort: {
      [ALLOWED_SORT_FIELDS.has(sortField) ? sortField : "createdAt"]: sortOrder,
    },
  };
}

module.exports = {
  ALLOWED_CATEGORIES,
  buildLaptopQuery,
  normalizeLaptopPayload,
};
