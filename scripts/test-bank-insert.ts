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

  const accountNumber = process.env.COMPANY_BANK_ACCOUNT_NUMBER;

  if (!accountNumber) {
    throw new Error("COMPANY_BANK_ACCOUNT_NUMBER is missing from .env");
  }

  const result = await client.query(
    `
    INSERT INTO "CompanyBank"
      (
        "id",
        "companyName",
        "bankName",
        "accountNumber",
        "branchCode",
        "accountType",
        "supportEmail",
        "supportPhone",
        "isActive",
        "createdAt",
        "updatedAt"
      )
    VALUES
      (
        gen_random_uuid()::text,
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        true,
        NOW(),
        NOW()
      )
    RETURNING
      "id",
      "companyName",
      "bankName",
      "accountType",
      "branchCode",
      "isActive"
    `,
    [
      "icetropez.vest",
      "ABSA",
      accountNumber,
      "632005",
      "Cheque",
      "help@icetropez.net",
      "0833949936",
    ],
  );

  console.log("INSERT SUCCESS:");
  console.log(result.rows[0]);
}

main()
  .catch((error) => {
    console.error("DIRECT INSERT ERROR:");
    console.error(error);
    process.exit(1);
  })
  .finally(() => client.end());
