// Script to reset database tables
require('dotenv').config();
const postgres = require('postgres');

async function resetDatabase() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('Dropping existing tables...');
    await sql`DROP TABLE IF EXISTS messages CASCADE`;
    await sql`DROP TABLE IF EXISTS conversations CASCADE`;
    console.log('✓ Tables dropped successfully');

    await sql.end();
    console.log('\nNow run: npm run db:migrate');
  } catch (error) {
    console.error('Error:', error.message);
    await sql.end();
    process.exit(1);
  }
}

resetDatabase();
