import { db } from "./client";
import { users } from "./schema";

async function main() {
  await db
    .insert(users)
    .values({ email: "demo@example.com", name: "Demo User" })
    .onConflictDoNothing({ target: users.email });
  console.log("Seeded database");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$client.end());
