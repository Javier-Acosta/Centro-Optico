import PocketBase from "pocketbase";
import { readFile } from "node:fs/promises";

function parseEnv(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^[ '\"]|[ '\"]$/g, "")];
      }),
  );
}

const env = parseEnv(await readFile(".env.local", "utf8"));
const required = ["POCKETBASE_URL", "POCKETBASE_SUPERUSER_EMAIL", "POCKETBASE_SUPERUSER_PASSWORD"];
const missing = required.filter((key) => !env[key]);
if (missing.length) throw new Error(`Faltan variables: ${missing.join(", ")}`);

const pb = new PocketBase(env.POCKETBASE_URL);
await pb.collection("_superusers").authWithPassword(env.POCKETBASE_SUPERUSER_EMAIL, env.POCKETBASE_SUPERUSER_PASSWORD);

async function exists(name) {
  try {
    return await pb.collections.getOne(name);
  } catch (error) {
    if (error?.status === 404) return null;
    throw error;
  }
}

async function ensureCollection(config) {
  const current = await exists(config.name);
  if (current) {
    console.log(`ok ${config.name}`);
    return current;
  }
  await pb.collections.create(config);
  console.log(`created ${config.name}`);
}

async function ensureField(collection, field) {
  if (collection.fields?.some((current) => current.name === field.name)) return collection;
  const updated = await pb.collections.update(collection.id, {
    fields: [...collection.fields, field],
  });
  console.log(`added field ${collection.name}.${field.name}`);
  return updated;
}

let productsCollection = await ensureCollection({
  name: "products",
  type: "base",
  listRule: "published = true",
  viewRule: "published = true",
  createRule: null,
  updateRule: null,
  deleteRule: null,
  fields: [
    { name: "name", type: "text", required: true, max: 120 },
    { name: "description", type: "editor", required: false, maxSize: 4000 },
    { name: "priceMinor", type: "number", required: true, min: 1, onlyInt: true },
    { name: "currency", type: "text", required: true, max: 3, min: 3 },
    { name: "published", type: "bool", required: false },
    { name: "sold", type: "bool", required: false },
    { name: "image", type: "file", required: true, maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp"] },
  ],
  indexes: [],
});
productsCollection = await ensureField(productsCollection, { name: "sold", type: "bool", required: false });

const ordersCollection = await ensureCollection({
  name: "orders",
  type: "base",
  listRule: null,
  viewRule: "publicToken = @request.query.token",
  createRule: null,
  updateRule: null,
  deleteRule: null,
  fields: [
    { name: "email", type: "email", required: true },
    { name: "publicToken", type: "text", required: true, min: 32, max: 80 },
    { name: "status", type: "select", required: true, maxSelect: 1, values: ["pending", "approved", "rejected"] },
    { name: "totalMinor", type: "number", required: true, min: 1, onlyInt: true },
    { name: "currency", type: "text", required: true, max: 3, min: 3 },
  ],
  indexes: ["CREATE UNIQUE INDEX idx_orders_publicToken ON orders (publicToken)"],
});

await ensureCollection({
  name: "order_items",
  type: "base",
  listRule: null,
  viewRule: null,
  createRule: null,
  updateRule: null,
  deleteRule: null,
  fields: [
    { name: "order", type: "relation", required: true, collectionId: ordersCollection.id, cascadeDelete: true, maxSelect: 1 },
    { name: "product", type: "relation", required: false, collectionId: productsCollection.id, cascadeDelete: false, maxSelect: 1 },
    { name: "productName", type: "text", required: true, max: 120 },
    { name: "unitPriceMinor", type: "number", required: true, min: 1, onlyInt: true },
    { name: "quantity", type: "number", required: true, min: 1, onlyInt: true },
    { name: "subtotalMinor", type: "number", required: true, min: 1, onlyInt: true },
  ],
});

await ensureCollection({
  name: "payment_attempts",
  type: "base",
  listRule: null,
  viewRule: null,
  createRule: null,
  updateRule: null,
  deleteRule: null,
  fields: [
    { name: "order", type: "relation", required: true, collectionId: ordersCollection.id, cascadeDelete: true, maxSelect: 1 },
    { name: "provider", type: "text", required: true, max: 40 },
    { name: "externalReference", type: "text", required: true, max: 120 },
    { name: "providerPaymentId", type: "text", required: false, max: 120 },
    { name: "status", type: "select", required: true, maxSelect: 1, values: ["pending", "approved", "rejected"] },
  ],
  indexes: ["CREATE UNIQUE INDEX idx_payment_attempts_externalReference ON payment_attempts (externalReference)"],
});

console.log("PocketBase listo para Tienda Cata.");





