import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as schema from './schema';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// PostgreSQL connection
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);

// Drizzle instance
export const db = drizzle(client, { schema });

// Supabase client (for future features like storage, real-time, etc.)
export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);
