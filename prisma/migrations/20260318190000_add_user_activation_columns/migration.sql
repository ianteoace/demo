-- Align User auth columns expected by current NextAuth/Auth.js flow.
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "mustSetPassword" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "passwordSetupToken" TEXT;

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "passwordSetupExpiresAt" TIMESTAMP(3);

-- Existing users with passwordHash should be able to log in immediately.
UPDATE "User"
SET "mustSetPassword" = false
WHERE "passwordHash" IS NOT NULL;

-- Keep token uniqueness once column exists.
CREATE UNIQUE INDEX IF NOT EXISTS "User_passwordSetupToken_key"
ON "User"("passwordSetupToken");