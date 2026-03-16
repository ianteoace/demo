CREATE TYPE "Currency" AS ENUM ('ARS', 'USD');

ALTER TABLE "Property"
ADD COLUMN "currency" "Currency";

UPDATE "Property"
SET "currency" = CASE
  WHEN "operationType" = 'RENT' THEN 'ARS'::"Currency"
  ELSE 'USD'::"Currency"
END
WHERE "currency" IS NULL;

ALTER TABLE "Property"
ALTER COLUMN "currency" SET NOT NULL;

ALTER TABLE "Property"
ALTER COLUMN "price" TYPE INTEGER USING ROUND("price")::INTEGER;
