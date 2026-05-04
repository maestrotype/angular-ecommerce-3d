const { Client } = require('pg');
const client = new Client({
  host: 'aws-0-eu-north-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.vfgebhwlaoeswtmtotfx',
  password: 'Maestro1983',
  database: 'postgres',
});
client.connect().then(async () => {
  console.log("Connected");
  try {
    await client.query('ALTER TABLE products ADD COLUMN "localModel3dUrl" varchar;');
    console.log("Column added");
  } catch (err) {
    console.error("Error adding column:", err.message);
  }
  await client.end();
});
