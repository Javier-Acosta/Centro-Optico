import PocketBase from "pocketbase";
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
const ownerEmail = process.argv[2];
if (!ownerEmail) throw new Error("Uso: node scripts/setup-seller-roles.mjs email-del-administrador");
const pb = new PocketBase(process.env.POCKETBASE_URL);
await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL, process.env.POCKETBASE_SUPERUSER_PASSWORD);
const owner = await pb.collection("sellers").getFirstListItem(pb.filter("email = {:email}", { email: ownerEmail }));
const collection = await pb.collections.getOne("sellers");
const fields = [...collection.fields];
if (!fields.some(f => f.name === "role")) fields.push({ name: "role", type: "select", maxSelect: 1, values: ["admin", "assistant"] });
if (!fields.some(f => f.name === "disabled")) fields.push({ name: "disabled", type: "bool" });
await pb.collections.update(collection.id, { fields });
const records = await pb.collection("sellers").getFullList();
for (const record of records) {
  if (record.id === owner.id) {
    if (record.role !== "admin") await pb.collection("sellers").update(record.id, { role: "admin" });
  } else if (!record.role) {
    await pb.collection("sellers").update(record.id, { role: "assistant" });
  }
}
await pb.collections.update(collection.id, {
  authRule: 'disabled = false && (role = "admin" || role = "assistant")',
  listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null, manageRule: null,
});
console.log("Roles configurados. El administrador conserva su cuenta; los ayudantes no pueden gestionar usuarios directamente.");
