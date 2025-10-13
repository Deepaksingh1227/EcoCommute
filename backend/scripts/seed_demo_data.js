// optional: creates a sample user and sample route in DB
const { pool } = require("../db");

async function seed() {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO users (name, email) VALUES ('Demo User','demo@example.com')`
    );
    console.log("Seeded demo user");
  } finally {
    client.release();
    process.exit(0);
  }
}
seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
