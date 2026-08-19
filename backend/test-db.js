const { Client } = require("pg");

const client = new Client({
  host: "db.lpuqchxtclusezwacvzg.supabase.co",
  port: 5432,
  user: "postgres",
  password: "FaM-T8$NxEtkg*j",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    await client.connect();
    console.log("✅ DATABASE CONNECTED");
    await client.end();
  } catch (error) {
    console.error("❌ CONNECTION FAILED");
    console.error(error.message);
  }
})();
