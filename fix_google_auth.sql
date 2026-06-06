-- Fix for Google Authentication: Make passwordHash nullable and add googleId column if missing
-- This allows users to sign in with Google without a password

-- Check and add googleId column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'googleId'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "googleId" TEXT UNIQUE;
    END IF;
END $$;

-- Make passwordHash nullable to support Google OAuth users
ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- Add index on googleId for faster lookups
CREATE INDEX IF NOT EXISTS "users_googleId_idx" ON "users"("googleId");
