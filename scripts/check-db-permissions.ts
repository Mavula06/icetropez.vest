import "dotenv/config";
import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function main() {
  await client.connect();

  const result = await client.query(`
    SELECT
      current_user,
      current_database(),
      has_table_privilege(current_user, 'public."CompanyBank"', 'SELECT') AS can_select,
      has_table_privilege(current_user, 'public."CompanyBank"', 'INSERT') AS can_insert,
      has_table_privilege(current_user, 'public."CompanyBank"', 'UPDATE') AS can_update,
      has_table_privilege(current_user, 'public."CompanyBank"', 'DELETE') AS can_delete
  `);

  console.log(result.rows[0]);
}

main()
  .catch(console.error)
  .finally(() => client.end());
