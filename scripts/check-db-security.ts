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
      c.relname AS table_name,
      c.relrowsecurity AS row_security_enabled,
      c.relforcerowsecurity AS force_row_security
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'CompanyBank';
  `);

  console.log(result.rows);

  const policies = await client.query(`
    SELECT
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'CompanyBank';
  `);

  console.log("POLICIES:");
  console.log(policies.rows);
}

main()
  .catch(console.error)
  .finally(() => client.end());
