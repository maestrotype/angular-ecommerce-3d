const { Client } = require('pg');
const client = new Client({
  host: 'aws-0-eu-north-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.vfgebhwlaoeswtmtotfx',
  password: 'Maestro1983',
  database: 'postgres',
});
client.connect().then(async () => {
  try {
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='products' AND column_name='localModel3dUrl';
    `);
    console.log("Column exists:", res.rows.length > 0);
  } catch (err) {
    console.error("Error:", err.message);
  }
  await client.end();
});
