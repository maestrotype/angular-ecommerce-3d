const { Client } = require('./node_modules/pg');
require('./node_modules/dotenv/config');

const TASK_ID = 'cb82671c-1c13-46dd-9f71-3b5e61e2785a';

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || process.env.POSTGRES_USER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD,
    database: process.env.DB_NAME || process.env.POSTGRES_DB || 'ecommerce_db',
  });

  try {
    console.log('Connecting to DB with:', {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USERNAME || 'postgres',
      database: process.env.DB_NAME || 'ecommerce_db',
    });

    await client.connect();
    const r = await client.query("SELECT value FROM settings WHERE key='tripo3d.apiKey'");
    const key = r.rows[0]?.value;
    console.log('Key (first 15 chars):', key ? key.substring(0, 15) + '...' : 'NOT FOUND');

    if (!key) return;

    const https = require('https');
    const options = {
      hostname: 'api.tripo3d.ai',
      path: `/v2/openapi/task/${TASK_ID}`,
      headers: { 'Authorization': `Bearer ${key}` }
    };

    const result = await new Promise((resolve, reject) => {
      https.get(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    console.log('\nTRIPO3D RESPONSE:');
    console.log(JSON.stringify(result, null, 2));

    const task = result.data;
    if (task) {
      console.log('\n\n=== KEY FIELDS ===');
      console.log('status:', task.status);
      console.log('progress:', task.progress);
      console.log('result:', JSON.stringify(task.result));
      if (task.result?.model) {
        console.log('result.model:', JSON.stringify(task.result.model));
        console.log('result.model type:', typeof task.result.model);
        if (typeof task.result.model === 'object') {
          console.log('result.model.url:', task.result.model.url);
        } else {
          console.log('model is a STRING:', task.result.model);
        }
      }
    }
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch(console.error);
