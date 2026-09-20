import PocketBase from "pocketbase";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());
const required = ["POCKETBASE_URL", "POCKETBASE_SUPERUSER_EMAIL", "POCKETBASE_SUPERUSER_PASSWORD"];
if (required.some((key) => !process.env[key])) throw new Error("Falta la configuracion de PocketBase.");

const pb = new PocketBase(process.env.POCKETBASE_URL);
await pb.collection("_superusers").authWithPassword(
  process.env.POCKETBASE_SUPERUSER_EMAIL,
  process.env.POCKETBASE_SUPERUSER_PASSWORD,
);

let collection;
try {
  collection = await pb.collections.getOne("sellers");
} catch (error) {
  if (error.status !== 404) throw error;
  collection = await pb.collections.create({
    name: "sellers",
    type: "auth",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    manageRule: null,
    authRule: "",
    passwordAuth: { enabled: true, identityFields: ["email"] },
    authToken: { duration: 28800 },
    fields: [{ name: "name", type: "text", max: 120 }],
  });
  console.log("Coleccion sellers creada; solo el administrador puede gestionar cuentas.");
}
if (collection.type !== "auth" || !collection.passwordAuth?.enabled) {
  throw new Error("sellers debe ser una coleccion de autenticacion con contrasena habilitada.");
}

// One-time migration only; normal operation never reads seller credentials from env.
if (process.argv.includes("--migrate-local-seller")) {
  const email = process.env.SELLER_EMAIL;
  const password = process.env.SELLER_PASSWORD;
  if (!email || !password) throw new Error("No hay credenciales locales para migrar.");
  const existing = await pb.collection("sellers").getList(1, 1, {
    filter: pb.filter("email = {:email}", { email }),
  });
  if (!existing.items.length) {
    await pb.collection("sellers").create({ email, password, passwordConfirm: password, name: "Administrador" });
    console.log("Cuenta local migrada a sellers.");
  } else {
    console.log("La cuenta ya existe; no se modifica su contrasena.");
  }
  const seller = new PocketBase(process.env.POCKETBASE_URL);
  await seller.collection("sellers").authWithPassword(email, password);
  console.log("Acceso del vendedor verificado.");
}
console.log("Gestionar vendedores en PocketBase: Collections > sellers > New record.");
