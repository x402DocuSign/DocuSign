#!/usr/bin/env node
/**
 * Fix Google Authentication Database Schema
 * This script applies the necessary database changes to support Google OAuth
 */

const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('âŒ DATABASE_URL not found in .env.local');
  process.exit(1);
}

const client = new Client({ connectionString });

const fixSQL = `
-- Check and add googleId column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'googleId'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "googleId" TEXT UNIQUE;
        RAISE NOTICE 'Added googleId column';
    ELSE
        RAISE NOTICE 'googleId column already exists';
    END IF;
END $$;

-- Make passwordHash nullable to support Google OAuth users
ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- Add index on googleId for faster lookups
CREATE INDEX IF NOT EXISTS "users_googleId_idx" ON "users"("googleId");

-- Verify the changes
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('passwordHash', 'googleId')
ORDER BY column_name;
`;

async function applyFix() {
  try {
    console.log('ðŸ”§ Connecting to database...');
    await client.connect();
    console.log('âœ… Connected');

    console.log('\nðŸ“ Applying Google Auth schema fixes...');
    const result = await client.query(fixSQL);

    console.log('âœ… Schema fixes applied successfully!');
    console.log('\nðŸ“Š Column information:');
    if (result.rows && result.rows.length > 0) {
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
    }

    console.log('\nâœ¨ Database is now ready for Google authentication!');
  } catch (error) {
    console.error('âŒ Error applying fixes:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyFix();
